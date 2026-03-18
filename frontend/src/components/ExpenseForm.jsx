// =============================================================
// EXPENSE FORM (components/ExpenseForm.jsx)
// Used for BOTH adding a new expense and editing an existing one.
// When `expense` prop is provided → edit mode
// When no `expense` prop → add mode
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';

// The list of valid categories (matches the backend validation)
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];

// Category emoji map — purely visual, makes the UI friendlier
const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const ExpenseForm = ({ expense, onSuccess, onCancel }) => {
  // If editing, pre-fill the form with existing data
  // If adding, start with empty/default values
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Food');
  const [date, setDate] = useState(
    expense?.expense_date 
      ? expense.expense_date.slice(0, 10) // Format: YYYY-MM-DD
      : new Date().toISOString().slice(0, 10) // Today's date as default
  );
  const [notes, setNotes] = useState(expense?.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!expense; // True if expense prop was provided

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const expenseData = { title, amount: parseFloat(amount), category, expense_date: date, notes };

    try {
      if (isEditing) {
        await api.expenses.update(expense.id, expenseData);
      } else {
        await api.expenses.create(expenseData);
      }
      onSuccess(); // Tell parent component to refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lunch at cafe"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            {/* Render a button for each category — more visual than a dropdown */}
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra details..."
              rows={2}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
