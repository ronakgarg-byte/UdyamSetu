const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('../services/financialService');
const { getAggregatedLocalContext } = require('../services/externalData/localContextAggregator');
const { matchSchemes } = require('../services/schemeMatchingService');

async function getMatchingSchemes(req, res) {
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

    // 1. Calculate financial metrics or beginner plan
    const { calculateBeginnerPlan } = require('../services/financialService');
    const financial = isBeginner
      ? calculateBeginnerPlan(user, business, problems)
      : calculateFinancialMetrics(sales, expenses, items, problems);

    // 2. Fetch local context
    const localContext = await getAggregatedLocalContext(user.district || business.district || 'Varanasi');

    // 3. Match schemes
    const schemes = matchSchemes(user, business, financial, problems, localContext);

    return res.json({
      success: true,
      userId,
      totalMatching: schemes.length,
      schemes,
    });
  } catch (err) {
    console.error('Error in getMatchingSchemes:', err);
    return res.status(500).json({ error: 'Failed to retrieve matching schemes', details: err.message });
  }
}

module.exports = {
  getMatchingSchemes,
};
