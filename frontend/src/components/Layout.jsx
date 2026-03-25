// =============================================================
// LAYOUT (components/Layout.jsx)
// Wraps all protected pages with the sidebar.
// Manages the open/close state of the mobile sidebar.
//
// Usage: wrap any page with <Layout><YourPage /></Layout>
// =============================================================

import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  // Track whether sidebar is open on mobile
  // On desktop this doesn't matter — sidebar is always visible via CSS
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">

      {/* Sidebar — receives open state and close handler */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — everything to the right of the sidebar */}
      <div className="layout-main">

        {/* Top bar — only visible on mobile, contains hamburger button */}
        <div className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            {/* Three lines = hamburger icon, drawn with CSS */}
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <span className="mobile-brand">💰 FinanceAI</span>
        </div>

        {/* Page content */}
        <main className="layout-content">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;
