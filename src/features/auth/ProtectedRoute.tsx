import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { canAccessRoute, getAccessDeniedMessage } from '../../config/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check explicit allowedRoles prop or fallback to route configuration
  const isAuthorized = allowedRoles
    ? allowedRoles.includes(user.role)
    : canAccessRoute(user.role, location.pathname);

  if (!isAuthorized) {
    const deniedMessage = getAccessDeniedMessage(user.role, location.pathname);
    return <Navigate to="/dashboard" state={{ deniedMessage }} replace />;
  }

  return <>{children}</>;
};
