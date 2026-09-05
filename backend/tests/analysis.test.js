const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');
const { calculateFinancialMetrics, calculateBeginnerPlan } = require('../src/services/financialService');

describe('Financial Analysis Engine Unit & API Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      return new Promise((resolve) => server.close(resolve));
    }
  });

  test('calculateFinancialMetrics - unit test standard healthy business', () => {
    const sales = { dailySales: 2500, monthlyRevenue: 75000 };
    const expenses = {
      rent: 5000,
      electricity: 1500,
      rawMaterials: 40000,
      transport: 2000,
      wages: 6000,
      packaging: 1000,
      emi: 3500,
      other: 1000,
    };
    const items = [
      { sellPrice: 160, costPrice: 135 },
      { sellPrice: 340, costPrice: 290 },
    ];
    const problems = ['competition'];

    const res = calculateFinancialMetrics(sales, expenses, items, problems);

    assert.strictEqual(res.revenue, 75000);
    assert.strictEqual(res.totalExpenses, 56500);
    assert.strictEqual(res.netProfit, 18500);
    assert.strictEqual(res.cashFlow, 15000);
    assert.strictEqual(res.breakEvenGap, -15000);
    assert.strictEqual(res.workingCapital, 425);
    assert.strictEqual(res.riskLevel, 'low');
    assert.strictEqual(res.scheme.name, 'Mudra Yojana (Tarun)');
    assert.strictEqual(res.scheme.match, 79);
  });

  test('calculateFinancialMetrics - micro vendor (<15k revenue) gets PM-SVANidhi', () => {
    const sales = { dailySales: 400, monthlyRevenue: 12000 };
    const expenses = { rent: 2000, rawMaterials: 6000, emi: 0 };
    const items = [{ sellPrice: 50, costPrice: 30 }];
    const problems = ['customers'];

    const res = calculateFinancialMetrics(sales, expenses, items, problems);

    assert.strictEqual(res.revenue, 12000);
    assert.strictEqual(res.scheme.code, 'pm_svanidhi');
    assert.strictEqual(res.scheme.match, 88);
    assert.strictEqual(res.riskLevel, 'low');
  });

  test('calculateFinancialMetrics - working capital problem triggers PMEGP recommendation', () => {
    const sales = { dailySales: 1000, monthlyRevenue: 30000 };
    const expenses = { rent: 4000, rawMaterials: 15000, emi: 2000 };
    const items = [{ sellPrice: 100, costPrice: 70 }];
    const problems = ['workingcap', 'transport'];

    const res = calculateFinancialMetrics(sales, expenses, items, problems);

    assert.strictEqual(res.scheme.code, 'pmegp');
    assert.strictEqual(res.scheme.match, 81);
  });

  test('calculateFinancialMetrics - high debt ratio (>50%) causes high risk', () => {
    const sales = { monthlyRevenue: 20000 };
    const expenses = { rent: 3000, emi: 12000 };

    const res = calculateFinancialMetrics(sales, expenses, [], []);
    assert.strictEqual(res.debtRatio, 60);
    assert.strictEqual(res.riskLevel, 'high');
  });

  test('calculateFinancialMetrics - negative net profit causes high risk', () => {
    const sales = { monthlyRevenue: 20000 };
    const expenses = { rent: 10000, rawMaterials: 15000, emi: 0 };

    const res = calculateFinancialMetrics(sales, expenses, [], []);
    assert.strictEqual(res.netProfit, -5000);
    assert.strictEqual(res.riskLevel, 'high');
    assert.strictEqual(res.breakEvenGap, 5000);
  });

  test('GET /api/analysis/:userId - end-to-end user analysis retrieval', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sunita Devi', phone: '9123456780', preferred_language: 'hi' }),
    });
    const { userId } = await userRes.json();

    await fetch(`${baseUrl}/sales/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailySales: 1200, monthlyRevenue: 36000 }),
    });

    await fetch(`${baseUrl}/expenses/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rent: 3000, rawMaterials: 18000, electricity: 800, emi: 1500 }),
    });

    await fetch(`${baseUrl}/items/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { desc: 'Kurti Fabric', sellPrice: 450, costPrice: 300 },
          { desc: 'Saree Stitching', sellPrice: 300, costPrice: 120 },
        ],
      }),
    });

    await fetch(`${baseUrl}/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: ['nearby', 'workers'],
        problems: ['loanrepay', 'rawcost'],
      }),
    });

    const analysisRes = await fetch(`${baseUrl}/analysis/${userId}`);
    assert.strictEqual(analysisRes.status, 200);
    const data = await analysisRes.json();

    assert.strictEqual(data.success, true);
    assert.strictEqual(data.userId, userId);
    assert.strictEqual(data.analysis.revenue, 36000);
    assert.strictEqual(data.analysis.totalExpenses, 21800);
    assert.strictEqual(data.analysis.netProfit, 14200);
    assert.strictEqual(data.analysis.cashFlow, 12700);
    assert.strictEqual(data.analysis.workingCapital, 420);
    assert.strictEqual(data.analysis.scheme.code, 'pmegp');
    assert.strictEqual(data.analysis.riskLevel, 'low');
  });

  test('calculateBeginnerPlan - unit test generates structured roadmap & recommendation', () => {
    const user = { name: 'Kavita Sharma', state: 'Rajasthan', district: 'Jaipur' };
    const business = {
      interests: ['handicrafts', 'retail'],
      skills: 'embroidery and stitching',
      capital_range: '10k_50k',
      space_type: 'home',
      time_commitment: 'part_time',
      barriers: ['lack_capital', 'market_access'],
    };
    const problems = ['lack_capital'];

    const plan = calculateBeginnerPlan(user, business, problems);

    assert.strictEqual(plan.isBeginner, true);
    assert.ok(plan.recommendedIdea);
    assert.strictEqual(plan.recommendedIdea.title, 'Handmade Crafts & Stitching Boutique');
    assert.ok(plan.steps && plan.steps.length === 5);
    assert.ok(plan.estimatedStartupCost > 0);
    assert.ok(plan.projectedMonthlyProfit);
    assert.strictEqual(plan.recommendedScheme.code, 'pm_vishwakarma');
  });

  test('GET /api/analysis/:userId - beginner user gets personalized startup roadmap', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Patel',
        phone: '9876500000',
        state: 'Gujarat',
        district: 'Ahmedabad',
        portal_type: 'beginner',
      }),
    });
    const { user } = await userRes.json();
    const userId = user.id;

    await fetch(`${baseUrl}/businesses/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portal_type: 'beginner',
        interests: ['food', 'services'],
        skills: 'cooking snacks, chai making',
        capital_range: 'under_10k',
        space_type: 'stall',
        time_commitment: 'full_time',
        barriers: ['lack_capital'],
      }),
    });

    const analysisRes = await fetch(`${baseUrl}/analysis/${userId}`);
    assert.strictEqual(analysisRes.status, 200);
    const data = await analysisRes.json();

    assert.strictEqual(data.success, true);
    assert.strictEqual(data.userId, userId);
    assert.strictEqual(data.analysis.isBeginner, true);
    assert.strictEqual(data.analysis.recommendedIdea.title, 'Street Food & Beverage Stall');
    assert.ok(data.analysis.steps.length === 5);
    assert.strictEqual(data.analysis.recommendedScheme.code, 'pm_svanidhi');
  });
});
