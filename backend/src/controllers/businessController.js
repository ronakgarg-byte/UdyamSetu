const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

async function saveBusiness(req, res) {
  try {
    const { userId } = req.params;
    const {
      type,
      what,
      workers,
      hours,
      address,
      location,
      district,
      state,
      pincode,
      lat,
      lng,
      portal_type,
      portalType,
      interests,
      skills,
      capital_range,
      capitalRange,
      space_type,
      spaceType,
      time_commitment,
      timeCommitment,
      risk_appetite,
      riskAppetite,
      barriers,
      growth_aspiration,
      growthAspiration,
      growth_barriers,
      growthBarriers,
      credit_history,
      creditHistory,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const workersNum = workers !== undefined && workers !== '' ? parseInt(workers, 10) : 0;
    const resolvedPortalType = portal_type || portalType || 'existing';
    const resolvedInterests = Array.isArray(interests) ? interests.join(', ') : (interests || '');
    const resolvedSkills = Array.isArray(skills) ? skills.join(', ') : (skills || '');
    const resolvedCapitalRange = capital_range || capitalRange || '';
    const resolvedSpaceType = space_type || spaceType || '';
    const resolvedTimeCommitment = time_commitment || timeCommitment || '';
    const resolvedRiskAppetite = risk_appetite || riskAppetite || '';
    const resolvedBarriers = Array.isArray(barriers) ? barriers.join(', ') : (barriers || '');
    const resolvedGrowthAspiration = growth_aspiration || growthAspiration || '';
    const resolvedGrowthBarriers = Array.isArray(growth_barriers || growthBarriers)
      ? (growth_barriers || growthBarriers).join(', ')
      : (growth_barriers || growthBarriers || '');
    const resolvedCreditHistory = credit_history || creditHistory || '';

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO businesses (
          user_id, type, what, workers, hours, portal_type,
          interests, skills, capital_range, space_type, time_commitment, risk_appetite, barriers,
          growth_aspiration, growth_barriers, credit_history, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           type = EXCLUDED.type,
           what = EXCLUDED.what,
           workers = EXCLUDED.workers,
           hours = EXCLUDED.hours,
           portal_type = EXCLUDED.portal_type,
           interests = EXCLUDED.interests,
           skills = EXCLUDED.skills,
           capital_range = EXCLUDED.capital_range,
           space_type = EXCLUDED.space_type,
           time_commitment = EXCLUDED.time_commitment,
           risk_appetite = EXCLUDED.risk_appetite,
           barriers = EXCLUDED.barriers,
           growth_aspiration = EXCLUDED.growth_aspiration,
           growth_barriers = EXCLUDED.growth_barriers,
           credit_history = EXCLUDED.credit_history,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userId,
          type || '',
          what || '',
          workersNum,
          hours || '',
          resolvedPortalType,
          resolvedInterests,
          resolvedSkills,
          resolvedCapitalRange,
          resolvedSpaceType,
          resolvedTimeCommitment,
          resolvedRiskAppetite,
          resolvedBarriers,
          resolvedGrowthAspiration,
          resolvedGrowthBarriers,
          resolvedCreditHistory,
        ]
      );
      return res.json({
        success: true,
        business: {
          ...result.rows[0],
          address,
          location,
          district,
          state,
          pincode,
          lat,
          lng,
        },
      });
    } else {
      const existing = inMemoryStore.businesses.get(userId) || {
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      const business = {
        ...existing,
        type: type || existing.type || '',
        what: what || existing.what || '',
        workers: workersNum,
        hours: hours || existing.hours || '',
        portal_type: resolvedPortalType,
        interests: resolvedInterests || existing.interests || '',
        skills: resolvedSkills || existing.skills || '',
        capital_range: resolvedCapitalRange || existing.capital_range || '',
        space_type: resolvedSpaceType || existing.space_type || '',
        time_commitment: resolvedTimeCommitment || existing.time_commitment || '',
        risk_appetite: resolvedRiskAppetite || existing.risk_appetite || '',
        barriers: resolvedBarriers || existing.barriers || '',
        growth_aspiration: resolvedGrowthAspiration || existing.growth_aspiration || '',
        growth_barriers: resolvedGrowthBarriers || existing.growth_barriers || '',
        credit_history: resolvedCreditHistory || existing.credit_history || '',
        address: address || existing.address || '',
        location: location || existing.location || '',
        district: district || existing.district || '',
        state: state || existing.state || '',
        pincode: pincode || existing.pincode || '',
        lat: lat !== undefined ? lat : existing.lat || null,
        lng: lng !== undefined ? lng : existing.lng || null,
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.businesses.set(userId, business);
      return res.json({ success: true, business });
    }
  } catch (err) {
    console.error('Error in saveBusiness:', err);
    return res.status(500).json({ error: 'Failed to save business info', details: err.message });
  }
}

async function getBusiness(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query('SELECT * FROM businesses WHERE user_id = $1', [userId]);
      return res.json({ success: true, business: result.rows[0] || null });
    } else {
      const business = inMemoryStore.businesses.get(userId) || null;
      return res.json({ success: true, business });
    }
  } catch (err) {
    console.error('Error in getBusiness:', err);
    return res.status(500).json({ error: 'Failed to retrieve business info', details: err.message });
  }
}

module.exports = {
  saveBusiness,
  getBusiness,
};
