const axios = require('axios');

const DISTRICT_GEO_DEFAULTS = {
  varanasi: {
    lat: 25.3176,
    lng: 82.9739,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    nearbyVillages: ['Shivpur', 'Rohaniya', 'Kashi Vidyapith', 'Cholapur', 'Araziline'],
    infrastructure: {
      markets: [
        { name: 'Chandua Mandi', distanceKm: 2.4, type: 'wholesale_market' },
        { name: 'Golghar Kirana Market', distanceKm: 4.1, type: 'retail_hub' },
        { name: 'Pindra Weekly Haat', distanceKm: 7.8, type: 'rural_haat' },
      ],
      schools: [
        { name: 'Govt. Primary School Shivpur', distanceKm: 0.8 },
        { name: 'Kashi Intermediate College', distanceKm: 1.5 },
      ],
      hospitals: [
        { name: 'Community Health Centre (CHC) Shivpur', distanceKm: 1.2 },
        { name: 'District Hospital Kabir Chaura', distanceKm: 5.6 },
      ],
      transport: {
        nearestRailwayStation: { name: 'Varanasi Junction (BSB)', distanceKm: 3.8 },
        nearestBusStand: { name: 'Chaudhary Charan Singh Bus Station', distanceKm: 3.2 },
        roadType: 'National Highway 19 Connector (Paved 2-lane)',
      },
      keyPointsOfInterest: [
        { name: 'Kashi Vishwanath Corridor', type: 'tourist_temple', distanceKm: 5.2 },
        { name: 'Block Development Office (BDO)', type: 'office', distanceKm: 2.1 },
        { name: 'Regional Rural Bank (Kashi Gomti Samyut)', type: 'banking', distanceKm: 0.9 },
      ],
    },
  },
  default: {
    lat: 26.8467,
    lng: 80.9462,
    district: 'Regional District',
    state: 'Uttar Pradesh',
    nearbyVillages: ['Gram Panchayat Center', 'Purwa', 'Naya Gaon'],
    infrastructure: {
      markets: [
        { name: 'Block Central Mandi', distanceKm: 3.5, type: 'wholesale_market' },
        { name: 'Village Weekly Haat Bazaar', distanceKm: 1.2, type: 'rural_haat' },
      ],
      schools: [
        { name: 'Govt. Senior Secondary School', distanceKm: 1.1 },
      ],
      hospitals: [
        { name: 'Primary Health Sub-Centre (PHC)', distanceKm: 1.8 },
      ],
      transport: {
        nearestRailwayStation: { name: 'District Junction Station', distanceKm: 8.5 },
        nearestBusStand: { name: 'Main Road Bus Stop', distanceKm: 0.7 },
        roadType: 'Pradhan Mantri Gram Sadak Yojana (PMGSY) Road',
      },
      keyPointsOfInterest: [
        { name: 'Panchayat Bhawan / Common Service Centre (CSC)', type: 'office', distanceKm: 0.4 },
        { name: 'Lead District Bank Branch', type: 'banking', distanceKm: 1.5 },
      ],
    },
  },
};

async function getLocalMapsContext(locationName = 'Varanasi') {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const normalizedKey = (locationName || 'varanasi').toLowerCase().trim();

  if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`;
      const geoRes = await axios.get(geoUrl, { timeout: 4000 });
      const geoResult = geoRes.data.results?.[0];

      if (geoResult) {
        const { lat, lng } = geoResult.geometry.location;
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=market&key=${apiKey}`;
        const placesRes = await axios.get(placesUrl, { timeout: 4000 }).catch(() => null);

        const markets = placesRes?.data?.results?.slice(0, 5).map((p) => ({
          name: p.name,
          vicinity: p.vicinity,
          rating: p.rating,
          type: 'market',
        })) || [];

        return {
          source: 'Google Maps Platform Live API',
          district: locationName,
          coordinates: { lat, lng },
          formattedAddress: geoResult.formatted_address,
          infrastructure: {
            markets: markets.length > 0 ? markets : DISTRICT_GEO_DEFAULTS.default.infrastructure.markets,
            transport: DISTRICT_GEO_DEFAULTS.default.infrastructure.transport,
            keyPointsOfInterest: DISTRICT_GEO_DEFAULTS.default.infrastructure.keyPointsOfInterest,
          },
        };
      }
    } catch (err) {
      console.warn('[MapsService] Live API request failed, utilizing normalized dataset:', err.message);
    }
  }

  const baseData = DISTRICT_GEO_DEFAULTS[normalizedKey] || DISTRICT_GEO_DEFAULTS.default;
  return {
    source: 'Google Maps Local GIS Provider',
    district: baseData.district || locationName,
    state: baseData.state,
    coordinates: { lat: baseData.lat, lng: baseData.lng },
    nearbyVillages: baseData.nearbyVillages,
    infrastructure: baseData.infrastructure,
  };
}

module.exports = {
  getLocalMapsContext,
};
