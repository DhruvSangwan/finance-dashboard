// =============================================================
// SETTINGS PAGE (pages/Settings.jsx)
// Dark mode, currency toggle, profile display, about section
// =============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const Settings = () => {
  const { user } = useAuth();
  const { currency, symbol, toggleCurrency } = useCurrency();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences and profile</p>
        </div>
      </div>

      {/* Profile */}
      <div className="settings-card">
        <h3>Profile</h3>
        <div className="profile-row">
          <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-card">
        <h3>Appearance</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Dark Mode</strong>
            <span>Switch between light and dark theme</span>
          </div>
          <div className={`toggle-switch ${darkMode ? 'toggle-on' : ''}`} onClick={() => setDarkMode(!darkMode)}>
            <div className="toggle-thumb" />
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Current Theme</strong>
            <span>{darkMode ? '🌙 Dark mode is on' : '☀️ Light mode is on'}</span>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="settings-card">
        <h3>Currency</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Active Currency</strong>
            <span>{currency === 'INR' ? '🇮🇳 Indian Rupee (₹)' : '🇺🇸 US Dollar ($)'}</span>
          </div>
          <button className="btn-secondary" onClick={toggleCurrency}>
            Switch to {currency === 'INR' ? '$' : '₹'}
          </button>
        </div>
        <div className="settings-note">
          Note: This only changes the display symbol. No actual conversion is applied.
        </div>
      </div>

      {/* About */}
      <div className="settings-card">
        <h3>About this App</h3>
        <div className="about-grid">
          {[
            { label: 'Frontend', value: 'React 18 + Recharts' },
            { label: 'Backend', value: 'Node.js + Express' },
            { label: 'Database', value: 'PostgreSQL' },
            { label: 'Auth', value: 'JWT + bcrypt' },
            { label: 'AI', value: 'Groq — llama-3.3-70b' },
            { label: 'Deployment', value: 'Render (free tier)' },
          ].map(item => (
            <div key={item.label} className="about-item">
              <span className="about-label">{item.label}</span>
              <span className="about-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
