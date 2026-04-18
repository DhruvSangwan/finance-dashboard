// =============================================================
// LAYOUT (components/Layout.jsx)
// Wraps all protected pages with sidebar + floating add button
// =============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show floating button on all pages except settings
  const showFab = location.pathname !== '/settings';

  const handleFabClick = () => {
    // Navigate to expenses page and open the add form
    navigate('/expenses?add=true');
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-main">
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <span className="mobile-brand">💰 FinanceAI</span>
        </div>

        <main className="layout-content">
          {children}
        </main>
      </div>

      {/* Floating action button — always visible, opens add expense */}
      {showFab && (
        <button className="fab" onClick={handleFabClick} title="Add Expense">
          +
        </button>
      )}
    </div>
  );
};

export default Layout;
