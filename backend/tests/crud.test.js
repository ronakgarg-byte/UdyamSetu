const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');

describe('CRUD Endpoints Integration Tests', () => {
  let server;
  let baseUrl;
  let createdUserId;

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

  test('POST /api/users - should create a new user successfully', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Kumar',
        age: 38,
        gender: 'male',
        phone: '9876543210',
        preferred_language: 'hi',
        district: 'Varanasi',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.userId);
    assert.strictEqual(data.user.name, 'Ramesh Kumar');
    createdUserId = data.userId;
  });

  test('POST /api/users - should reject empty name', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: 30 }),
    });

    assert.strictEqual(res.status, 400);
  });

  test('POST /api/businesses/:userId - should save business info (Section A)', async () => {
    const res = await fetch(`${baseUrl}/businesses/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Grocery / Kirana',
        what: 'Spices, grains, daily essentials',
        workers: 2,
        hours: '8:00 AM - 9:00 PM',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.business.type, 'Grocery / Kirana');
    assert.strictEqual(data.business.workers, 2);
  });

  test('POST /api/sales/:userId - should save sales info (Section B)', async () => {
    const res = await fetch(`${baseUrl}/sales/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customersPerDay: 45,
        dailySales: 2500,
        monthlyRevenue: 75000,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.sales.customers_per_day, 45);
    assert.strictEqual(data.sales.daily_sales, 2500);
  });

  test('POST /api/expenses/:userId - should save expenses info (Section C)', async () => {
    const res = await fetch(`${baseUrl}/expenses/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rent: 5000,
        electricity: 1500,
        rawMaterials: 40000,
        transport: 2000,
        wages: 6000,
        packaging: 1000,
        emi: 3500,
        other: 1000,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.expenses.rent, 5000);
    assert.strictEqual(data.expenses.emi, 3500);
  });

  test('POST /api/profile/:userId - should save profile info (Sections D, E, F)', async () => {
    const res = await fetch(`${baseUrl}/profile/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: ['farmers', 'workers', 'everyone'],
        competition: { count: 3, where: 'Main market road' },
        problems: ['workingcap', 'competition', 'transport'],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.deepStrictEqual(data.profile.customers, ['farmers', 'workers', 'everyone']);
    assert.strictEqual(data.profile.competition.count, 3);
    assert.deepStrictEqual(data.profile.problems, ['workingcap', 'competition', 'transport']);
  });

  test('POST /api/items/:userId - should save items array', async () => {
    const res = await fetch(`${baseUrl}/items/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { desc: 'Mustard Oil (1L)', sellPrice: 160, costPrice: 135, seasonal: 'no' },
          { desc: 'Wheat Flour (10kg)', sellPrice: 340, costPrice: 290, seasonal: 'no' },
          { desc: 'Winter Jaggery (Gur)', sellPrice: 80, costPrice: 55, seasonal: 'yes' },
        ],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.items.length, 3);
    assert.strictEqual(data.items[0].desc, 'Mustard Oil (1L)');
  });

  test('POST /api/profile/:userId - should save Section G growth readiness fields', async () => {
    const res = await fetch(`${baseUrl}/profile/${createdUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: ['farmers', 'workers'],
        competition: { count: 2, where: 'Across the lane' },
        problems: ['workingcap'],
        growth_intent: 'grow',
        growth_blocker: ['capital', 'customers'],
        existing_loan_type: 'bank',
        loan_purpose: ['stock', 'equipment'],
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.profile.growth_intent, 'grow');
    assert.strictEqual(data.profile.existing_loan_type, 'bank');
    assert.ok(data.profile.growth_blocker.includes('capital'));
    assert.ok(data.profile.loan_purpose.includes('stock'));

    const getRes = await fetch(`${baseUrl}/profile/${createdUserId}`);
    const getData = await getRes.json();
    assert.strictEqual(getData.profile.growth_intent, 'grow');
    assert.strictEqual(getData.profile.existing_loan_type, 'bank');
  });

  test('GET /api/summary/:userId - should return aggregated user data', async () => {
    const res = await fetch(`${baseUrl}/summary/${createdUserId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.user.name, 'Ramesh Kumar');
    assert.strictEqual(data.data.business.type, 'Grocery / Kirana');
    assert.strictEqual(data.data.sales.customers_per_day, 45);
    assert.strictEqual(data.data.expenses.rent, 5000);
    assert.strictEqual(data.data.items.length, 3);
  });
});
