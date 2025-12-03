import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function ProtectedRoute({ children }) {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    // If the user is not authenticated, redirect them to the landing page.
    return <Navigate to="/landing" replace />;
  }

  // If the user is authenticated, render the child components.
  return children;
}
  
export default ProtectedRoute;