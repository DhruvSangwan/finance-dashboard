// =============================================================
// APP ROOT (src/App.jsx)
// All routes, providers (Auth + Currency), Layout wrapper
// =============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import './App.css';

// Wraps protected pages in Layout (sidebar) and redirects if not logged in
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route path="/login"     element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup"    element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/expenses"  element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/budget"    element={<ProtectedRoute><Budget /></ProtectedRoute>} />
      <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/"          element={<Navigate to="/dashboard" />} />
      <Route path="*"          element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CurrencyProvider>
        <AppRoutes />
      </CurrencyProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
