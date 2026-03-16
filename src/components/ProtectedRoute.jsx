import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import SharedLoader from './SharedLoader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = tokenManager.getToken();

    if (token) {
      if (!tokenManager.isCurrentTokenValid()) {
        console.log('Expired or invalid token detected in ProtectedRoute, redirecting...');
        tokenManager.clearAuthData();
        navigate('/login', { replace: true });
        return;
      }

      const userData = tokenManager.getUser();

      // Role Authorization Check
      if (allowedRoles.length > 0) {
        const userRole = userData.role || userData.department;
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        const normalizedUserRole = userRole?.toLowerCase();

        if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
          console.log('Unauthorized access attempt:', { userRole, allowedRoles });

          // Redirect to their own dashboard based on their actual role
          let path = '/';
          if (normalizedUserRole === 'admin' || normalizedUserRole === 'super admin') {
            path = '/gds/admin';
          } else if (normalizedUserRole === 'manager') {
            path = '/gds/manager';
          } else if (normalizedUserRole === 'data minors') {
            path = '/gds/data-minor';
          } else if (normalizedUserRole === 'lead qualifiers') {
            path = '/gds/lead-qualifier';
          } else if (normalizedUserRole === 'verifier') {
            path = '/gds/verifier';
          } else {
            console.log('No matching role found, clearing auth and redirecting to home');
            tokenManager.clearAuthData();
          }

          navigate(path, { replace: true });
          return;
        }
      }

      setIsAuthenticated(true);
      setUser(userData);
    } else {
      navigate('/login', { replace: true });
    }

    setLoading(false);
  }, [allowedRoles]);

  // Show loading while checking authentication
  if (loading) {
    return <SharedLoader />;
  }

  // If not authenticated, the useEffect will redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
