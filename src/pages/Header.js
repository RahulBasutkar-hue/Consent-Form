import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, profile } = useAuth();

  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = profile.name || profile.username || 'User';

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-mark">YA</span>
          <div className="logo-text">
            <h2>Your App</h2>
            <span>Enterprise workspace</span>
          </div>
        </div>

        <nav className="header-nav" aria-label="Primary">
          <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            Profile
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            Settings
          </NavLink>
        </nav>

        <div className="user-menu">
          <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
          <div className="header-user-block">
            <span className="header-user">{displayName}</span>
            <span className="header-user-role">{profile.email || 'Signed in'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
