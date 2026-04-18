// =============================================================
// BUDGET PAGE (pages/Budget.jsx)
// Unique content: weekly breakdown, projections, daily budget left,
// per-category spending vs suggested limits, tips
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import BudgetProgress from '../components/BudgetProgress';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

// Suggested % of budget per category (50/30/20 rule adapted)
const SUGGESTED_PCT = {
  Food: 30, Transport: 15, Shopping: 15,
  Entertainment: 10, Health: 15, Other: 15
};

const Budget = () => {
  const { format } = useCurrency();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const monthlyLimit = budget?.monthly_limit ? parseFloat(budget.monthly_limit) : null;
  const currentSpending = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const remaining = monthlyLimit ? monthlyLimit - currentSpending : null;
  const dailyBudgetLeft = remaining && daysLeft > 0 ? remaining / daysLeft : null;
  const projectedSpend = dayOfMonth > 0 ? (currentSpending / dayOfMonth) * daysInMonth : 0;
  const weeklyBudget = monthlyLimit ? monthlyLimit / 4.33 : null;

  // Category spending this month
  const categorySpending = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  // Weekly spending (last 4 weeks)
  const getWeeklyData = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const total = expenses
        .filter(e => {
          const d = new Date(e.expense_date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      weeks.push({
        label: i === 0 ? 'This week' : `${i}w ago`,
        total,
        overBudget: weeklyBudget && total > weeklyBudget
      });
    }
    return weeks;
  };

  const weeklyData = getWeeklyData();
  const maxWeekTotal = Math.max(...weeklyData.map(w => w.total), weeklyBudget || 1, 1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Budget</h1>
          <p>Track goals and plan your spending</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading budget...</div>
      ) : (
        <>
          <BudgetProgress budget={budget} currentSpending={currentSpending} onUpdate={loadData} />

          {/* Key numbers */}
          {monthlyLimit && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Remaining</span>
                <span className="stat-value" style={{ color: remaining < 0 ? '#ef4444' : '#10b981' }}>
                  {remaining < 0 ? '-' : ''}{format(Math.abs(remaining))}
                </span>
                <span className="stat-sub">{daysLeft} days left</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Daily Budget Left</span>
                <span className="stat-value">
                  {dailyBudgetLeft && dailyBudgetLeft > 0 ? format(dailyBudgetLeft) : '—'}
                </span>
                <span className="stat-sub">per day to stay on track</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Weekly Budget</span>
                <span className="stat-value">{weeklyBudget ? format(weeklyBudget) : '—'}</span>
                <span className="stat-sub">monthly ÷ 4.33 weeks</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Projected Month Total</span>
                <span className="stat-value" style={{ color: projectedSpend > monthlyLimit ? '#ef4444' : 'var(--text)' }}>
                  {format(projectedSpend)}
                </span>
                <span className="stat-sub">
                  {projectedSpend > monthlyLimit
                    ? `⚠️ ${format(projectedSpend - monthlyLimit)} over budget`
                    : `${format(monthlyLimit - projectedSpend)} under budget`}
                </span>
              </div>
            </div>
          )}

          {/* Weekly spending bars */}
          <div className="analytics-card">
            <h3>Weekly Spending</h3>
            <p className="analytics-sub">
              {weeklyBudget ? `Weekly budget: ${format(weeklyBudget)}` : 'Set a budget to see weekly targets'}
            </p>
            <div className="day-heatmap">
              {weeklyData.map(week => {
                const heightPct = week.total > 0 ? (week.total / maxWeekTotal) * 100 : 4;
                return (
                  <div key={week.label} className="day-bar-col">
                    <div className="day-bar-label" style={{ fontSize: '0.7rem' }}>{format(week.total)}</div>
                    <div className="day-bar-track">
                      {/* Budget line marker */}
                      {weeklyBudget && (
                        <div className="budget-line" style={{ bottom: `${(weeklyBudget / maxWeekTotal) * 100}%` }} />
                      )}
                      <div
                        className="day-bar-fill"
                        style={{
                          height: `${heightPct}%`,
                          background: week.overBudget ? '#ef4444' : '#3b82f6',
                          opacity: week.total > 0 ? 1 : 0.15
                        }}
                      />
                    </div>
                    <div className="day-bar-name">{week.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category vs suggested */}
          {monthlyLimit && (
            <div className="analytics-card">
              <h3>Category Spending vs Suggested</h3>
              <p className="analytics-sub">Based on your {format(monthlyLimit)} monthly budget</p>
              <div className="category-breakdown">
                {Object.entries(SUGGESTED_PCT).map(([cat, pct]) => {
                  const suggested = (pct / 100) * monthlyLimit;
                  const actual = categorySpending[cat] || 0;
                  const over = actual > suggested;
                  return (
                    <div key={cat} className="category-vs-row">
                      <div className="category-vs-label">
                        <div className="category-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                        <span>{cat}</span>
                      </div>
                      <div className="category-vs-bars">
                        <div className="vs-bar-row">
                          <span className="vs-bar-tag">Actual</span>
                          <div className="vs-bar-track">
                            <div className="vs-bar-fill" style={{
                              width: `${Math.min((actual / monthlyLimit) * 100, 100)}%`,
                              background: over ? '#ef4444' : CATEGORY_COLORS[cat]
                            }} />
                          </div>
                          <span className="vs-bar-amount" style={{ color: over ? '#ef4444' : 'var(--text)' }}>
                            {format(actual)}
                          </span>
                        </div>
                        <div className="vs-bar-row">
                          <span className="vs-bar-tag" style={{ opacity: 0.5 }}>Target</span>
                          <div className="vs-bar-track">
                            <div className="vs-bar-fill" style={{ width: `${pct}%`, background: '#e2e8f0' }} />
                          </div>
                          <span className="vs-bar-amount" style={{ color: 'var(--text-muted)' }}>
                            {format(suggested)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="analytics-card">
            <h3>💡 Smart Budget Tips</h3>
            <div className="tips-grid">
              {[
                { icon: '📊', tip: '50/30/20 Rule', desc: '50% needs, 30% wants, 20% savings' },
                { icon: '📅', tip: 'Weekly Check-in', desc: 'Review spending every Sunday to catch overruns early' },
                { icon: '🎯', tip: 'Set Category Limits', desc: 'Allocate budget per category to avoid overspending in one area' },
                { icon: '📉', tip: 'Track Daily', desc: 'Awareness alone reduces spending by up to 20%' },
              ].map(item => (
                <div key={item.tip} className="tip-card">
                  <span className="tip-icon">{item.icon}</span>
                  <div>
                    <strong>{item.tip}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Budget;
