// =============================================================
// API UTILITY (utils/api.js)
// All backend calls in one place with JWT auth header
// =============================================================

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  const response = await fetch(`${BASE_URL}${url}`, config);
  const data = await response.json();
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

export const api = {
  auth: {
    signup: (name, email, password) =>
      authFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    login: (email, password) =>
      authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  },
  expenses: {
    getAll: (month) => authFetch(`/expenses${month ? `?month=${month}` : ''}`),
    getStats: () => authFetch('/expenses/stats'),
    getRecent: () => authFetch('/expenses/recent'),
    create: (data) => authFetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => authFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => authFetch(`/expenses/${id}`, { method: 'DELETE' }),
  },
  budget: {
    get: () => authFetch('/budget'),
    set: (monthly_limit) => authFetch('/budget', { method: 'POST', body: JSON.stringify({ monthly_limit }) }),
  },
  ai: {
    getInsight: () => authFetch('/ai/insight', { method: 'POST' }),
    searchExpenses: (query) => authFetch('/ai/search', { method: 'POST', body: JSON.stringify({ query }) }),
    parseExpense: (text) => authFetch('/ai/parse', { method: 'POST', body: JSON.stringify({ text }) }),
    getAnalytics: (data) => authFetch('/ai/analytics', { method: 'POST', body: JSON.stringify(data) }),
  },
};
