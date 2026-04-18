// =============================================================
// EXPENSE ROUTES (routes/expenses.js)
// =============================================================
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getExpenses, getRecent, createExpense, updateExpense, deleteExpense, getStats } = require('../controllers/expenseController');

router.get('/stats', auth, getStats);
router.get('/recent', auth, getRecent);
router.get('/', auth, getExpenses);
router.post('/', auth, createExpense);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
