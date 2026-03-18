// =============================================================
// EXPENSE LIST (components/ExpenseList.jsx)
// Displays all expenses in a table with edit/delete actions
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';
import ExpenseForm from './ExpenseForm';

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

// Color coding per category
const CATEGORY_COLOR = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

const ExpenseList = ({ expenses, onRefresh }) => {
  const [editingExpense, setEditingExpense] = useState(null); // Which expense is being edited
  const [deletingId, setDeletingId] = useState(null);         // For loading state on delete

  const handleDelete = async (id) => {
    // Simple confirmation dialog — no extra library needed
    if (!window.confirm('Delete this expense?')) return;

    setDeletingId(id);
    try {
      await api.expenses.delete(id);
      onRefresh(); // Tell parent to reload the list
    } catch (err) {
      alert('Failed to delete expense: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Format amount as currency: 12.5 → "$12.50"
  const formatAmount = (amount) =>
    `$${parseFloat(amount).toFixed(2)}`;

  // Format date to be more readable: "2024-03-15" → "Mar 15, 2024"
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>🧾 No expenses yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit modal — only shows when editingExpense is set */}
      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onSuccess={() => {
            setEditingExpense(null);
            onRefresh();
          }}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      <div className="expense-list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            {/* Category color dot */}
            <div
              className="expense-category-dot"
              style={{ backgroundColor: CATEGORY_COLOR[expense.category] }}
            />

            <div className="expense-info">
              <span className="expense-title">{expense.title}</span>
              <span className="expense-meta">
                {CATEGORY_EMOJI[expense.category]} {expense.category}
                &nbsp;·&nbsp;
                {formatDate(expense.expense_date)}
              </span>
              {expense.notes && (
                <span className="expense-notes">{expense.notes}</span>
              )}
            </div>

            <div className="expense-amount">{formatAmount(expense.amount)}</div>

            <div className="expense-actions">
              <button
                className="btn-icon"
                onClick={() => setEditingExpense(expense)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="btn-icon btn-icon-danger"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpenseList;
