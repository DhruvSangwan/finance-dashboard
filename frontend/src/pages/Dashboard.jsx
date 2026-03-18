// =============================================================
// DASHBOARD PAGE (pages/Dashboard.jsx)
// The main page after login — brings all components together
// useEffect = runs code after the component renders (like "on mount")
// useState = stores values that, when changed, re-render the component
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import { MonthlyChart, CategoryChart } from '../components/Charts';
import BudgetProgress from '../components/BudgetProgress';
import AIInsight from '../components/AIInsight';
import { api } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';

const Dashboard = () => {
  // ---- State variables ----
  const [expenses, setExpenses] = useState([]);           // All expenses for selected month
  const [stats, setStats] = useState(null);               // Chart data
  const [budget, setBudget] = useState(null);             // Monthly budget goal
  const [showAddForm, setShowAddForm] = useState(false);  // Toggle add expense modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Month filter: default to current month (format: "YYYY-MM")
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // ---- Data loading ----
  // useCallback prevents this function from being recreated on every render
  // which matters because it's used inside useEffect
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Run all three API calls at the same time (parallel, not sequential)
      // Promise.all waits for ALL of them to complete before continuing
      const [expensesData, statsData, budgetData] = await Promise.all([
        api.expenses.getAll(selectedMonth),
        api.expenses.getStats(),
        api.budget.get(),
      ]);

      setExpenses(expensesData);
      setStats(statsData);
      setBudget(budgetData);
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]); // Re-run when selectedMonth changes

  // Run loadData when the component first mounts and when selectedMonth changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Calculate current month total for budget progress ----
  const currentMonthTotal = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount), 0
  );

  // ---- Generate month options for the filter dropdown ----
  // Shows last 6 months as options
  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const value = date.toISOString().slice(0, 7); // "YYYY-MM"
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <div className="app">
      <Navbar />

      <main className="dashboard">
        {/* ---- Page header ---- */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Track, analyze, and improve your spending</p>
          </div>
          <div className="header-actions">
            {/* Month filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-select"
            >
              {getMonthOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* CSV Export button */}
            <button
              className="btn-secondary"
              onClick={() => exportToCSV(expenses)}
            >
              📥 Export CSV
            </button>

            {/* Add expense button */}
            <button
              className="btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Add expense modal */}
        {showAddForm && (
          <ExpenseForm
            onSuccess={() => { setShowAddForm(false); loadData(); }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading your data...</div>
        ) : (
          <>
            {/* ---- Summary cards ---- */}
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

            {/* ---- Budget progress ---- */}
            <BudgetProgress
              budget={budget}
              currentSpending={currentMonthTotal}
              onUpdate={loadData}
            />

            {/* ---- AI Insight ---- */}
            <AIInsight />

            {/* ---- Charts grid ---- */}
            <div className="charts-grid">
              <MonthlyChart data={stats?.monthlyTotals} />
              <CategoryChart data={stats?.categoryBreakdown} />
            </div>

            {/* ---- Expense list ---- */}
            <div className="section">
              <h2>
                Expenses
                <span className="section-count">{expenses.length}</span>
              </h2>
              <ExpenseList expenses={expenses} onRefresh={loadData} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
