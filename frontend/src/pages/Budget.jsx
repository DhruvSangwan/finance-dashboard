// =============================================================
// BUDGET PAGE (pages/Budget.jsx)
// Dedicated page for managing monthly budget goals
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import BudgetProgress from '../components/BudgetProgress';
import { api } from '../utils/api';

const Budget = () => {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [budgetData, expensesData] = await Promise.all([
        api.budget.get(),
        api.expenses.getAll(currentMonth),
      ]);
      setBudget(budgetData);
      setExpenses(expensesData);
    } catch (err) {
      console.error('Budget load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const currentMonthTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const monthlyLimit = budget?.monthly_limit ? parseFloat(budget.monthly_limit) : null;
  const remaining = monthlyLimit ? monthlyLimit - currentMonthTotal : null;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();
  const dailyBudgetLeft = remaining && daysLeft > 0 ? remaining / daysLeft : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Budget</h1>
          <p>Set and track your monthly spending goal</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading budget...</div>
      ) : (
        <>
          <BudgetProgress
            budget={budget}
            currentSpending={currentMonthTotal}
            onUpdate={loadData}
          />

          {/* Budget insights — only show if budget is set */}
          {monthlyLimit && (
            <div className="budget-insights-grid">
              <div className="stat-card">
                <span className="stat-label">Monthly Limit</span>
                <span className="stat-value">${monthlyLimit.toFixed(2)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Spent So Far</span>
                <span className="stat-value">${currentMonthTotal.toFixed(2)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Remaining</span>
                <span className="stat-value" style={{ color: remaining < 0 ? '#ef4444' : '#10b981' }}>
                  {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Daily Budget Left</span>
                <span className="stat-value">
                  {dailyBudgetLeft && dailyBudgetLeft > 0
                    ? `$${dailyBudgetLeft.toFixed(2)}`
                    : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="analytics-card">
            <h3>💡 Budget Tips</h3>
            <ul className="tips-list">
              <li>The 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
              <li>Track every expense — awareness alone reduces spending</li>
              <li>Review your budget weekly, not just at month end</li>
              <li>Set your budget slightly lower than you think you need</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Budget;
