// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - requiredRole:', requiredRole);

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If no specific role required, just check authentication
  if (!requiredRole) {
    return children;
  }

  // Check if user has the required role
  // Use 'user_role' first, with a fallback to 'role' for backward compatibility
  const currentUserRole = user.user_role || user.role;
  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.includes(currentUserRole)
    : currentUserRole === requiredRole;

  if (requiredRole && !hasRequiredRole) {
    return <div>403 Forbidden</div>;
  }

  return children;
}