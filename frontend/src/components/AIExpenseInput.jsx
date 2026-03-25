// =============================================================
// AI EXPENSE INPUT (components/AIExpenseInput.jsx)
// Lets user type a natural language phrase like
// "I had lunch for $7 today" and auto-adds it as an expense.
//
// Flow:
// 1. User types phrase → clicks "Parse"
// 2. AI returns structured expense data
// 3. Preview card shows for 3 seconds with a confirm button
// 4. Auto-confirms after 3 seconds OR user clicks confirm
// 5. Expense is saved → onSuccess() is called
// =============================================================

import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
};

const AIExpenseInput = ({ onSuccess, onCancel }) => {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);   // Waiting for AI to parse
  const [saving, setSaving] = useState(false);      // Saving to database
  const [preview, setPreview] = useState(null);     // Parsed expense object
  const [countdown, setCountdown] = useState(3);    // Auto-confirm countdown
  const [error, setError] = useState('');
  
  // useRef stores a value that doesn't trigger re-renders
  // Used to clear the countdown timer when component unmounts
  const timerRef = useRef(null);

  // When preview appears, start a 3-second countdown then auto-confirm
  useEffect(() => {
    if (preview) {
      setCountdown(3);
      
      // Count down every second
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleConfirm(preview); // Auto-save when countdown hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup: clear timer if component unmounts or preview changes
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [preview]); // Run this effect whenever preview changes

  // Step 1: Send text to AI for parsing
  const handleParse = async () => {
    if (!text.trim()) return;
    setError('');
    setParsing(true);
    setPreview(null);

    try {
      const data = await api.ai.parseExpense(text);
      setPreview(data.expense); // Show the preview card
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  // Step 2: Save the parsed expense to the database
  const handleConfirm = async (expenseData) => {
    // Clear the countdown timer since user confirmed manually
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSaving(true);
    try {
      await api.expenses.create(expenseData);
      onSuccess(); // Tell parent to refresh the expense list
    } catch (err) {
      setError('Failed to save expense: ' + err.message);
      setSaving(false);
    }
  };

  // Cancel the preview and go back to typing
  const handleCancelPreview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPreview(null);
    setCountdown(3);
  };

  return (
    <div className="ai-input-container">
      <div className="ai-input-header">
        <h3>✨ AI Expense Input</h3>
        <p>Describe your expense in plain English</p>
      </div>

      {/* Text input */}
      {!preview && (
        <>
          <div className="ai-input-row">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g. "I had lunch at Subway for $7 today"'
              className="ai-text-input"
              // Allow pressing Enter to submit
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              disabled={parsing}
            />
            <button
              className="btn-ai"
              onClick={handleParse}
              disabled={parsing || !text.trim()}
            >
              {parsing ? (
                <><span className="spinner" /> Parsing...</>
              ) : (
                '✨ Parse'
              )}
            </button>
          </div>

          {/* Example phrases to help the user */}
          <div className="ai-input-examples">
            <span>Try: </span>
            {[
              'Grabbed coffee for $3.50',
              'Uber to airport $24',
              'Grocery run yesterday $45',
            ].map(example => (
              <button
                key={example}
                className="example-chip"
                onClick={() => setText(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* Preview card — shown after AI parses the expense */}
      {preview && (
        <div className="ai-preview-card">
          <div className="ai-preview-header">
            <span className="ai-preview-label">Adding expense in {countdown}s...</span>
            <div className="ai-preview-countdown">
              {/* Animated countdown ring */}
              <svg viewBox="0 0 36 36" className="countdown-ring">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray={`${(countdown / 3) * 94} 94`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span>{countdown}</span>
            </div>
          </div>

          {/* Preview details */}
          <div className="ai-preview-details">
            <div className="ai-preview-row">
              <span className="ai-preview-icon">
                {CATEGORY_EMOJI[preview.category] || '📦'}
              </span>
              <div className="ai-preview-info">
                <strong>{preview.title}</strong>
                <span>{preview.category} · {preview.expense_date}</span>
                {preview.notes && <span className="ai-preview-notes">{preview.notes}</span>}
              </div>
              <span className="ai-preview-amount">${parseFloat(preview.amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="ai-preview-actions">
            <button
              className="btn-secondary"
              onClick={handleCancelPreview}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => handleConfirm(preview)}
              disabled={saving}
            >
              {saving ? 'Saving...' : '✓ Confirm Now'}
            </button>
          </div>
        </div>
      )}

      {/* Cancel button to go back to manual input */}
      {!preview && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="btn-link" onClick={onCancel}>
            Switch to manual input
          </button>
        </div>
      )}
    </div>
  );
};

export default AIExpenseInput;
