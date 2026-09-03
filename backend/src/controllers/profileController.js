const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

async function saveProfile(req, res) {
  try {
    const { userId } = req.params;
    const { customers = [], competition = {}, problems = [] } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const compCount = competition.count !== undefined && competition.count !== '' ? parseInt(competition.count, 10) : 0;
    const compWhere = competition.where || '';

    if (isPostgres()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Save / replace customer types (Section D)
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

        // 2. Save competition (Section E)
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

        // 3. Save / replace problems (Section F)
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

        await client.query('COMMIT');
        return res.json({
          success: true,
          profile: {
            userId,
            customers,
            competition: { count: compCount, where: compWhere },
            problems,
          },
        });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      // In-memory store
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

      return res.json({
        success: true,
        profile: {
          userId,
          customers,
          competition: { count: compCount, where: compWhere },
          problems,
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

      return res.json({
        success: true,
        profile: {
          userId,
          customers: custRes.rows.map((r) => r.customer_type_key),
          competition: compRes.rows[0] ? { count: compRes.rows[0].count, where: compRes.rows[0].where_located } : { count: 0, where: '' },
          problems: probRes.rows.map((r) => r.problem_key),
        },
      });
    } else {
      const customers = inMemoryStore.user_customer_types.filter((r) => r.userId === userId).map((r) => r.key);
      const competition = inMemoryStore.competition.get(userId) || { count: 0, where: '' };
      const problems = inMemoryStore.user_problems.filter((r) => r.userId === userId).map((r) => r.key);

      return res.json({
        success: true,
        profile: {
          userId,
          customers,
          competition: { count: competition.count, where: competition.where },
          problems,
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
