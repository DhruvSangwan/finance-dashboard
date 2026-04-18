// =============================================================
// AI CONTROLLER (controllers/aiController.js)
// Uses Groq (free) — llama-3.3-70b-versatile
// Three endpoints: insight, search, parse
// =============================================================

const Groq = require('groq-sdk');
const db = require('../config/db');

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. Spending insight
const getInsight = async (req, res) => {
  try {
    const groq = getGroqClient();
    const userId = req.user.id;

    const result = await db.query(
      `SELECT title, amount, category, expense_date FROM expenses WHERE user_id = $1 AND expense_date >= NOW() - INTERVAL '30 days' ORDER BY expense_date DESC`,
      [userId]
    );

    const expenses = result.rows;

    if (expenses.length === 0) {
      return res.json({ insight: "No expenses found in the last 30 days. Start adding your expenses to get personalized spending insights!" });
    }

    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort(([,a],[,b]) => b - a)
      .map(([cat, amount]) => `${cat}: ${amount.toFixed(2)}`)
      .join(', ');

    const prompt = `You are a friendly personal finance advisor.
    
Last 30 days spending summary:
- Total: ${totalSpent.toFixed(2)}
- Transactions: ${expenses.length}
- By category: ${categoryBreakdown}

Give 2-3 sentences of personalized insight. Be specific, practical, encouraging. One concrete suggestion. Conversational tone, no bullet points.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    res.json({ insight: response.choices[0].message.content });
  } catch (error) {
    console.error('AI insight error:', error);
    res.status(500).json({ error: 'Failed to generate AI insight. Please try again.' });
  }
};

// 2. Natural language search
const searchExpenses = async (req, res) => {
  try {
    const groq = getGroqClient();
    const userId = req.user.id;
    const { query } = req.body;

    if (!query?.trim()) return res.status(400).json({ error: 'Search query is required.' });

    const result = await db.query(
      `SELECT id, title, amount, category, expense_date FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC`,
      [userId]
    );

    const expenses = result.rows;
    if (expenses.length === 0) return res.json({ expenses: [], message: 'No expenses found.' });

    const expenseList = expenses.map(e =>
      `ID:${e.id} | ${e.expense_date} | ${e.category} | ${e.amount} | "${e.title}"`
    ).join('\n');

    const prompt = `You are an expense search assistant.

Expenses:
${expenseList}

Search query: "${query}"
Today: ${new Date().toISOString().slice(0, 10)}

Return ONLY a raw JSON array of matching expense IDs (numbers).
Use fuzzy matching — "sandwich" matches "Subway", "food" matches Food category.
Consider date ranges — "this week", "last month", "first 5 days".
If nothing matches return: []
Example: [1, 5, 12]`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    let matchingIds = [];
    try {
      const raw = response.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
      matchingIds = JSON.parse(raw);
    } catch {
      return res.json({ expenses: [], message: 'Could not understand the search query.' });
    }

    if (!Array.isArray(matchingIds) || matchingIds.length === 0) {
      return res.json({ expenses: [], message: 'No matching expenses found.' });
    }

    const matching = await db.query(
      `SELECT * FROM expenses WHERE user_id = $1 AND id = ANY($2::int[]) ORDER BY expense_date DESC`,
      [userId, matchingIds]
    );

    res.json({ expenses: matching.rows, message: `Found ${matching.rows.length} matching expense(s).` });
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
};

// 3. Parse natural language to expense object
const parseExpense = async (req, res) => {
  try {
    const groq = getGroqClient();
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ error: 'Please describe your expense.' });

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const prompt = `Parse this expense description into JSON.

Text: "${text}"
Today: ${today}

Return ONLY raw JSON (no markdown, no explanation):
{
  "title": "short title max 50 chars",
  "amount": 0.00,
  "category": "Food|Transport|Shopping|Entertainment|Health|Other",
  "expense_date": "YYYY-MM-DD",
  "notes": ""
}

Rules:
- No amount mentioned → set 0
- No date → use today: ${today}
- "yesterday" → ${yesterday}
- Guess category from context
- ₹ and $ both valid amounts`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    let parsed;
    try {
      const raw = response.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Could not understand. Try: "Lunch at McDonalds for ₹250"' });
    }

    if (!parsed.title || parsed.amount === undefined || !parsed.category || !parsed.expense_date) {
      return res.status(500).json({ error: 'Could not extract all details. Please be more specific.' });
    }

    parsed.amount = parseFloat(parsed.amount) || 0;
    res.json({ expense: parsed });
  } catch (error) {
    console.error('AI parse error:', error);
    res.status(500).json({ error: 'Failed to parse expense. Please try again.' });
  }
};

module.exports = { getInsight, searchExpenses, parseExpense };
