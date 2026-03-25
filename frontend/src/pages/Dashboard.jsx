// =============================================================
// DASHBOARD PAGE (pages/Dashboard.jsx)
// Summary overview — stat cards, budget, AI insight, charts
// Navigation is now handled by the Sidebar
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { MonthlyChart, CategoryChart } from '../components/Charts';
import BudgetProgress from '../components/BudgetProgress';
import AIInsight from '../components/AIInsight';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [expensesData, statsData, budgetData] = await Promise.all([
        api.expenses.getAll(currentMonth),
        api.expenses.getStats(),
        api.budget.get(),
      ]);
      setExpenses(expensesData);
      setStats(statsData);
      setBudget(budgetData);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const currentMonthTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your financial overview</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading your data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">This Month</span>
              <span className="stat-value">${currentMonthTotal.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">{expenses.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg per Day</span>
              <span className="stat-value">
                ${(currentMonthTotal / new Date().getDate()).toFixed(2)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Top Category</span>
              <span className="stat-value">
                {stats?.categoryBreakdown?.[0]?.category || '—'}
              </span>
            </div>
          </div>

          <BudgetProgress budget={budget} currentSpending={currentMonthTotal} onUpdate={loadData} />
          <AIInsight />

          <div className="charts-grid">
            <MonthlyChart data={stats?.monthlyTotals} />
            <CategoryChart data={stats?.categoryBreakdown} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
