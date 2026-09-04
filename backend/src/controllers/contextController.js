const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { getAggregatedLocalContext } = require('../services/externalData/localContextAggregator');

async function getLocalContext(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let district = req.query?.district || '';

    if (!district) {
      if (isPostgres()) {
        const [bizRes, userRes] = await Promise.all([
          pool.query('SELECT district FROM businesses WHERE user_id = $1', [userId]).catch(() => ({ rows: [] })),
          pool.query('SELECT district FROM users WHERE id = $1', [userId]).catch(() => ({ rows: [] })),
        ]);
        if (bizRes.rows[0]?.district) {
          district = bizRes.rows[0].district;
        } else if (userRes.rows[0]?.district) {
          district = userRes.rows[0].district;
        }
      } else {
        const biz = inMemoryStore.businesses.get(userId);
        const user = inMemoryStore.users.get(userId);
        if (biz?.district) {
          district = biz.district;
        } else if (user?.district) {
          district = user.district;
        }
      }
    }

    if (!district) district = 'Varanasi';

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
