const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');

describe('Government Schemes Matcher Engine Integration Tests', () => {
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
    // 1. Create vendor
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chhotu Vendor', gender: 'male', phone: '9800000001' }),
    });
    const { userId } = await userRes.json();

    // 2. Sales: 10,000 monthly
    await fetch(`${baseUrl}/sales/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyRevenue: 10000, dailySales: 350 }),
    });

    // 3. Profile: working capital problem
    await fetch(`${baseUrl}/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: ['workingcap', 'customers'] }),
    });

    // 4. Fetch schemes
    const res = await fetch(`${baseUrl}/schemes/${userId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(data.schemes.length >= 6);

    const topScheme = data.schemes[0];
    assert.strictEqual(topScheme.code, 'pm_svanidhi');
    assert.strictEqual(topScheme.matchPercentage, 92); // 88 base + problem match boost
  });

  test('GET /api/schemes/:userId - female entrepreneur gets Stand-Up India boost', async () => {
    // 1. Create female entrepreneur
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pooja Sharma', gender: 'female', phone: '9800000002' }),
    });
    const { userId } = await userRes.json();

    // 2. High revenue scale
    await fetch(`${baseUrl}/sales/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyRevenue: 85000 }),
    });

    // 3. Profile
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
    // 1. Create artisan
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Shyam Lal Tailor', gender: 'male', phone: '9800000003' }),
    });
    const { userId } = await userRes.json();

    // 2. Business: Tailoring Boutique
    await fetch(`${baseUrl}/businesses/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Tailoring / Boutique', what: 'Cloth stitching, dresses and embroidery' }),
    });

    // 3. Profile: raw cost problem
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
});
