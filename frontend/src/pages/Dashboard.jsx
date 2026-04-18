// =============================================================
// DASHBOARD PAGE (pages/Dashboard.jsx)
// Hero budget card, stat cards, recent expenses inline,
// week vs last week comparison, AI insight, charts
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonthlyChart, CategoryChart } from '../components/Charts';
import BudgetProgress from '../components/BudgetProgress';
import AIInsight from '../components/AIInsight';
import { SkeletonDashboard } from '../components/Skeleton';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORY_COLOR = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const Dashboard = () => {
  const { user } = useAuth();
  const { format, symbol } = useCurrency();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [lastMonthExpenses, setLastMonthExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Get last month string e.g. "2024-02"
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toISOString().slice(0, 7);

      const [expensesData, lastMonthData, statsData, budgetData] = await Promise.all([
        api.expenses.getAll(currentMonth),
        api.expenses.getAll(lastMonth),
        api.expenses.getStats(),
        api.budget.get(),
      ]);

      setExpenses(expensesData);
      setLastMonthExpenses(lastMonthData);
      setStats(statsData);
      setBudget(budgetData);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- Calculations ----
  const currentMonthTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const monthlyLimit = budget?.monthly_limit ? parseFloat(budget.monthly_limit) : null;

  // This week vs last week
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeekTotal = expenses
    .filter(e => new Date(e.expense_date) >= startOfThisWeek)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const lastWeekTotal = expenses
    .filter(e => {
      const d = new Date(e.expense_date);
      return d >= startOfLastWeek && d < startOfThisWeek;
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const weekChange = lastWeekTotal > 0
    ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(0)
    : null;

  // Month over month change
  const monthChange = lastMonthTotal > 0
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(0)
    : null;

  // Projected end of month spend
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedTotal = dayOfMonth > 0 ? (currentMonthTotal / dayOfMonth) * daysInMonth : 0;

  // Most recent 5 expenses
  const recentExpenses = [...expenses].slice(0, 5);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  if (loading) return <div className="page"><SkeletonDashboard /></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Hero budget card */}
      <div className="hero-card">
        <div className="hero-left">
          <span className="hero-label">Spent this month</span>
          <span className="hero-amount">{format(currentMonthTotal)}</span>
          {monthlyLimit && (
            <span className="hero-sub">
              of {format(monthlyLimit)} budget
              {projectedTotal > monthlyLimit && (
                <span className="hero-warning"> · Projected {format(projectedTotal)} by month end ⚠️</span>
              )}
            </span>
          )}
          {monthChange !== null && (
            <span className={`hero-change ${parseFloat(monthChange) > 0 ? 'hero-change-up' : 'hero-change-down'}`}>
              {parseFloat(monthChange) > 0 ? '↑' : '↓'} {Math.abs(monthChange)}% vs last month
            </span>
          )}
        </div>
        <div className="hero-right">
          {/* Circular progress */}
          {monthlyLimit ? (
            <div className="hero-ring">
              <svg viewBox="0 0 100 100" width="110" height="110">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="white" strokeWidth="8"
                  strokeDasharray={`${Math.min((currentMonthTotal / monthlyLimit) * 264, 264)} 264`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="hero-ring-text">
                <span>{Math.min(Math.round((currentMonthTotal / monthlyLimit) * 100), 100)}%</span>
                <span>used</span>
              </div>
            </div>
          ) : (
            <div className="hero-no-budget">
              <span>💡</span>
              <span>Set a budget</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">This Week</span>
          <span className="stat-value">{format(thisWeekTotal)}</span>
          {weekChange !== null && (
            <span className={`stat-change ${parseFloat(weekChange) > 0 ? 'change-up' : 'change-down'}`}>
              {parseFloat(weekChange) > 0 ? '↑' : '↓'} {Math.abs(weekChange)}% vs last week
            </span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{expenses.length}</span>
          <span className="stat-sub">this month</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Daily Average</span>
          <span className="stat-value">{format(currentMonthTotal / Math.max(dayOfMonth, 1))}</span>
          <span className="stat-sub">per day</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Category</span>
          <span className="stat-value">{stats?.categoryBreakdown?.[0]?.category || '—'}</span>
          {stats?.categoryBreakdown?.[0] && (
            <span className="stat-sub">{format(stats.categoryBreakdown[0].total)}</span>
          )}
        </div>
      </div>

      {/* Budget progress */}
      <BudgetProgress budget={budget} currentSpending={currentMonthTotal} onUpdate={loadData} />

      {/* Recent expenses + AI insight side by side */}
      <div className="dashboard-bottom-grid">
        {/* Recent expenses */}
        <div className="recent-card">
          <div className="recent-header">
            <h3>Recent Expenses</h3>
            <button className="btn-link" onClick={() => navigate('/expenses')}>View all →</button>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="empty-state-small">No expenses yet this month</div>
          ) : (
            <div className="recent-list">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="recent-item">
                  <div className="recent-icon" style={{ background: `${CATEGORY_COLOR[expense.category]}20` }}>
                    {CATEGORY_EMOJI[expense.category]}
                  </div>
                  <div className="recent-info">
                    <span className="recent-title">{expense.title}</span>
                    <span className="recent-date">{formatDate(expense.expense_date)}</span>
                  </div>
                  <span className="recent-amount">{format(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insight */}
        <AIInsight />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <MonthlyChart data={stats?.monthlyTotals} />
        <CategoryChart data={stats?.categoryBreakdown} />
      </div>
    </div>
  );
};

export default Dashboard;
