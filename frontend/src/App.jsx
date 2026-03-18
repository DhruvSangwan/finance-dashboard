// =============================================================
// APP ROOT (src/App.jsx)
// Sets up routing — which URL shows which page component
// Also wraps the whole app in AuthProvider (global auth state)
// =============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';

// ---------------------------------------------------------------
// ProtectedRoute: Only renders children if user is logged in
// If not logged in, redirects to /login
// ---------------------------------------------------------------
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ---------------------------------------------------------------
// Main App component with all routes defined
// ---------------------------------------------------------------
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        // If already logged in, go straight to dashboard
        isLoggedIn ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/signup" element={
        isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />
      } />

      {/* Protected route — requires login */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Default: redirect root to dashboard (or login if not authenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* Catch-all: any unknown URL goes to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App = () => {
  return (
    // BrowserRouter enables client-side routing (no page reloads)
    <BrowserRouter>
      {/* AuthProvider wraps everything so all components can access auth */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
