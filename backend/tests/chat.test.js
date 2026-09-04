const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/index');
const { getUserFullContext, generateAdvisoryResponse, buildSystemPrompt } = require('../src/services/chatService');

describe('AI Chatbot Advisory Engine Tests', () => {
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

  test('POST /api/chat/:userId - setup user and context', async () => {
    const userRes = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anita Sharma',
        gender: 'female',
        phone: '9876543210',
        district: 'Varanasi',
        preferred_language: 'hi',
      }),
    });
    assert.strictEqual(userRes.status, 201);
    const userData = await userRes.json();
    testUserId = userData.userId;

    await fetch(`${baseUrl}/businesses/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Tailoring & Boutique',
        what: 'Blouses, suits, alterations',
        workers: 1,
      }),
    });

    await fetch(`${baseUrl}/sales/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailySales: 800, monthlyRevenue: 24000 }),
    });

    await fetch(`${baseUrl}/expenses/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rent: 3000, rawMaterials: 8000, transport: 500, emi: 1000 }),
    });

    await fetch(`${baseUrl}/profile/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: ['workers', 'nearby'],
        problems: ['workingcap', 'rawcost'],
      }),
    });
  });

  test('getUserFullContext - should aggregate all data models and financial metrics', async () => {
    const context = await getUserFullContext(testUserId);
    assert.ok(context.user);
    assert.strictEqual(context.user.name, 'Anita Sharma');
    assert.strictEqual(context.business.type, 'Tailoring & Boutique');
    assert.strictEqual(context.financial.revenue, 24000);
    assert.strictEqual(context.financial.totalExpenses, 11500);
    assert.strictEqual(context.financial.netProfit, 12500);
    assert.ok(context.schemes.length >= 6);
    assert.ok(context.localContext);
  });

  test('buildSystemPrompt - should contain user name, numbers and tailored instructions', async () => {
    const context = await getUserFullContext(testUserId);
    const prompt = buildSystemPrompt(context, 'hi');
    assert.ok(prompt.includes('Anita Sharma'));
    assert.ok(prompt.includes('Tailoring & Boutique'));
    assert.ok(prompt.includes('24000'));
  });

  test('POST /api/chat/:userId - should return personalized scheme advisory in English', async () => {
    const res = await fetch(`${baseUrl}/chat/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Am I eligible for any government loan scheme?',
        lang: 'en',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.userId, testUserId);
    assert.ok(typeof data.reply === 'string');
    assert.ok(data.reply.length > 20);
    assert.ok(data.timestamp);
  });

  test('POST /api/chat/:userId - should return personalized expense reduction advice in Hindi', async () => {
    const res = await fetch(`${baseUrl}/chat/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'मैं अपने व्यापार का खर्च कैसे कम कर सकती हूँ?',
        lang: 'hi',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.reply === 'string');
    assert.ok(data.reply.includes('खर्च') || data.reply.includes('मासिक'));
  });

  test('POST /api/chat/:userId - should reject empty message', async () => {
    const res = await fetch(`${baseUrl}/chat/${testUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });

    assert.strictEqual(res.status, 400);
  });
});
