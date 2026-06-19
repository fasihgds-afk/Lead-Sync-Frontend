import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';
import SharedLoader from './SharedLoader';
import { getRoleBasedRedirect, hasRequiredRole } from '../utils/roleRedirect';

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
      const userRole = userData.role || userData.department;

      // Role Authorization Check using centralized utility
      if (allowedRoles.length > 0 && !hasRequiredRole(userRole, allowedRoles)) {
        console.log('Unauthorized access attempt:', { userRole, allowedRoles });

        // Redirect to their own dashboard using centralized utility
        const redirectPath = getRoleBasedRedirect(userRole);
        
        if (redirectPath === '/unauthorized') {
          console.log('No matching role found, clearing auth and redirecting to home');
          tokenManager.clearAuthData();
          navigate('/', { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
        return;
      }

      setIsAuthenticated(true);
      setUser(userData);
    } else {
      navigate('/login', { replace: true });
    }

    setLoading(false);
  }, [allowedRoles, navigate]);

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
