const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');

describe('Local Context & External API Module Tests', () => {
  let server;
  let baseUrl;
  let testUserId;

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

  test('GET /api/local-context/:userId - should aggregate Maps, Census, AGMARKNET, and Schemes', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kallu Ram',
        phone: '9988776655',
        district: 'Varanasi',
        preferred_language: 'hi',
      }),
    });
    const { userId } = await userRes.json();
    testUserId = userId;

    const res = await fetch(`${baseUrl}/local-context/${testUserId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.strictEqual(data.district, 'Varanasi');
    assert.ok(data.localContext);
    assert.strictEqual(data.localContext.district, 'Varanasi');
    assert.ok(data.localContext.geography.coordinates);
    assert.ok(Array.isArray(data.localContext.geography.nearbyVillages));
    assert.ok(data.localContext.geography.infrastructure.markets.length > 0);
    assert.ok(data.localContext.demographics.population > 0);
    assert.ok(data.localContext.demographics.literacyRate);
    assert.ok(data.localContext.demographics.occupations);
    assert.ok(data.localContext.mandiEconomics.reportingMandi);
    assert.ok(data.localContext.mandiEconomics.keyCommodities.length > 0);
    assert.ok(data.localContext.schemesAvailableCount >= 6);
  });

  test('GET /api/local-context/:userId - repeated request should hit cache', async () => {
    const res = await fetch(`${baseUrl}/local-context/${testUserId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.strictEqual(data.localContext.cached, true);
  });
});
