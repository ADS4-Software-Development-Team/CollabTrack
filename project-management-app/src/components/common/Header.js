import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

function Header() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/landing');
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">ProjectTracker</h1>
        {state.isAuthenticated && (
          <nav className="nav">
            <NavLink to="/" className="nav-link" end>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className="nav-link">
              Projects
            </NavLink>
          </nav>
        )}
        {state.isAuthenticated && (
            <div className="header-right">
              <span className="user-name">Hello, {state.user?.name}</span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
        )}
      </div>
    </header>
  );
}

export default Header;