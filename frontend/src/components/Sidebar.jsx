// =============================================================
// SIDEBAR (components/Sidebar.jsx)
// Left navigation — always visible desktop, hamburger on mobile
// =============================================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '🏠' },
  { path: '/expenses',   label: 'Expenses',   icon: '💸' },
  { path: '/analytics',  label: 'Analytics',  icon: '📊' },
  { path: '/budget',     label: 'Budget',     icon: '🎯' },
  { path: '/settings',   label: 'Settings',   icon: '⚙️' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { symbol, toggleCurrency, currency } = useCurrency();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        <div className="sidebar-brand">
          <span className="sidebar-logo">💰</span>
          <span className="sidebar-title">FinanceAI</span>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Currency quick toggle */}
          <button className="currency-toggle" onClick={toggleCurrency}>
            <span>{symbol}</span>
            <span>{currency === 'INR' ? 'Switch to $' : 'Switch to ₹'}</span>
          </button>
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
