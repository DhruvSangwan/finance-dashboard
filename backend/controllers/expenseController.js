// =============================================================
// EXPENSE CONTROLLER (controllers/expenseController.js)
// Full CRUD + stats + recent expenses endpoint
// =============================================================

const db = require('../config/db');

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    let query, params;

    if (month) {
      query = `SELECT * FROM expenses WHERE user_id = $1 AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', $2::date) ORDER BY expense_date DESC`;
      params = [userId, `${month}-01`];
    } else {
      query = `SELECT * FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC`;
      params = [userId];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// Recent 5 expenses across all time (for dashboard)
const getRecent = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC, created_at DESC LIMIT 5`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get recent error:', error);
    res.status(500).json({ error: 'Failed to fetch recent expenses.' });
  }
};

const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, category, expense_date, notes } = req.body;

    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({ error: 'Title, amount, category, and date are required.' });
    }

    const validCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const result = await db.query(
      `INSERT INTO expenses (user_id, title, amount, category, expense_date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, parseFloat(amount), category, expense_date, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense.' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { title, amount, category, expense_date, notes } = req.body;

    const ownerCheck = await db.query('SELECT id FROM expenses WHERE id = $1 AND user_id = $2', [expenseId, userId]);
    if (ownerCheck.rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });

    const result = await db.query(
      `UPDATE expenses SET title = $1, amount = $2, category = $3, expense_date = $4, notes = $5 WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, parseFloat(amount), category, expense_date, notes || null, expenseId, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const result = await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id', [expenseId, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });

    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const categoryStats = await db.query(
      `SELECT category, SUM(amount) as total FROM expenses WHERE user_id = $1 AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', NOW()) GROUP BY category ORDER BY total DESC`,
      [userId]
    );

    const monthlyStats = await db.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', expense_date), 'Mon YYYY') as month, DATE_TRUNC('month', expense_date) as month_date, SUM(amount) as total FROM expenses WHERE user_id = $1 AND expense_date >= NOW() - INTERVAL '6 months' GROUP BY DATE_TRUNC('month', expense_date) ORDER BY month_date ASC`,
      [userId]
    );

    res.json({ categoryBreakdown: categoryStats.rows, monthlyTotals: monthlyStats.rows });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
};

module.exports = { getExpenses, getRecent, createExpense, updateExpense, deleteExpense, getStats };
