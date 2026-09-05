const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('../services/financialService');
const { getBeginnerRecommendation } = require('../services/schemeMatchingService');
const { getAggregatedLocalContext } = require('../services/externalData/localContextAggregator');

async function getAnalysis(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let user = {};
    let business = {};
    let sales = {};
    let expenses = {};
    let items = [];
    let problems = [];

    if (isPostgres()) {
      const [userRes, bizRes, salesRes, expRes, itemsRes, probRes] = await Promise.all([
        pool.query('SELECT * FROM users WHERE id = $1', [userId]),
        pool.query('SELECT * FROM businesses WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM sales WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM expenses WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM items WHERE user_id = $1', [userId]),
        pool.query('SELECT problem_key FROM user_problems WHERE user_id = $1', [userId]),
      ]);

      user = userRes.rows[0] || {};
      business = bizRes.rows[0] || {};
      sales = salesRes.rows[0] || {};
      expenses = expRes.rows[0] || {};
      items = itemsRes.rows || [];
      problems = probRes.rows.map((r) => r.problem_key);
    } else {
      user = inMemoryStore.users.get(userId) || {};
      business = inMemoryStore.businesses.get(userId) || {};
      sales = inMemoryStore.sales.get(userId) || {};
      expenses = inMemoryStore.expenses.get(userId) || {};
      items = inMemoryStore.items.get(userId) || [];
      problems = inMemoryStore.user_problems.filter((r) => r.userId === userId).map((r) => r.key);
    }

    const isBeginner =
      user.portal_type === 'beginner' ||
      business.portal_type === 'beginner' ||
      req.query.portal_type === 'beginner' ||
      req.query.portalType === 'beginner';

    let analysis;
    if (isBeginner) {
      const localContext = await getAggregatedLocalContext(user.district || business.district || 'Varanasi');
      analysis = getBeginnerRecommendation(user, business, problems, localContext);
    } else {
      analysis = calculateFinancialMetrics(sales, expenses, items, problems);
    }

    return res.json({
      success: true,
      userId,
      isBeginner: Boolean(isBeginner),
      analysis,
    });
  } catch (err) {
    console.error('Error in getAnalysis:', err);
    return res.status(500).json({ error: 'Failed to run analysis', details: err.message });
  }
}

module.exports = {
  getAnalysis,
};
