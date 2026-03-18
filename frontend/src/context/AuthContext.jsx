// =============================================================
// AUTH CONTEXT (context/AuthContext.jsx)
// React Context lets us share data across ALL components
// without passing props down through every level.
// Think of it as a "global variable" for React.
//
// This context stores: who is logged in + login/logout functions
// =============================================================

import { createContext, useContext, useState } from 'react';

// Step 1: Create the context object
const AuthContext = createContext(null);

// Step 2: Create the Provider component
// Wrap your whole app in this so every component can access auth state
export const AuthProvider = ({ children }) => {
  
  // Initialize user from localStorage (so login persists on refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Called after successful login or signup
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Called when user clicks logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // The value object is what components get when they use this context
  const value = {
    user,           // null if logged out, { id, name, email } if logged in
    login,          // function to call after successful login
    logout,         // function to call on logout
    isLoggedIn: !!user, // true/false shortcut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 3: Custom hook for easy usage
// Instead of: const { user } = useContext(AuthContext)
// Just write: const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
