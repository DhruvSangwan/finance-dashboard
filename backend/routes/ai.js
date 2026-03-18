// =============================================================
// AI ROUTES (routes/ai.js)
// =============================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getInsight } = require('../controllers/aiController');

router.post('/insight', authenticateToken, getInsight); // POST /api/ai/insight

module.exports = router;
