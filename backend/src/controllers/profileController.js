const { pool, inMemoryStore, isPostgres } = require('../config/db');

async function saveProfile(req, res) {
  try {
    const { userId } = req.params;
    const {
      customers = [],
      competition = {},
      problems = [],
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

    const compCount = competition.count !== undefined && competition.count !== '' ? parseInt(competition.count, 10) : 0;
    const compWhere = competition.where || '';

    const resolvedGrowthIntent = growth_intent || growthIntent || '';
    const resolvedGrowthBlocker = Array.isArray(growth_blocker || growthBlocker)
      ? (growth_blocker || growthBlocker).join(', ')
      : (growth_blocker || growthBlocker || '');
    const resolvedExistingLoanType = existing_loan_type || existingLoanType || '';
    const resolvedLoanPurpose = Array.isArray(loan_purpose || loanPurpose)
      ? (loan_purpose || loanPurpose).join(', ')
      : (loan_purpose || loanPurpose || '');

    if (isPostgres()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query('DELETE FROM user_customer_types WHERE user_id = $1', [userId]);
        if (Array.isArray(customers) && customers.length > 0) {
          for (const key of customers) {
            await client.query(
              `INSERT INTO user_customer_types (user_id, customer_type_key)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [userId, key]
            );
          }
        }

        await client.query(
          `INSERT INTO competition (user_id, count, where_located, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id)
           DO UPDATE SET
             count = EXCLUDED.count,
             where_located = EXCLUDED.where_located,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, compCount, compWhere]
        );

        await client.query('DELETE FROM user_problems WHERE user_id = $1', [userId]);
        if (Array.isArray(problems) && problems.length > 0) {
          for (const key of problems) {
            await client.query(
              `INSERT INTO user_problems (user_id, problem_key)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [userId, key]
            );
          }
        }

        if (resolvedGrowthIntent || resolvedGrowthBlocker || resolvedExistingLoanType || resolvedLoanPurpose) {
          await client.query(
            `UPDATE businesses
             SET
               growth_intent = COALESCE(NULLIF($2, ''), growth_intent),
               growth_blocker = COALESCE(NULLIF($3, ''), growth_blocker),
               existing_loan_type = COALESCE(NULLIF($4, ''), existing_loan_type),
               loan_purpose = COALESCE(NULLIF($5, ''), loan_purpose),
               updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,
            [userId, resolvedGrowthIntent, resolvedGrowthBlocker, resolvedExistingLoanType, resolvedLoanPurpose]
          );
        }

        await client.query('COMMIT');
        return res.json({
          success: true,
          profile: {
            userId,
            customers,
            competition: { count: compCount, where: compWhere },
            problems,
            growth_intent: resolvedGrowthIntent,
            growth_blocker: resolvedGrowthBlocker,
            existing_loan_type: resolvedExistingLoanType,
            loan_purpose: resolvedLoanPurpose,
          },
        });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      inMemoryStore.user_customer_types = inMemoryStore.user_customer_types.filter((r) => r.userId !== userId);
      if (Array.isArray(customers)) {
        customers.forEach((key) => {
          inMemoryStore.user_customer_types.push({ userId, key });
        });
      }

      inMemoryStore.competition.set(userId, {
        userId,
        count: compCount,
        where: compWhere,
        updated_at: new Date().toISOString(),
      });

      inMemoryStore.user_problems = inMemoryStore.user_problems.filter((r) => r.userId !== userId);
      if (Array.isArray(problems)) {
        problems.forEach((key) => {
          inMemoryStore.user_problems.push({ userId, key });
        });
      }

      if (resolvedGrowthIntent || resolvedGrowthBlocker || resolvedExistingLoanType || resolvedLoanPurpose) {
        const existingBiz = inMemoryStore.businesses.get(userId) || { user_id: userId };
        inMemoryStore.businesses.set(userId, {
          ...existingBiz,
          growth_intent: resolvedGrowthIntent || existingBiz.growth_intent || '',
          growth_blocker: resolvedGrowthBlocker || existingBiz.growth_blocker || '',
          existing_loan_type: resolvedExistingLoanType || existingBiz.existing_loan_type || '',
          loan_purpose: resolvedLoanPurpose || existingBiz.loan_purpose || '',
          updated_at: new Date().toISOString(),
        });
      }

      return res.json({
        success: true,
        profile: {
          userId,
          customers,
          competition: { count: compCount, where: compWhere },
          problems,
          growth_intent: resolvedGrowthIntent,
          growth_blocker: resolvedGrowthBlocker,
          existing_loan_type: resolvedExistingLoanType,
          loan_purpose: resolvedLoanPurpose,
        },
      });
    }
  } catch (err) {
    console.error('Error in saveProfile:', err);
    return res.status(500).json({ error: 'Failed to save profile info', details: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const custRes = await pool.query('SELECT customer_type_key FROM user_customer_types WHERE user_id = $1', [userId]);
      const compRes = await pool.query('SELECT * FROM competition WHERE user_id = $1', [userId]);
      const probRes = await pool.query('SELECT problem_key FROM user_problems WHERE user_id = $1', [userId]);
      const bizRes = await pool.query('SELECT growth_intent, growth_blocker, existing_loan_type, loan_purpose FROM businesses WHERE user_id = $1', [userId]);
      const biz = bizRes.rows[0] || {};

      return res.json({
        success: true,
        profile: {
          userId,
          customers: custRes.rows.map((r) => r.customer_type_key),
          competition: compRes.rows[0] ? { count: compRes.rows[0].count, where: compRes.rows[0].where_located } : { count: 0, where: '' },
          problems: probRes.rows.map((r) => r.problem_key),
          growth_intent: biz.growth_intent || '',
          growth_blocker: biz.growth_blocker || '',
          existing_loan_type: biz.existing_loan_type || '',
          loan_purpose: biz.loan_purpose || '',
        },
      });
    } else {
      const customers = inMemoryStore.user_customer_types.filter((r) => r.userId === userId).map((r) => r.key);
      const competition = inMemoryStore.competition.get(userId) || { count: 0, where: '' };
      const problems = inMemoryStore.user_problems.filter((r) => r.userId === userId).map((r) => r.key);
      const biz = inMemoryStore.businesses.get(userId) || {};

      return res.json({
        success: true,
        profile: {
          userId,
          customers,
          competition: { count: competition.count, where: competition.where },
          problems,
          growth_intent: biz.growth_intent || '',
          growth_blocker: biz.growth_blocker || '',
          existing_loan_type: biz.existing_loan_type || '',
          loan_purpose: biz.loan_purpose || '',
        },
      });
    }
  } catch (err) {
    console.error('Error in getProfile:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile info', details: err.message });
  }
}

module.exports = {
  saveProfile,
  getProfile,
};
