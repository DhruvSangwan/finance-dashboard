// =============================================================
// API UTILITY (utils/api.js)
// All calls to the backend are defined here in one place.
// This keeps components clean — they just call api.getExpenses()
// instead of writing fetch() with headers every time.
// =============================================================

// Base URL for the backend API
// In development, React proxy (in package.json) forwards /api calls to port 5000
// In production, this will be your Render backend URL
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// ---------------------------------------------------------------
// Helper function: makes authenticated requests
// Gets the JWT token from localStorage and adds it to the header
// ---------------------------------------------------------------
const authFetch = async (url, options = {}) => {
  // Get the saved token (set when user logs in)
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${url}`, config);
  const data = await response.json();

  // If server returns 401 (unauthorized), token is expired — log out
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login
  }

  // If the response was not OK (2xx), throw the error so callers can catch it
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// =============================================================
// AUTH API CALLS
// =============================================================
export const api = {
  
  auth: {
    signup: (name, email, password) =>
      authFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email, password) =>
      authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  // =============================================================
  // EXPENSE API CALLS
  // =============================================================
  expenses: {
    getAll: (month) =>
      authFetch(`/expenses${month ? `?month=${month}` : ''}`),

    getStats: () =>
      authFetch('/expenses/stats'),

    create: (expenseData) =>
      authFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      }),

    update: (id, expenseData) =>
      authFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      }),

    delete: (id) =>
      authFetch(`/expenses/${id}`, { method: 'DELETE' }),
  },

  // =============================================================
  // BUDGET API CALLS
  // =============================================================
  budget: {
    get: () => authFetch('/budget'),

    set: (monthly_limit) =>
      authFetch('/budget', {
        method: 'POST',
        body: JSON.stringify({ monthly_limit }),
      }),
  },

  // =============================================================
  // AI API CALLS
  // =============================================================
  ai: {
    getInsight: () =>
      authFetch('/ai/insight', { method: 'POST' }),
  },
};
