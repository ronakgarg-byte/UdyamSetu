const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');
const { compareSchemes } = require('../src/services/schemeMatchingService');

describe('Government Schemes Matcher & Comparison Engine Integration Tests', () => {
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

  test('GET /api/schemes/:userId - low revenue vendor matches PM-SVANidhi top', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chhotu Vendor', gender: 'male', phone: '9800000001' }),
    });
    const { userId } = await userRes.json();

    await fetch(`${baseUrl}/sales/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyRevenue: 10000, dailySales: 350 }),
    });

    await fetch(`${baseUrl}/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: ['workingcap', 'customers'] }),
    });

    const res = await fetch(`${baseUrl}/schemes/${userId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(data.schemes.length >= 6);

    const topScheme = data.schemes[0];
    assert.strictEqual(topScheme.code, 'pm_svanidhi');
    assert.strictEqual(topScheme.matchPercentage, 92);
  });

  test('GET /api/schemes/:userId - female entrepreneur gets Stand-Up India boost', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pooja Sharma', gender: 'female', phone: '9800000002' }),
    });
    const { userId } = await userRes.json();

    await fetch(`${baseUrl}/sales/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyRevenue: 85000 }),
    });

    await fetch(`${baseUrl}/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: ['workingcap', 'marketing'] }),
    });

    const res = await fetch(`${baseUrl}/schemes/${userId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    const standUpScheme = data.schemes.find((s) => s.code === 'stand_up_india');
    assert.ok(standUpScheme);
    assert.ok(standUpScheme.matchPercentage >= 80);
  });

  test('GET /api/schemes/:userId - tailoring/artisan business gets PM Vishwakarma boost', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Shyam Lal Tailor', gender: 'male', phone: '9800000003' }),
    });
    const { userId } = await userRes.json();

    await fetch(`${baseUrl}/businesses/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Tailoring / Boutique', what: 'Cloth stitching, dresses and embroidery' }),
    });

    await fetch(`${baseUrl}/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: ['rawcost', 'suppliers'] }),
    });

    const res = await fetch(`${baseUrl}/schemes/${userId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    const vishwakarma = data.schemes.find((s) => s.code === 'pm_vishwakarma');
    assert.ok(vishwakarma);
    assert.ok(vishwakarma.matchPercentage >= 85);
  });

  test('compareSchemes - unit test compares 2 schemes across 5 points with bilingual text', () => {
    const user = { name: 'Ramesh', gender: 'male' };
    const business = { type: 'Food stall', what: 'Tea and breakfast stall', growth_intent: 'grow', growth_blocker: 'capital' };
    const financial = { revenue: 12000 };

    const result = compareSchemes('pm_svanidhi', 'mudra_shishu', user, business, financial, ['workingcap']);

    assert.ok(result.schemeA);
    assert.ok(result.schemeB);
    assert.strictEqual(result.schemeA.code, 'pm_svanidhi');
    assert.strictEqual(result.schemeB.code, 'mudra_shishu');

    const comp = result.comparison;
    assert.ok(comp.eligibility);
    assert.ok(comp.financialBenefit);
    assert.ok(comp.processAndDocs);
    assert.ok(comp.timeToBenefit);
    assert.ok(comp.bestFitFor);

    // Verify Point 1: Eligibility
    assert.ok(comp.eligibility.schemeA.matchPercentage > 0);
    assert.ok(comp.eligibility.schemeA.keyFit_en);
    assert.ok(comp.eligibility.schemeA.keyFit_hi);

    // Verify Point 2: Financial Benefit
    assert.ok(comp.financialBenefit.schemeA.summary_en.includes('7%'));
    assert.ok(comp.financialBenefit.schemeA.summary_hi);

    // Verify Point 3: Process & Documentation
    assert.strictEqual(comp.processAndDocs.schemeA.complexity, 'simple');
    assert.ok(comp.processAndDocs.schemeA.docsCount >= 1);
    assert.ok(Array.isArray(comp.processAndDocs.schemeA.docsList_en));
    assert.ok(Array.isArray(comp.processAndDocs.schemeA.docsList_hi));

    // Verify Point 4: Time to Benefit
    assert.ok(comp.timeToBenefit.schemeA.processingTime_en);
    assert.ok(comp.timeToBenefit.schemeA.tenure_en);

    // Verify Point 5: Best Fit For
    assert.ok(comp.bestFitFor.schemeA.verdict_en);
    assert.ok(comp.bestFitFor.schemeA.verdict_hi);
  });

  test('POST /api/schemes/compare - endpoint returns structured comparison for 2 schemes', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Geeta Devi', gender: 'female', phone: '9800000004' }),
    });
    const { userId } = await userRes.json();

    const compareRes = await fetch(`${baseUrl}/schemes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemeIdA: 'pmegp',
        schemeIdB: 'stand_up_india',
        userId,
      }),
    });

    assert.strictEqual(compareRes.status, 200);
    const data = await compareRes.json();

    assert.strictEqual(data.success, true);
    assert.strictEqual(data.schemeA.code, 'pmegp');
    assert.strictEqual(data.schemeB.code, 'stand_up_india');
    assert.ok(data.comparison.eligibility);
    assert.ok(data.comparison.financialBenefit);
    assert.ok(data.comparison.processAndDocs);
    assert.ok(data.comparison.timeToBenefit);
    assert.ok(data.comparison.bestFitFor);
  });

  test('POST /api/schemes/compare - rejects missing or invalid scheme codes', async () => {
    const res1 = await fetch(`${baseUrl}/schemes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeIdA: 'pm_svanidhi' }),
    });
    assert.strictEqual(res1.status, 400);

    const res2 = await fetch(`${baseUrl}/schemes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeIdA: 'invalid_scheme_xyz', schemeIdB: 'pm_svanidhi' }),
    });
    assert.strictEqual(res2.status, 400);
  });
});
