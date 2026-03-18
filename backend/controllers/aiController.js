const Groq = require('groq-sdk');
const db = require('../config/db');

const getInsight = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
      .sort(([,a], [,b]) => b - a)
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

    const insight = response.choices[0].message.content;
    res.json({ insight });

  } catch (error) {
    console.error('AI insight error:', error);
    res.status(500).json({ error: 'Failed to generate AI insight. Please try again.' });
  }
};

module.exports = { getInsight };