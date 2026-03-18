// =============================================================
// BUDGET PROGRESS (components/BudgetProgress.jsx)
// Shows a progress bar: current spending vs monthly budget limit
// Also lets the user update their budget goal
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';

const BudgetProgress = ({ budget, currentSpending, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(budget?.monthly_limit || '');
  const [loading, setLoading] = useState(false);

  const monthlyLimit = budget?.monthly_limit ? parseFloat(budget.monthly_limit) : null;

  // Calculate how much of the budget has been used (0 to 100)
  const percentage = monthlyLimit
    ? Math.min((currentSpending / monthlyLimit) * 100, 100) // Cap at 100%
    : 0;

  // Determine bar color based on usage
  // Green < 70%, Yellow 70-90%, Red > 90%
  const getBarColor = () => {
    if (percentage >= 90) return '#ef4444'; // Red — danger zone
    if (percentage >= 70) return '#f59e0b'; // Yellow — warning
    return '#10b981';                        // Green — good
  };

  const handleSave = async () => {
    if (!newLimit || parseFloat(newLimit) <= 0) {
      alert('Please enter a valid budget amount.');
      return;
    }
    setLoading(true);
    try {
      await api.budget.set(parseFloat(newLimit));
      setEditing(false);
      onUpdate(); // Tell parent to reload budget
    } catch (err) {
      alert('Failed to save budget: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-card">
      <div className="budget-header">
        <h3>Monthly Budget</h3>
        <button
          className="btn-link"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : monthlyLimit ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      {/* Budget edit form */}
      {editing && (
        <div className="budget-edit">
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            placeholder="e.g. 2000"
            min="1"
            step="50"
          />
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {/* Progress display */}
      {monthlyLimit ? (
        <div className="budget-progress">
          <div className="budget-amounts">
            <span className="budget-spent">${parseFloat(currentSpending).toFixed(2)} spent</span>
            <span className="budget-limit">of ${monthlyLimit.toFixed(2)}</span>
          </div>

          {/* Progress bar track */}
          <div className="progress-track">
            {/* Progress bar fill — width is the percentage */}
            <div
              className="progress-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: getBarColor(),
                // Smooth animation when percentage changes
                transition: 'width 0.5s ease'
              }}
            />
          </div>

          <div className="budget-footer">
            <span style={{ color: getBarColor() }}>
              {percentage >= 100
                ? '⚠️ Over budget!'
                : `${percentage.toFixed(0)}% used`}
            </span>
            {monthlyLimit > currentSpending && (
              <span className="budget-remaining">
                ${(monthlyLimit - currentSpending).toFixed(2)} left
              </span>
            )}
          </div>
        </div>
      ) : (
        !editing && (
          <p className="budget-empty">
            Set a monthly budget to track your spending goals.
          </p>
        )
      )}
    </div>
  );
};

export default BudgetProgress;
