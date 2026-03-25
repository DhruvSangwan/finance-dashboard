// =============================================================
// SIDEBAR (components/Sidebar.jsx)
// Left navigation panel with links to all pages.
// On desktop: always visible
// On mobile: hidden, toggled by hamburger button
//
// Props:
// - isOpen: boolean — is sidebar visible on mobile?
// - onClose: function — called when user clicks outside on mobile
// =============================================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation items — each has a path, label and emoji icon
const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '🏠' },
  { path: '/expenses',   label: 'Expenses',   icon: '💸' },
  { path: '/analytics',  label: 'Analytics',  icon: '📊' },
  { path: '/budget',     label: 'Budget',     icon: '🎯' },
  { path: '/settings',   label: 'Settings',   icon: '⚙️' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Dark overlay — only on mobile when sidebar is open */}
      {/* Clicking it closes the sidebar */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        {/* App logo / brand */}
        <div className="sidebar-brand">
          <span className="sidebar-logo">💰</span>
          <span className="sidebar-title">FinanceAI</span>
        </div>

        {/* User info section */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>

        {/* Navigation links */}
        {/* NavLink automatically adds "active" class when the path matches */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose} // Close sidebar on mobile after clicking a link
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button at the bottom */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
