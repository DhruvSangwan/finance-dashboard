// =============================================================
// ANALYTICS PAGE (pages/Analytics.jsx)
// Unique content not repeated from Dashboard:
// - Spending heatmap by day of week
// - Biggest single expenses
// - Month over month comparison
// - Category breakdown table with bars
// - AI written analytics summary
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { MonthlyChart, CategoryChart, TrendChart } from '../components/Charts';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

const Analytics = () => {
  const { format, symbol } = useCurrency();
  const [stats, setStats] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toISOString().slice(0, 7);

      const [statsData, currentData, lastData] = await Promise.all([
        api.expenses.getStats(),
        api.expenses.getAll(currentMonth),
        api.expenses.getAll(lastMonth),
      ]);

      setStats(statsData);
      setAllExpenses(currentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getAISummary = async () => {
    setLoadingAI(true);
    try {
      const data = await api.ai.getInsight();
      setAiSummary(data.insight);
    } catch (err) {
      setAiSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Spending by day of week
  const dayTotals = DAYS.map((day, i) => {
    const total = allExpenses
      .filter(e => new Date(e.expense_date).getDay() === i)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { day, total };
  });
  const maxDayTotal = Math.max(...dayTotals.map(d => d.total), 1);

  // Top 5 biggest expenses
  const biggestExpenses = [...allExpenses]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 5);

  // Month total
  const monthTotal = allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Deep dive into your spending patterns</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {/* Trend + Category charts */}
          <div className="charts-grid">
            <TrendChart data={stats?.monthlyTotals} />
            <CategoryChart data={stats?.categoryBreakdown} />
          </div>

          {/* Day of week heatmap */}
          <div className="analytics-card">
            <h3>Spending by Day of Week</h3>
            <p className="analytics-sub">Which days do you spend the most?</p>
            <div className="day-heatmap">
              {dayTotals.map(({ day, total }) => {
                const heightPct = total > 0 ? (total / maxDayTotal) * 100 : 4;
                const isMax = total === maxDayTotal && total > 0;
                return (
                  <div key={day} className="day-bar-col">
                    <div className="day-bar-label">{format(total)}</div>
                    <div className="day-bar-track">
                      <div
                        className="day-bar-fill"
                        style={{
                          height: `${heightPct}%`,
                          background: isMax ? '#ef4444' : '#3b82f6',
                          opacity: total > 0 ? 1 : 0.2
                        }}
                      />
                    </div>
                    <div className={`day-bar-name ${isMax ? 'day-bar-name-max' : ''}`}>{day}</div>
                  </div>
                );
              })}
            </div>
            {maxDayTotal > 0 && (
              <p className="analytics-note">
                🔴 {dayTotals.find(d => d.total === maxDayTotal)?.day} is your highest spending day
              </p>
            )}
          </div>

          {/* Biggest expenses */}
          <div className="analytics-card">
            <h3>Top 5 Biggest Expenses This Month</h3>
            {biggestExpenses.length === 0 ? (
              <p className="empty-text">No expenses this month yet.</p>
            ) : (
              <div className="biggest-list">
                {biggestExpenses.map((e, i) => (
                  <div key={e.id} className="biggest-item">
                    <div className="biggest-rank">#{i + 1}</div>
                    <div
                      className="biggest-dot"
                      style={{ background: CATEGORY_COLORS[e.category] }}
                    />
                    <div className="biggest-info">
                      <strong>{e.title}</strong>
                      <span>{e.category} · {new Date(e.expense_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="biggest-amount">{format(e.amount)}</div>
                    <div className="biggest-pct">
                      {monthTotal > 0 ? ((parseFloat(e.amount) / monthTotal) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category breakdown with bars */}
          <div className="analytics-card">
            <h3>Category Breakdown</h3>
            {stats?.categoryBreakdown?.length > 0 ? (
              <div className="category-breakdown">
                {stats.categoryBreakdown.map(item => {
                  const pct = monthTotal > 0 ? ((item.total / monthTotal) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.category} className="category-row">
                      <div className="category-row-left">
                        <div className="category-dot" style={{ background: CATEGORY_COLORS[item.category] || '#6b7280' }} />
                        <span className="category-name">{item.category}</span>
                      </div>
                      <div className="category-row-right">
                        <div className="category-bar-track">
                          <div className="category-bar-fill" style={{ width: `${pct}%`, background: CATEGORY_COLORS[item.category] }} />
                        </div>
                        <span className="category-pct">{pct}%</span>
                        <span className="category-total">{format(item.total)}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="category-row category-total-row">
                  <strong>Total</strong>
                  <strong>{format(monthTotal)}</strong>
                </div>
              </div>
            ) : (
              <p className="empty-text">No expenses this month yet.</p>
            )}
          </div>

          {/* Monthly bar chart */}
          <MonthlyChart data={stats?.monthlyTotals} />

          {/* AI analytics summary */}
          <div className="ai-card">
            <div className="ai-header">
              <div>
                <h3>✨ AI Analytics Summary</h3>
                <p>Get a detailed written analysis of your spending patterns</p>
              </div>
              <button className="btn-ai" onClick={getAISummary} disabled={loadingAI}>
                {loadingAI ? <><span className="spinner" />Analyzing...</> : 'Generate Summary'}
              </button>
            </div>
            {aiSummary && <div className="ai-result"><p>{aiSummary}</p></div>}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
