// src/components/Nav.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

// Option 1: Accept state and dispatch as props
export default function Nav({ state = {}, dispatch = () => {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/landing");
  };

  // Get current workspace info
  const currentWorkspace = state.workspaces?.find(
    (workspace) => workspace.id === state.currentWorkspace
  );

  // Add default state to prevent errors
  const safeState = {
    isAuthenticated: state.isAuthenticated || false,
    user: state.user || { name: "User" },
    workspaces: state.workspaces || [],
    currentWorkspace: state.currentWorkspace || null,
    ...state
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <h1 className="logo">CollabTrack</h1>
        </Link>

        {/* Always show navigation for testing */}
        {safeState.isAuthenticated ? (
          <>
            <nav className="nav">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                } 
                end
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Dashboard
              </NavLink>
              <NavLink 
                to="/workspace" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Workspace
              </NavLink>
              <NavLink 
                to="/projects" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Projects
              </NavLink>
            </nav>

            <div className="header-right">
              <div className="workspace-indicator">
                <div
                  className="workspace-dot"
                  style={{
                    backgroundColor: currentWorkspace?.color || "#4f46e5",
                  }}
                />
                <span className="current-workspace">
                  {currentWorkspace?.name || "Workspace"}
                </span>
              </div>
              <span className="user-name">Hello, {safeState.user?.name}</span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </>
        ) : (
          // Show minimal header when not authenticated
          <div className="header-right">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}