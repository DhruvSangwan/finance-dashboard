// =============================================================
// SETTINGS PAGE (pages/Settings.jsx)
// Profile info + Dark mode toggle
//
// Dark mode works by adding/removing a "dark" class on <body>
// CSS variables then switch to dark values automatically
// The preference is saved in localStorage so it persists
// =============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  // Initialize dark mode from localStorage (persists across sessions)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode class to body whenever darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Also apply on first load (in case it was saved from a previous session)
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="settings-card">
        <h3>Profile</h3>
        <div className="profile-row">
          <div className="profile-avatar-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Appearance card */}
      <div className="settings-card">
        <h3>Appearance</h3>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Dark Mode</strong>
            <span>Switch between light and dark theme</span>
          </div>

          {/* Toggle switch */}
          {/* This is a custom CSS toggle — no library needed */}
          <div
            className={`toggle-switch ${darkMode ? 'toggle-on' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
            role="button"
            aria-label="Toggle dark mode"
          >
            <div className="toggle-thumb" />
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Current Theme</strong>
            <span>{darkMode ? '🌙 Dark' : '☀️ Light'}</span>
          </div>
        </div>
      </div>

      {/* About card */}
      <div className="settings-card">
        <h3>About</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Finance Dashboard</strong>
            <span>Built with React, Node.js, PostgreSQL & Groq AI</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>AI Provider</strong>
            <span>Groq — llama-3.3-70b-versatile (free tier)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
