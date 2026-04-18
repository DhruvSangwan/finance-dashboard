// =============================================================
// CURRENCY CONTEXT (context/CurrencyContext.jsx)
// Stores the user's preferred currency (₹ or $) globally.
// Persists in localStorage so it survives page refreshes.
//
// Usage in any component:
//   const { symbol, format } = useCurrency();
//   format(1234.56) → "₹1,234.56" or "$1,234.56"
// =============================================================

import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('currency') || 'INR'
  );

  const symbol = currency === 'INR' ? '₹' : '$';

  // Formats a number as currency string
  const format = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${symbol}${num.toFixed(2)}`;
  };

  const toggleCurrency = () => {
    const next = currency === 'INR' ? 'USD' : 'INR';
    localStorage.setItem('currency', next);
    setCurrency(next);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, format, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
};
