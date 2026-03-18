// =============================================================
// EXPENSE ROUTES (routes/expenses.js)
// All routes here require authentication (authenticateToken middleware)
// =============================================================

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats
} = require('../controllers/expenseController');

// authenticateToken runs BEFORE the controller function on every route here
// If the token is invalid, the request stops at middleware — never reaches the controller

router.get('/stats', authenticateToken, getStats);       // GET  /api/expenses/stats
router.get('/', authenticateToken, getExpenses);          // GET  /api/expenses
router.post('/', authenticateToken, createExpense);       // POST /api/expenses
router.put('/:id', authenticateToken, updateExpense);     // PUT  /api/expenses/42
router.delete('/:id', authenticateToken, deleteExpense);  // DELETE /api/expenses/42

module.exports = router;
