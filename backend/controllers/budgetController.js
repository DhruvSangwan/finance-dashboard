// =============================================================
// BUDGET CONTROLLER (controllers/budgetController.js)
// Handles getting and setting the user's monthly budget limit
// =============================================================

const db = require('../config/db');

// ---------------------------------------------------------------
// GET the user's current budget
// GET /api/budget
// ---------------------------------------------------------------
const getBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [userId]
    );

    // If no budget set yet, return null (frontend handles this gracefully)
    if (result.rows.length === 0) {
      return res.json({ monthly_limit: null });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Failed to fetch budget.' });
  }
};

// ---------------------------------------------------------------
// SET or UPDATE the user's budget
// POST /api/budget
// Body: { monthly_limit }
// Uses "upsert" — insert if not exists, update if exists
// ---------------------------------------------------------------
const setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthly_limit } = req.body;

    if (!monthly_limit || isNaN(monthly_limit) || parseFloat(monthly_limit) <= 0) {
      return res.status(400).json({ error: 'Please provide a valid budget amount.' });
    }

    // ON CONFLICT = if a budget for this user already exists, update it
    // This is called an "upsert" (update + insert)
    const result = await db.query(
      `INSERT INTO budgets (user_id, monthly_limit, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE 
       SET monthly_limit = $2, updated_at = NOW()
       RETURNING *`,
      [userId, parseFloat(monthly_limit)]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({ error: 'Failed to save budget.' });
  }
};

module.exports = { getBudget, setBudget };
