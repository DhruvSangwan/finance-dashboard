// =============================================================
// EXPENSE FORM (components/ExpenseForm.jsx)
// Used for BOTH adding a new expense and editing an existing one.
// When `expense` prop is provided → edit mode
// When no `expense` prop → add mode
// When `inline` prop is true → renders without its own modal wrapper
// (used inside Expenses.jsx which has its own modal)
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const ExpenseForm = ({ expense, onSuccess, onCancel, inline }) => {
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Food');
  const [date, setDate] = useState(
    expense?.expense_date
      ? expense.expense_date.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(expense?.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!expense;

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
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // The actual form content — same regardless of inline or not
  const formContent = (
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
  );

  // If inline — just render the form directly (parent already has a modal)
  // If not inline — wrap in its own modal (used when editing from ExpenseList)
  if (inline) {
    return formContent;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default ExpenseForm;