const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('../services/financialService');
const { getAggregatedLocalContext } = require('../services/externalData/localContextAggregator');
const { matchSchemes, compareSchemes, getBeginnerRecommendation } = require('../services/schemeMatchingService');

async function getUserContextData(userId) {
  let user = {};
  let business = {};
  let sales = {};
  let expenses = {};
  let items = [];
  let problems = [];

  if (!userId) {
    return { user, business, sales, expenses, items, problems };
  }

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

  return { user, business, sales, expenses, items, problems };
}

async function getMatchingSchemes(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { user, business, sales, expenses, items, problems } = await getUserContextData(userId);

    const isBeginner =
      user.portal_type === 'beginner' ||
      business.portal_type === 'beginner' ||
      req.query.portal_type === 'beginner' ||
      req.query.portalType === 'beginner';

    const localContext = await getAggregatedLocalContext(user.district || business.district || 'Varanasi');
    const financial = isBeginner
      ? getBeginnerRecommendation(user, business, problems, localContext)
      : calculateFinancialMetrics(sales, expenses, items, problems);

    // Match schemes
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

async function compareSchemesHandler(req, res) {
  try {
    const body = req.body || {};
    const query = req.query || {};

    const schemeIdA = body.schemeIdA || body.schemeA || body.scheme1 || query.schemeIdA || query.schemeA;
    const schemeIdB = body.schemeIdB || body.schemeB || body.scheme2 || query.schemeIdB || query.schemeB;
    const userId = body.userId || query.userId || req.params.userId;

    if (!schemeIdA || !schemeIdB) {
      return res.status(400).json({
        error: 'Both schemeIdA and schemeIdB are required for comparison',
      });
    }

    const { user, business, sales, expenses, items, problems } = await getUserContextData(userId);

    const isBeginner =
      body.portalType === 'beginner' ||
      query.portalType === 'beginner' ||
      user.portal_type === 'beginner' ||
      business.portal_type === 'beginner';

    const localContext = await getAggregatedLocalContext(user.district || business.district || 'Varanasi');
    const financial = isBeginner
      ? getBeginnerRecommendation(user, business, problems, localContext)
      : calculateFinancialMetrics(sales, expenses, items, problems);

    const comparisonResult = compareSchemes(
      schemeIdA,
      schemeIdB,
      user,
      business,
      financial,
      problems,
      localContext
    );

    return res.json({
      success: true,
      userId: userId || null,
      schemeA: comparisonResult.schemeA,
      schemeB: comparisonResult.schemeB,
      comparison: comparisonResult.comparison,
    });
  } catch (err) {
    console.error('Error in compareSchemesHandler:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMatchingSchemes,
  compareSchemes: compareSchemesHandler,
  compareSchemesHandler,
};
