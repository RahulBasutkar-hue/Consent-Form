import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiHome, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const navItems = [
  { to: '/home', label: 'Home', icon: FiHome },
  { to: '/profile', label: 'Profile', icon: FiUser },
  { to: '/settings', label: 'Settings', icon: FiSettings }
];

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the account menu on outside click, Escape, or route change.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = profile.name || profile.username || 'User';
  const linkClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <NavLink to="/home" className="logo" aria-label="Arjun Capital home">
            <span className="logo-mark" aria-hidden="true">ARJ</span>
            <div className="logo-text">
              <h2>Arjun Capital</h2>
              <span>Smart Engagement Engine</span>
            </div>
          </NavLink>

          <nav className="header-nav" aria-label="Primary">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className={`user-menu-trigger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="user-avatar" aria-hidden="true">{getInitials(displayName)}</span>
              <span className="header-user-block">
                <span className="header-user">{displayName}</span>
                <span className="header-user-role">{profile.email || 'Signed in'}</span>
              </span>
              <FiChevronDown className="user-menu-caret" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="user-dropdown" role="menu">
                <div className="user-dropdown-head">
                  <span className="user-avatar user-avatar-lg" aria-hidden="true">{getInitials(displayName)}</span>
                  <div>
                    <p className="user-dropdown-name">{displayName}</p>
                    <p className="user-dropdown-email">{profile.email || profile.username || 'Signed in'}</p>
                  </div>
                </div>
                <NavLink to="/profile" role="menuitem" className="user-dropdown-item">
                  <FiUser aria-hidden="true" /> My profile
                </NavLink>
                <NavLink to="/settings" role="menuitem" className="user-dropdown-item">
                  <FiSettings aria-hidden="true" /> Settings
                </NavLink>
                <div className="user-dropdown-sep" />
                <button type="button" role="menuitem" className="user-dropdown-item logout-btn" onClick={handleLogout}>
                  <FiLogOut aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabbar" aria-label="Primary mobile">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Header;
