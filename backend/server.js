// =============================================================
// SERVER ENTRY POINT (server.js)
// This is where the Express app is configured and started.
// Run with: node server.js (or npm run dev with nodemon)
// =============================================================

// Load environment variables from .env file FIRST
// process.env.ANYTHING won't work until this line runs
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Allows frontend (port 3000) to call backend (port 5000)

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================
// MIDDLEWARE — runs on every request before routes
// =============================================================

// CORS: Allow requests from our frontend URL
// Without this, browsers block cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies if needed
}));

// Parse JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Simple request logger — helpful during development
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// =============================================================
// ROUTES — connect URL paths to route handlers
// =============================================================

// Import route files
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budget');
const aiRoutes = require('./routes/ai');

// Mount routes with prefixes
// e.g. authRoutes handles /signup, but here it's mounted at /api/auth
// so the full URL becomes /api/auth/signup
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);

// Health check route — Render uses this to verify the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance Dashboard API is running' });
});

// =============================================================
// ERROR HANDLER — catches any unhandled errors
// Must have 4 parameters (err, req, res, next) to work as error handler
// =============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// =============================================================
// START THE SERVER
// =============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
