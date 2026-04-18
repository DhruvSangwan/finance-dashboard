// =============================================================
// EXPENSE LIST (components/ExpenseList.jsx)
// Shows expenses with edit/delete. Uses proper confirm dialog.
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import ExpenseForm from './ExpenseForm';
import ConfirmDialog from './ConfirmDialog';
import toast from '../utils/toast';

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const CATEGORY_COLOR = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#8b5cf6', Health: '#10b981', Other: '#6b7280'
};

const ExpenseList = ({ expenses, onRefresh }) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const { format } = useCurrency();

  const handleDelete = (expense) => {
    setConfirmDialog({
      message: `This will permanently delete "${expense.title}".`,
      onConfirm: async () => {
        try {
          await api.expenses.delete(expense.id);
          toast.success('Expense deleted');
          onRefresh();
        } catch (err) {
          toast.error('Failed to delete expense');
        }
      }
    });
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧾</div>
        <h3>No expenses yet</h3>
        <p>Add your first expense using the + button</p>
      </div>
    );
  }

  return (
    <>
      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onSuccess={() => { setEditingExpense(null); onRefresh(); }}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div className="expense-list">
        {expenses.map(expense => (
          <div key={expense.id} className="expense-item">
            <div className="expense-category-dot" style={{ backgroundColor: CATEGORY_COLOR[expense.category] }} />
            <div className="expense-info">
              <span className="expense-title">{expense.title}</span>
              <span className="expense-meta">
                {CATEGORY_EMOJI[expense.category]} {expense.category}
                &nbsp;·&nbsp;{formatDate(expense.expense_date)}
              </span>
              {expense.notes && <span className="expense-notes">{expense.notes}</span>}
            </div>
            <div className="expense-amount">{format(expense.amount)}</div>
            <div className="expense-actions">
              <button className="btn-icon" onClick={() => setEditingExpense(expense)} title="Edit">✏️</button>
              <button className="btn-icon" onClick={() => handleDelete(expense)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpenseList;
