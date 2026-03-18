// =============================================================
// EXPENSE CONTROLLER (controllers/expenseController.js)
// Handles all expense operations: Create, Read, Update, Delete
// Every function here is protected — user must be logged in
// (The auth middleware adds req.user before these run)
// =============================================================

const db = require('../config/db');

// ---------------------------------------------------------------
// GET ALL EXPENSES for the logged-in user
// GET /api/expenses
// Optional query params: ?month=2024-03 (filter by month)
// ---------------------------------------------------------------
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT via auth middleware
    const { month } = req.query; // e.g. "2024-03"

    let query, params;

    if (month) {
      // Filter expenses to a specific month
      // DATE_TRUNC rounds a date down to the month level
      query = `
        SELECT * FROM expenses 
        WHERE user_id = $1 
          AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', $2::date)
        ORDER BY expense_date DESC
      `;
      params = [userId, `${month}-01`]; // Add day to make a valid date
    } else {
      // Return all expenses (most recent first)
      query = `
        SELECT * FROM expenses 
        WHERE user_id = $1 
        ORDER BY expense_date DESC
      `;
      params = [userId];
    }

    const result = await db.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// ---------------------------------------------------------------
// CREATE a new expense
// POST /api/expenses
// Body: { title, amount, category, expense_date, notes }
// ---------------------------------------------------------------
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, category, expense_date, notes } = req.body;

    // Validate required fields
    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({ error: 'Title, amount, category, and date are required.' });
    }

    // Validate category is one of our allowed values
    const validCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const result = await db.query(
      `INSERT INTO expenses (user_id, title, amount, category, expense_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, parseFloat(amount), category, expense_date, notes || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense.' });
  }
};

// ---------------------------------------------------------------
// UPDATE an existing expense
// PUT /api/expenses/:id
// Body: { title, amount, category, expense_date, notes }
// ---------------------------------------------------------------
const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id; // From URL: /api/expenses/42
    const { title, amount, category, expense_date, notes } = req.body;

    // Security check: make sure this expense belongs to the logged-in user
    // Without this, any logged-in user could edit anyone's expenses!
    const ownerCheck = await db.query(
      'SELECT id FROM expenses WHERE id = $1 AND user_id = $2',
      [expenseId, userId]
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const result = await db.query(
      `UPDATE expenses 
       SET title = $1, amount = $2, category = $3, expense_date = $4, notes = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, parseFloat(amount), category, expense_date, notes || null, expenseId, userId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
};

// ---------------------------------------------------------------
// DELETE an expense
// DELETE /api/expenses/:id
// ---------------------------------------------------------------
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    // Again: verify ownership before deleting
    const result = await db.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json({ message: 'Expense deleted successfully.' });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
};

// ---------------------------------------------------------------
// GET DASHBOARD STATS: totals and category breakdown
// GET /api/expenses/stats
// ---------------------------------------------------------------
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total spending per category for current month
    const categoryStats = await db.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE user_id = $1
         AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', NOW())
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    // Monthly totals for the last 6 months (for the bar chart)
    const monthlyStats = await db.query(
      `SELECT 
         TO_CHAR(DATE_TRUNC('month', expense_date), 'Mon YYYY') as month,
         DATE_TRUNC('month', expense_date) as month_date,
         SUM(amount) as total
       FROM expenses
       WHERE user_id = $1
         AND expense_date >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', expense_date)
       ORDER BY month_date ASC`,
      [userId]
    );

    res.json({
      categoryBreakdown: categoryStats.rows,
      monthlyTotals: monthlyStats.rows
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getStats };
