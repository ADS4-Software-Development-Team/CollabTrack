import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function ProtectedRoute({ children }) {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return children;
}

export default ProtectedRoute;