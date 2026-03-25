// =============================================================
// ANALYTICS PAGE (pages/Analytics.jsx)
// Dedicated page for all charts and spending breakdowns
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { MonthlyChart, CategoryChart } from '../components/Charts';
import { api } from '../utils/api';

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [statsData, expensesData] = await Promise.all([
        api.expenses.getStats(),
        api.expenses.getAll(currentMonth),
      ]);
      setStats(statsData);
      setExpenses(expensesData);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Calculate total spent this month
  const monthTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Visual breakdown of your spending</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {/* Charts side by side */}
          <div className="charts-grid">
            <MonthlyChart data={stats?.monthlyTotals} />
            <CategoryChart data={stats?.categoryBreakdown} />
          </div>

          {/* Category breakdown table */}
          <div className="analytics-card">
            <h3>This Month — Category Breakdown</h3>
            {stats?.categoryBreakdown?.length > 0 ? (
              <div className="category-breakdown">
                {stats.categoryBreakdown.map((item) => {
                  const percentage = monthTotal > 0
                    ? ((item.total / monthTotal) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={item.category} className="category-row">
                      <div className="category-row-left">
                        <div
                          className="category-dot"
                          style={{ background: CATEGORY_COLORS[item.category] || '#6b7280' }}
                        />
                        <span className="category-name">{item.category}</span>
                      </div>
                      <div className="category-row-right">
                        {/* Progress bar showing share of total */}
                        <div className="category-bar-track">
                          <div
                            className="category-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              background: CATEGORY_COLORS[item.category] || '#6b7280'
                            }}
                          />
                        </div>
                        <span className="category-pct">{percentage}%</span>
                        <span className="category-total">
                          ${parseFloat(item.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                <div className="category-row category-total-row">
                  <strong>Total</strong>
                  <strong>${monthTotal.toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <p className="empty-text">No expenses this month yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
