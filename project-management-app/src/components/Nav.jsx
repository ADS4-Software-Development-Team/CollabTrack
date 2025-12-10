// src/components/Nav.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

export default function Nav({ state = {}, dispatch = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    // Check authentication status from localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const authStatus = token || state.isAuthenticated;
    const role = state.user?.role || user?.role || 'user';
    
    setIsAuthenticated(!!authStatus);
    setUserRole(role);
  }, [state, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: "LOGOUT" });
    setIsAuthenticated(false);
    navigate("/");
  };

  // Get user info
  const userInfo = state.user || JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userInfo?.name || userInfo?.first_name || 'User';

  const isAdmin = userRole === 'admin' || userRole === 'manager';
  const isTeamMember = userRole === 'team_member';
  const isProjectManager = userRole === 'project_manager';
  
  // Function to get dashboard path based on role
  const getDashboardPath = () => {
    if (isAdmin) return "/dashboard"; // admin dashboard
    if (isProjectManager) return "/managerDashboard"; // project manager dashboard
    if (isTeamMember) return "/teamDashboard"; // team member dashboard
    return "/dashboard"; // fallback
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo on left */}
        <Link to="/" className="logo-link">
          <h1 className="logo">CollabTrack</h1>
        </Link>

        {/* Navigation in center - ONLY when authenticated */}
        {isAuthenticated ? (
          <>
            <nav className="nav">
              {/* Show different navigation based on user role */}
              {isAdmin ? (
                // Admin Navigation (matches your image)
                <>
                  <NavLink 
                    to={getDashboardPath()} // Use dynamic dashboard path
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
                   Dashboard
                  </NavLink>
                  
                  <NavLink 
                    to="/manage-users" 
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <polyline points="17 11 19 13 23 9" />
                    </svg>
                    Manager
                  </NavLink>
                  
                  <NavLink 
                    to="/view-data" 
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
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    View Data
                  </NavLink>
                </>
              ) : isTeamMember ? (
                // Team Member Navigation
                <>
                  <NavLink 
                    to={getDashboardPath()} // Use dynamic dashboard path
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
                   Dashboard
                  </NavLink>
                  <NavLink 
                    to="/tasks" 
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
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    My Tasks
                  </NavLink>
                  
                  <NavLink 
                    to="/projectBoard" 
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Chat
                  </NavLink>
                </>
              ): isProjectManager ? (
                // Project Manager Navigation
                <>
                  <NavLink 
                    to={getDashboardPath()} // Use dynamic dashboard path
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
                   Dashboard
                  </NavLink>
                  <NavLink 
                    to="/projectCharts" 
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
                    Charts
                  </NavLink>
                </>
              ): (
                // Default/Regular User Navigation (if needed)
                <>
                  <NavLink 
                    to={getDashboardPath()} // Use dynamic dashboard path
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/tasks" 
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    My Tasks
                  </NavLink>
                </>
              )}
            </nav>

            {/* User info and logout on right */}
            <div className="header-right">
              {/* User avatar/name with badge */}
              <div className="user-profile">
                <div className="user-avatar">
                  <div className="avatar-circle">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{userName}</span>
                    <div className="user-role-badge">
                      {userRole === 'admin' && <span className="badge-admin">Admin</span>}
                      {userRole === 'manager' && <span className="badge-manager">Manager</span>}
                      {userRole === 'team_member' && <span className="badge-team">Team</span>}
                      {userRole === 'project_manager' && <span className="badge-project-manager">Project Manager</span>}
                      {!['admin', 'manager', 'team_member', 'project_manager'].includes(userRole) && (
                        <span className="badge-user">User</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Logout button */}
              <button 
                onClick={handleLogout} 
                className="btn-logout"
                aria-label="Logout"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          // Show login/register buttons when NOT authenticated
          <div className="header-right">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 text-white-600 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 h-10 min-w-[100px] tracking-wide"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 hover:shadow-sm transition-all duration-200 h-10 min-w-[100px] tracking-wide"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}