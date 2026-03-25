// =============================================================
// EXPENSES PAGE (pages/Expenses.jsx)
// Full expense management:
// - Add expense (manual form OR AI natural language input)
// - AI-powered search bar
// - Full expense list with edit/delete
// - Month filter + CSV export
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import AIExpenseInput from '../components/AIExpenseInput';
import { api } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);           // All expenses for selected month
  const [searchResults, setSearchResults] = useState(null); // null = not searching, [] = no results
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState('manual');        // 'manual' or 'ai'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Load expenses for the selected month
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.expenses.getAll(selectedMonth);
      setExpenses(data);
      // Clear search results when month changes
      setSearchResults(null);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // ---------------------------------------------------------------
  // AI SEARCH
  // Sends the query to the backend which uses Groq to find matches
  // ---------------------------------------------------------------
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Empty search = clear results and show all expenses
      setSearchResults(null);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const data = await api.ai.searchExpenses(searchQuery);
      setSearchResults(data.expenses);
      setSearchMessage(data.message);
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Clear search and show all expenses again
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchMessage('');
  };

  // Month dropdown options (last 6 months)
  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  // Which expenses to show — search results or full list
  const displayedExpenses = searchResults !== null ? searchResults : expenses;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Manage and search your expenses</p>
        </div>
        <div className="header-actions">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-select"
          >
            {getMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={() => exportToCSV(expenses)}>
            📥 Export CSV
          </button>
          <button className="btn-primary" onClick={() => { setShowAddForm(true); setAddMode('manual'); }}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* Add Expense — Manual or AI mode */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
            </div>

            {/* Toggle between Manual and AI input */}
            <div className="add-mode-toggle">
              <button
                className={`mode-btn ${addMode === 'manual' ? 'active' : ''}`}
                onClick={() => setAddMode('manual')}
              >
                ✏️ Manual
              </button>
              <button
                className={`mode-btn ${addMode === 'ai' ? 'active' : ''}`}
                onClick={() => setAddMode('ai')}
              >
                ✨ AI Input
              </button>
            </div>

            {addMode === 'manual' ? (
              <ExpenseForm
                onSuccess={() => { setShowAddForm(false); loadExpenses(); }}
                onCancel={() => setShowAddForm(false)}
                inline={true}
              />
            ) : (
              <AIExpenseInput
                onSuccess={() => { setShowAddForm(false); loadExpenses(); }}
                onCancel={() => setAddMode('manual')}
              />
            )}
          </div>
        </div>
      )}

      {/* AI Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='AI Search: "food this week", "most expensive day", "all transport"...'
            className="search-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button className="search-clear" onClick={clearSearch}>✕</button>
          )}
          <button
            className="btn-ai search-btn"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? <><span className="spinner" /> Searching...</> : '✨ Search'}
          </button>
        </div>

        {/* Search result message */}
        {searchResults !== null && (
          <div className="search-result-bar">
            <span>{searchMessage}</span>
            <button className="btn-link" onClick={clearSearch}>
              Clear — show all
            </button>
          </div>
        )}

        {/* Search example hints */}
        {!searchResults && (
          <div className="search-hints">
            Try: &nbsp;
            {['food this week', 'most expensive', 'transport last month', 'first 5 days'].map(hint => (
              <button key={hint} className="example-chip" onClick={() => setSearchQuery(hint)}>
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Expense list */}
      <div className="section">
        <h2>
          {searchResults !== null ? 'Search Results' : 'All Expenses'}
          <span className="section-count">{displayedExpenses.length}</span>
        </h2>

        {loading ? (
          <div className="loading">Loading expenses...</div>
        ) : (
          <ExpenseList expenses={displayedExpenses} onRefresh={loadExpenses} />
        )}
      </div>
    </div>
  );
};

export default Expenses;
