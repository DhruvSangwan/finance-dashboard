// =============================================================
// EXPENSES PAGE (pages/Expenses.jsx)
// Category filter chips, sort options, AI search, AI input toggle
// Reads ?add=true from URL to auto-open add form (from FAB)
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import AIExpenseInput from '../components/AIExpenseInput';
import { SkeletonExpenseItem } from '../components/Skeleton';
import { api } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import { exportToCSV } from '../utils/csvExport';
import toast from '../utils/toast';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦', All: '📋'
};

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
];

const Expenses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { symbol } = useCurrency();

  const [expenses, setExpenses] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [addMode, setAddMode] = useState('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.expenses.getAll(selectedMonth);
      setExpenses(data);
      setSearchResults(null);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // Clear ?add=true from URL after opening form
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      setSearchParams({});
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    setError('');
    try {
      const data = await api.ai.searchExpenses(searchQuery);
      setSearchResults(data.expenses);
      setSearchMessage(data.message);
      toast.info(data.message);
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResults(null); setSearchMessage(''); };

  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      options.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      });
    }
    return options;
  };

  // Apply category filter and sort
  const baseExpenses = searchResults !== null ? searchResults : expenses;

  const filtered = baseExpenses.filter(e =>
    activeCategory === 'All' ? true : e.category === activeCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.expense_date) - new Date(a.expense_date);
    if (sortBy === 'date-asc') return new Date(a.expense_date) - new Date(b.expense_date);
    if (sortBy === 'amount-desc') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortBy === 'amount-asc') return parseFloat(a.amount) - parseFloat(b.amount);
    return 0;
  });

  const totalShown = sorted.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Manage and search all your expenses</p>
        </div>
        <div className="header-actions">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="month-select">
            {getMonthOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => exportToCSV(expenses, symbol)}>📥 CSV</button>
          <button className="btn-primary" onClick={() => { setShowAddForm(true); setAddMode('manual'); }}>+ Add</button>
        </div>
      </div>

      {/* Add Expense modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div className="add-mode-toggle">
              <button className={`mode-btn ${addMode === 'manual' ? 'active' : ''}`} onClick={() => setAddMode('manual')}>✏️ Manual</button>
              <button className={`mode-btn ${addMode === 'ai' ? 'active' : ''}`} onClick={() => setAddMode('ai')}>✨ AI Input</button>
            </div>
            {addMode === 'manual'
              ? <ExpenseForm onSuccess={() => { setShowAddForm(false); loadExpenses(); }} onCancel={() => setShowAddForm(false)} inline />
              : <AIExpenseInput onSuccess={() => { setShowAddForm(false); loadExpenses(); }} onCancel={() => setAddMode('manual')} />
            }
          </div>
        </div>
      )}

      {/* AI Search */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='AI Search: "food this week", "most expensive", "transport last month"...'
            className="search-input"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && <button className="search-clear" onClick={clearSearch}>✕</button>}
          <button className="btn-ai search-btn" onClick={handleSearch} disabled={searching}>
            {searching ? <><span className="spinner" />Searching...</> : '✨ Search'}
          </button>
        </div>
        {searchResults !== null && (
          <div className="search-result-bar">
            <span>{searchMessage}</span>
            <button className="btn-link" onClick={clearSearch}>Clear — show all</button>
          </div>
        )}
        {!searchResults && (
          <div className="search-hints">
            Try: &nbsp;
            {['food this week', 'most expensive', 'transport', 'last 5 days'].map(hint => (
              <button key={hint} className="example-chip" onClick={() => setSearchQuery(hint)}>{hint}</button>
            ))}
          </div>
        )}
      </div>

      {/* Category filter chips */}
      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${activeCategory === cat ? 'filter-chip-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_EMOJI[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Sort + total bar */}
      <div className="list-controls">
        <span className="list-total">
          {sorted.length} expense{sorted.length !== 1 ? 's' : ''} · Total: <strong>{symbol}{totalShown.toFixed(2)}</strong>
        </span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Expense list */}
      {loading ? (
        <div className="expense-list">
          {[1,2,3,4,5].map(i => <SkeletonExpenseItem key={i} />)}
        </div>
      ) : (
        <ExpenseList expenses={sorted} onRefresh={loadExpenses} />
      )}
    </div>
  );
};

export default Expenses;
