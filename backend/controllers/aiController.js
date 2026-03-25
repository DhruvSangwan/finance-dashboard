// =============================================================
// AI CONTROLLER (controllers/aiController.js)
// Three AI features:
// 1. getInsight    — analyzes last 30 days spending
// 2. searchExpenses — natural language search ("food this week")
// 3. parseExpense  — converts phrase to expense object
//
// All use Groq (free) with llama-3.3-70b-versatile model
// =============================================================

const Groq = require('groq-sdk');
const db = require('../config/db');

// Helper: creates a fresh Groq client each time
const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------------------------------------------------------------
// 1. GET AI SPENDING INSIGHT
// POST /api/ai/insight
// ---------------------------------------------------------------
const getInsight = async (req, res) => {
  try {
    const groq = getGroqClient();
    const userId = req.user.id;

    const result = await db.query(
      `SELECT title, amount, category, expense_date
       FROM expenses
       WHERE user_id = $1
         AND expense_date >= NOW() - INTERVAL '30 days'
       ORDER BY expense_date DESC`,
      [userId]
    );

    const expenses = result.rows;

    if (expenses.length === 0) {
      return res.json({
        insight: "No expenses found in the last 30 days. Start adding your expenses to get personalized spending insights!"
      });
    }

    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
      .join(', ');

    const prompt = `You are a friendly personal finance advisor.
    
Here is a summary of my spending over the last 30 days:
- Total spent: $${totalSpent.toFixed(2)}
- Number of transactions: ${expenses.length}
- Spending by category: ${categoryBreakdown}

Please give me 2-3 sentences of personalized insight about my spending patterns. 
Be specific, practical, and encouraging. Point out what's notable (good or bad) 
and give one concrete suggestion. Keep it conversational, not bullet points.`;

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

// ---------------------------------------------------------------
// 2. SEARCH EXPENSES WITH NATURAL LANGUAGE
// POST /api/ai/search
// Body: { query: "show me food expenses this week" }
// ---------------------------------------------------------------
const searchExpenses = async (req, res) => {
  try {
    const groq = getGroqClient();
    const userId = req.user.id;
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    // Fetch ALL user expenses to give context to the AI
    const result = await db.query(
      `SELECT id, title, amount, category, expense_date, notes
       FROM expenses
       WHERE user_id = $1
       ORDER BY expense_date DESC`,
      [userId]
    );

    const expenses = result.rows;

    if (expenses.length === 0) {
      return res.json({ expenses: [], message: 'No expenses found.' });
    }

    // Format as a simple list for the AI to read
    const expenseList = expenses.map(e =>
      `ID:${e.id} | ${e.expense_date} | ${e.category} | $${e.amount} | "${e.title}"`
    ).join('\n');

    const prompt = `You are a helpful expense search assistant.

Here are all the user's expenses:
${expenseList}

User's search query: "${query}"

Based on the query, return ONLY a JSON array of matching expense IDs.
Consider fuzzy matching (e.g. "sandwich" matches "Subway", "food" matches Food category).
Consider date ranges (e.g. "this week", "last month", "first 5 days").
Today's date is ${new Date().toISOString().slice(0, 10)}.

Return ONLY a raw JSON array like: [1, 5, 12]
No explanation, no markdown, just the array. If nothing matches, return: []`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    let matchingIds = [];
    try {
      const raw = response.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json|```/g, '').trim();
      matchingIds = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI search response:', parseError);
      return res.json({ expenses: [], message: 'Could not understand the search query.' });
    }

    if (!Array.isArray(matchingIds) || matchingIds.length === 0) {
      return res.json({ expenses: [], message: 'No matching expenses found.' });
    }

    const matchingExpenses = await db.query(
      `SELECT * FROM expenses 
       WHERE user_id = $1 AND id = ANY($2::int[])
       ORDER BY expense_date DESC`,
      [userId, matchingIds]
    );

    res.json({
      expenses: matchingExpenses.rows,
      message: `Found ${matchingExpenses.rows.length} matching expense(s).`
    });

  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
};

// ---------------------------------------------------------------
// 3. PARSE NATURAL LANGUAGE INTO AN EXPENSE OBJECT
// POST /api/ai/parse
// Body: { text: "I had lunch at subway for $7 today" }
// Returns: { title, amount, category, expense_date, notes }
// ---------------------------------------------------------------
const parseExpense = async (req, res) => {
  try {
    const groq = getGroqClient();
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Please describe your expense.' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const prompt = `You are an expense parsing assistant. 
Extract expense details from the user's text and return ONLY a JSON object.

User text: "${text}"
Today's date: ${today}

Return ONLY a raw JSON object with these exact fields:
{
  "title": "short descriptive title (max 50 chars)",
  "amount": 0.00,
  "category": "one of: Food, Transport, Shopping, Entertainment, Health, Other",
  "expense_date": "YYYY-MM-DD",
  "notes": "any extra context or empty string"
}

Rules:
- If no amount mentioned, set amount to 0
- If no date mentioned, use today: ${today}
- "yesterday" = ${yesterday}
- "morning/lunch/dinner" hints at Food category
- Guess the most logical category
- Return ONLY the JSON, no explanation, no markdown`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    let parsed;
    try {
      const raw = response.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI expense response:', parseError);
      return res.status(500).json({ error: 'Could not understand the expense. Try being more specific, e.g. "Lunch at McDonalds for $8"' });
    }

    if (!parsed.title || parsed.amount === undefined || !parsed.category || !parsed.expense_date) {
      return res.status(500).json({ error: 'Could not extract all required details. Please try again.' });
    }

    parsed.amount = parseFloat(parsed.amount) || 0;

    res.json({ expense: parsed });

  } catch (error) {
    console.error('AI parse error:', error);
    res.status(500).json({ error: 'Failed to parse expense. Please try again.' });
  }
};

module.exports = { getInsight, searchExpenses, parseExpense };
