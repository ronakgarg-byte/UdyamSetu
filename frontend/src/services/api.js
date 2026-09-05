const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // 1. User
  createUser: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getUser: (userId) => request(`/users/${userId}`),

  // 2. Business (Section A)
  saveBusiness: (userId, businessData) =>
    request(`/businesses/${userId}`, {
      method: 'POST',
      body: JSON.stringify(businessData),
    }),

  getBusiness: (userId) => request(`/businesses/${userId}`),

  // 3. Sales (Section B)
  saveSales: (userId, salesData) =>
    request(`/sales/${userId}`, {
      method: 'POST',
      body: JSON.stringify(salesData),
    }),

  getSales: (userId) => request(`/sales/${userId}`),

  // 4. Expenses (Section C)
  saveExpenses: (userId, expensesData) =>
    request(`/expenses/${userId}`, {
      method: 'POST',
      body: JSON.stringify(expensesData),
    }),

  getExpenses: (userId) => request(`/expenses/${userId}`),

  // 5. Profile (Sections D, E, F: customers, competition, problems)
  saveProfile: (userId, profileData) =>
    request(`/profile/${userId}`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    }),

  getProfile: (userId) => request(`/profile/${userId}`),

  // 6. Items
  saveItems: (userId, items) =>
    request(`/items/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getItems: (userId) => request(`/items/${userId}`),

  scanBahiKhata: (payload) =>
    request('/items/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // 7. Financial Analysis
  getAnalysis: (userId) => request(`/analysis/${userId}`),

  // 8. Schemes & Local Context
  getSchemes: (userId) => request(`/schemes/${userId}`),
  compareSchemes: (schemeIdA, schemeIdB, userId, portalType) =>
    request('/schemes/compare', {
      method: 'POST',
      body: JSON.stringify({ schemeIdA, schemeIdB, userId, portalType }),
    }),
  getLocalContext: (userId) => request(`/local-context/${userId}`),

  // 9. AI Chatbot
  sendChatMessage: (userId, { message, lang = 'en', history = [], clientContext = {} }) =>
    request(`/chat/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ message, lang, history, clientContext }),
    }),

  // Full summary
  getSummary: (userId) => request(`/summary/${userId}`),
};
