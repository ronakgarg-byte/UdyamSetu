const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { getAggregatedLocalContext } = require('../services/externalData/localContextAggregator');

async function getLocalContext(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let district = 'Varanasi';

    if (isPostgres()) {
      const userRes = await pool.query('SELECT district FROM users WHERE id = $1', [userId]);
      if (userRes.rows[0]?.district) {
        district = userRes.rows[0].district;
      }
    } else {
      const user = inMemoryStore.users.get(userId);
      if (user?.district) {
        district = user.district;
      }
    }

    const localContext = await getAggregatedLocalContext(district);

    return res.json({
      success: true,
      userId,
      district,
      localContext,
    });
  } catch (err) {
    console.error('Error in getLocalContext:', err);
    return res.status(500).json({ error: 'Failed to generate local context', details: err.message });
  }
}

module.exports = {
  getLocalContext,
};
