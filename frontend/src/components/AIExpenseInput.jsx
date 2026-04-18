// =============================================================
// AI EXPENSE INPUT (components/AIExpenseInput.jsx)
// Type a phrase → AI parses → preview card → auto-confirm in 3s
// =============================================================

import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import toast from '../utils/toast';

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const AIExpenseInput = ({ onSuccess, onCancel }) => {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const { format } = useCurrency();

  useEffect(() => {
    if (preview) {
      setCountdown(3);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); handleConfirm(preview); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [preview]);

  const handleParse = async () => {
    if (!text.trim()) return;
    setError(''); setParsing(true); setPreview(null);
    try {
      const data = await api.ai.parseExpense(text);
      setPreview(data.expense);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async (expenseData) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSaving(true);
    try {
      await api.expenses.create(expenseData);
      toast.success('Expense added via AI!');
      onSuccess();
    } catch (err) {
      toast.error('Failed to save expense');
      setSaving(false);
    }
  };

  const handleCancelPreview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPreview(null);
    setCountdown(3);
  };

  return (
    <div className="ai-input-container">
      <div className="ai-input-header">
        <h3>✨ AI Expense Input</h3>
        <p>Describe your expense in plain English or Hindi-English</p>
      </div>

      {!preview && (
        <>
          <div className="ai-input-row">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='e.g. "Had biryani for lunch, paid ₹180"'
              className="ai-text-input"
              onKeyDown={e => e.key === 'Enter' && handleParse()}
              disabled={parsing}
            />
            <button className="btn-ai" onClick={handleParse} disabled={parsing || !text.trim()}>
              {parsing ? <><span className="spinner" />Parsing...</> : '✨ Parse'}
            </button>
          </div>
          <div className="ai-input-examples">
            <span>Try: </span>
            {['Biryani for ₹180', 'Uber to airport ₹450', 'Groceries yesterday ₹2200'].map(ex => (
              <button key={ex} className="example-chip" onClick={() => setText(ex)}>{ex}</button>
            ))}
          </div>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}

      {preview && (
        <div className="ai-preview-card">
          <div className="ai-preview-header">
            <span className="ai-preview-label">Adding in {countdown}s...</span>
            <div className="ai-preview-countdown">
              <svg viewBox="0 0 36 36" className="countdown-ring">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray={`${(countdown/3)*94} 94`} strokeLinecap="round" transform="rotate(-90 18 18)"/>
              </svg>
              <span>{countdown}</span>
            </div>
          </div>
          <div className="ai-preview-row">
            <span className="ai-preview-icon">{CATEGORY_EMOJI[preview.category] || '📦'}</span>
            <div className="ai-preview-info">
              <strong>{preview.title}</strong>
              <span>{preview.category} · {preview.expense_date}</span>
              {preview.notes && <span className="ai-preview-notes">{preview.notes}</span>}
            </div>
            <span className="ai-preview-amount">{format(preview.amount)}</span>
          </div>
          <div className="ai-preview-actions">
            <button className="btn-secondary" onClick={handleCancelPreview} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={() => handleConfirm(preview)} disabled={saving}>
              {saving ? 'Saving...' : '✓ Confirm Now'}
            </button>
          </div>
        </div>
      )}

      {!preview && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="btn-link" onClick={onCancel}>Switch to manual input</button>
        </div>
      )}
    </div>
  );
};

export default AIExpenseInput;
