// =============================================================
// AI ROUTES (routes/ai.js)
// Three AI-powered endpoints:
// 1. /insight — spending analysis for last 30 days
// 2. /search  — natural language expense search
// 3. /parse   — convert a phrase into a structured expense
// =============================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getInsight, searchExpenses, parseExpense } = require('../controllers/aiController');

router.post('/insight', authenticateToken, getInsight);    // POST /api/ai/insight
router.post('/search', authenticateToken, searchExpenses); // POST /api/ai/search
router.post('/parse', authenticateToken, parseExpense);    // POST /api/ai/parse

module.exports = router;
