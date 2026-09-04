const { pool, inMemoryStore, isPostgres } = require('../../config/db');
const { getLocalMapsContext } = require('./mapsService');
const { getDistrictCensusData } = require('./censusService');
const { getMandiCommodityPrices } = require('./agmarknetService');
const { getSchemeCatalog } = require('./mySchemeService');

const CACHE_TTL_HOURS = 24;

async function getAggregatedLocalContext(districtName = 'Varanasi') {
  const normalizedKey = (districtName || 'Varanasi').toLowerCase().trim();
  const cacheKey = `district:${normalizedKey}`;

  // 1. Check cache
  if (isPostgres()) {
    try {
      const cached = await pool.query(
        'SELECT data, expires_at FROM local_context_cache WHERE location_key = $1 AND expires_at > CURRENT_TIMESTAMP',
        [cacheKey]
      );
      if (cached.rows.length > 0) {
        return {
          cached: true,
          ...cached.rows[0].data,
        };
      }
    } catch (err) {
      console.warn('[Cache] PostgreSQL cache lookup warning:', err.message);
    }
  } else {
    const cached = inMemoryStore.local_context_cache.get(cacheKey);
    if (cached && new Date(cached.expires_at) > new Date()) {
      return {
        cached: true,
        ...cached.data,
      };
    }
  }

  // 2. Fetch fresh data in parallel
  const [mapsContext, censusData, mandiPricing, schemeCatalog] = await Promise.all([
    getLocalMapsContext(districtName),
    getDistrictCensusData(districtName),
    getMandiCommodityPrices(districtName),
    getSchemeCatalog(),
  ]);

  const aggregatedContext = {
    district: districtName,
    state: censusData.state || 'Uttar Pradesh',
    generatedAt: new Date().toISOString(),
    geography: {
      coordinates: mapsContext.coordinates,
      nearbyVillages: mapsContext.nearbyVillages || [],
      infrastructure: mapsContext.infrastructure || {},
    },
    demographics: {
      population: censusData.totalPopulation,
      ruralRatio: `${censusData.ruralPopulationPct}% Rural / ${censusData.urbanPopulationPct}% Urban`,
      literacyRate: `${censusData.literacyRatePct}%`,
      femaleLiteracyRate: `${censusData.femaleLiteracyRatePct}%`,
      households: censusData.totalHouseholds,
      occupations: censusData.mainOccupations,
      bankingPenetration: `${censusData.bankingPenetrationPct}%`,
    },
    mandiEconomics: {
      reportingMandi: mandiPricing.reportingMandi,
      sentiment: mandiPricing.marketSentiment,
      keyCommodities: mandiPricing.commodities,
    },
    schemesAvailableCount: schemeCatalog.totalSchemesIndexed,
  };

  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  // 3. Save to cache
  if (isPostgres()) {
    try {
      await pool.query(
        `INSERT INTO local_context_cache (location_key, data, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (location_key)
         DO UPDATE SET
           data = EXCLUDED.data,
           expires_at = EXCLUDED.expires_at`,
        [cacheKey, JSON.stringify(aggregatedContext), expiresAt]
      );
    } catch (err) {
      console.warn('[Cache] Failed to persist cache in PostgreSQL:', err.message);
    }
  } else {
    inMemoryStore.local_context_cache.set(cacheKey, {
      data: aggregatedContext,
      expires_at: expiresAt,
    });
  }

  return {
    cached: false,
    ...aggregatedContext,
  };
}

module.exports = {
  getAggregatedLocalContext,
};
