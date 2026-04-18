// =============================================================
// BUDGET PROGRESS (components/BudgetProgress.jsx)
// Shows spending vs budget with color-coded progress bar
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import toast from '../utils/toast';

const BudgetProgress = ({ budget, currentSpending, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(budget?.monthly_limit || '');
  const [loading, setLoading] = useState(false);
  const { format } = useCurrency();

  const monthlyLimit = budget?.monthly_limit ? parseFloat(budget.monthly_limit) : null;
  const percentage = monthlyLimit ? Math.min((currentSpending / monthlyLimit) * 100, 100) : 0;

  const getBarColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  const handleSave = async () => {
    if (!newLimit || parseFloat(newLimit) <= 0) {
      toast.error('Please enter a valid budget amount.');
      return;
    }
    setLoading(true);
    try {
      await api.budget.set(parseFloat(newLimit));
      setEditing(false);
      toast.success('Budget updated!');
      onUpdate();
    } catch (err) {
      toast.error('Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-card">
      <div className="budget-header">
        <h3>Monthly Budget</h3>
        <button className="btn-link" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : monthlyLimit ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      {editing && (
        <div className="budget-edit">
          <input
            type="number"
            value={newLimit}
            onChange={e => setNewLimit(e.target.value)}
            placeholder="e.g. 20000"
            min="1"
          />
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {monthlyLimit ? (
        <div className="budget-progress">
          <div className="budget-amounts">
            <span className="budget-spent">{format(currentSpending)} spent</span>
            <span className="budget-limit">of {format(monthlyLimit)}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentage}%`, backgroundColor: getBarColor() }} />
          </div>
          <div className="budget-footer">
            <span style={{ color: getBarColor() }}>
              {percentage >= 100 ? '⚠️ Over budget!' : `${percentage.toFixed(0)}% used`}
            </span>
            {monthlyLimit > currentSpending && (
              <span className="budget-remaining">{format(monthlyLimit - currentSpending)} left</span>
            )}
          </div>
        </div>
      ) : (
        !editing && <p className="budget-empty">Set a monthly budget to track your spending goals.</p>
      )}
    </div>
  );
};

export default BudgetProgress;
