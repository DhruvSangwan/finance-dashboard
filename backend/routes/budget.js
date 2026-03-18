// =============================================================
// BUDGET ROUTES (routes/budget.js)
// =============================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getBudget, setBudget } = require('../controllers/budgetController');

router.get('/', authenticateToken, getBudget);   // GET  /api/budget
router.post('/', authenticateToken, setBudget);  // POST /api/budget

module.exports = router;
