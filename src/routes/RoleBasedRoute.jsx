import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserRole, hasRequiredRole } from '../utils/roleRedirect';
import tokenManager from '../utils/tokenManager';

export const RoleBasedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const userRole = getUserRole();

  const token = tokenManager.getToken();
  if (!token || !tokenManager.isCurrentTokenValid()) {

    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (!hasRequiredRole(userRole, requiredRoles)) {

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;