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
      knows_idea,
      knowsIdea,
      idea_category,
      ideaCategory,
      enjoy_doing,
      enjoyDoing,
      trade_training,
      tradeTraining,
      tools_owned,
      toolsOwned,
      space_available,
      spaceAvailable,
      capital_source,
      capitalSource,
      nearby_businesses,
      nearbyBusinesses,
      unmet_need,
      unmetNeed,
      family_support,
      familySupport,
      growth_aspiration,
      growthAspiration,
      growth_barriers,
      growthBarriers,
      credit_history,
      creditHistory,
      growth_intent,
      growthIntent,
      growth_blocker,
      growthBlocker,
      existing_loan_type,
      existingLoanType,
      loan_purpose,
      loanPurpose,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const workersNum = workers !== undefined && workers !== '' ? parseInt(workers, 10) : 0;
    const resolvedPortalType = portal_type || portalType || 'existing';
    const resolvedInterests = Array.isArray(interests) ? interests.join(', ') : (interests || '');
    const resolvedSkills = Array.isArray(skills) ? skills.join(', ') : (skills || '');
    const resolvedCapitalRange = capital_range || capitalRange || '';
    const resolvedSpaceType = space_type || spaceType || space_available || spaceAvailable || '';
    const resolvedTimeCommitment = time_commitment || timeCommitment || '';
    const resolvedRiskAppetite = risk_appetite || riskAppetite || '';
    const resolvedBarriers = Array.isArray(barriers) ? barriers.join(', ') : (barriers || '');
    const resolvedKnowsIdea = knows_idea !== undefined ? String(knows_idea) : (knowsIdea !== undefined ? String(knowsIdea) : '');
    const resolvedIdeaCategory = idea_category || ideaCategory || '';
    const resolvedEnjoyDoing = Array.isArray(enjoy_doing || enjoyDoing) ? (enjoy_doing || enjoyDoing).join(', ') : (enjoy_doing || enjoyDoing || '');
    const resolvedTradeTraining = trade_training || tradeTraining || '';
    const resolvedToolsOwned = Array.isArray(tools_owned || toolsOwned) ? (tools_owned || toolsOwned).join(', ') : (tools_owned || toolsOwned || '');
    const resolvedSpaceAvailable = space_available || spaceAvailable || resolvedSpaceType || '';
    const resolvedCapitalSource = capital_source || capitalSource || '';
    const resolvedNearbyBusinesses = Array.isArray(nearby_businesses || nearbyBusinesses) ? (nearby_businesses || nearbyBusinesses).join(', ') : (nearby_businesses || nearbyBusinesses || '');
    const resolvedUnmetNeed = unmet_need || unmetNeed || '';
    const resolvedFamilySupport = family_support || familySupport || '';
    const resolvedGrowthAspiration = growth_aspiration || growthAspiration || growth_intent || growthIntent || '';
    const resolvedGrowthBarriers = Array.isArray(growth_barriers || growthBarriers || growth_blocker || growthBlocker)
      ? (growth_barriers || growthBarriers || growth_blocker || growthBlocker).join(', ')
      : (growth_barriers || growthBarriers || growth_blocker || growthBlocker || '');
    const resolvedCreditHistory = credit_history || creditHistory || existing_loan_type || existingLoanType || '';
    const resolvedGrowthIntent = growth_intent || growthIntent || resolvedGrowthAspiration || '';
    const resolvedGrowthBlocker = Array.isArray(growth_blocker || growthBlocker || growth_barriers || growthBarriers)
      ? (growth_blocker || growthBlocker || growth_barriers || growthBarriers).join(', ')
      : (growth_blocker || growthBlocker || growth_barriers || growthBarriers || '');
    const resolvedExistingLoanType = existing_loan_type || existingLoanType || resolvedCreditHistory || '';
    const resolvedLoanPurpose = Array.isArray(loan_purpose || loanPurpose) ? (loan_purpose || loanPurpose).join(', ') : (loan_purpose || loanPurpose || '');

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO businesses (
          user_id, type, what, workers, hours, portal_type,
          interests, skills, capital_range, space_type, time_commitment, risk_appetite, barriers,
          knows_idea, idea_category, enjoy_doing, trade_training, tools_owned, space_available,
          capital_source, nearby_businesses, unmet_need, family_support,
          growth_aspiration, growth_barriers, credit_history,
          growth_intent, growth_blocker, existing_loan_type, loan_purpose,
          updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, CURRENT_TIMESTAMP)
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
           knows_idea = EXCLUDED.knows_idea,
           idea_category = EXCLUDED.idea_category,
           enjoy_doing = EXCLUDED.enjoy_doing,
           trade_training = EXCLUDED.trade_training,
           tools_owned = EXCLUDED.tools_owned,
           space_available = EXCLUDED.space_available,
           capital_source = EXCLUDED.capital_source,
           nearby_businesses = EXCLUDED.nearby_businesses,
           unmet_need = EXCLUDED.unmet_need,
           family_support = EXCLUDED.family_support,
           growth_aspiration = EXCLUDED.growth_aspiration,
           growth_barriers = EXCLUDED.growth_barriers,
           credit_history = EXCLUDED.credit_history,
           growth_intent = EXCLUDED.growth_intent,
           growth_blocker = EXCLUDED.growth_blocker,
           existing_loan_type = EXCLUDED.existing_loan_type,
           loan_purpose = EXCLUDED.loan_purpose,
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
          resolvedKnowsIdea,
          resolvedIdeaCategory,
          resolvedEnjoyDoing,
          resolvedTradeTraining,
          resolvedToolsOwned,
          resolvedSpaceAvailable,
          resolvedCapitalSource,
          resolvedNearbyBusinesses,
          resolvedUnmetNeed,
          resolvedFamilySupport,
          resolvedGrowthAspiration,
          resolvedGrowthBarriers,
          resolvedCreditHistory,
          resolvedGrowthIntent,
          resolvedGrowthBlocker,
          resolvedExistingLoanType,
          resolvedLoanPurpose,
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
        knows_idea: resolvedKnowsIdea || existing.knows_idea || '',
        idea_category: resolvedIdeaCategory || existing.idea_category || '',
        enjoy_doing: resolvedEnjoyDoing || existing.enjoy_doing || '',
        trade_training: resolvedTradeTraining || existing.trade_training || '',
        tools_owned: resolvedToolsOwned || existing.tools_owned || '',
        space_available: resolvedSpaceAvailable || existing.space_available || '',
        capital_source: resolvedCapitalSource || existing.capital_source || '',
        nearby_businesses: resolvedNearbyBusinesses || existing.nearby_businesses || '',
        unmet_need: resolvedUnmetNeed || existing.unmet_need || '',
        family_support: resolvedFamilySupport || existing.family_support || '',
        growth_aspiration: resolvedGrowthAspiration || existing.growth_aspiration || '',
        growth_barriers: resolvedGrowthBarriers || existing.growth_barriers || '',
        credit_history: resolvedCreditHistory || existing.credit_history || '',
        growth_intent: resolvedGrowthIntent || existing.growth_intent || '',
        growth_blocker: resolvedGrowthBlocker || existing.growth_blocker || '',
        existing_loan_type: resolvedExistingLoanType || existing.existing_loan_type || '',
        loan_purpose: resolvedLoanPurpose || existing.loan_purpose || '',
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
