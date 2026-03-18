// =============================================================
// NAVBAR (components/Navbar.jsx)
// Top navigation bar with user info and logout button
// =============================================================

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // Clear token + user from context and localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">💰 FinanceAI</div>
      
      <div className="navbar-right">
        {/* Show first letter of name as avatar */}
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="user-name">{user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
