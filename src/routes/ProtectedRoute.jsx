import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SharedLoader from '../components/SharedLoader';
import { getRoleBasedRedirect, hasRequiredRole } from '../utils/roleRedirect';

const isProd = process.env.NODE_ENV === 'production';
const log = (...args) => { if (!isProd) console.log(...args); };

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { status, userRole, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const rolesKey = useMemo(
        () => [...allowedRoles].map((r) => String(r).toLowerCase().trim()).sort().join('|'),
        [allowedRoles]
    );

    const hasRoleRestriction = allowedRoles.length > 0;
    const isAuthorized = !hasRoleRestriction || hasRequiredRole(userRole, allowedRoles);

    const hasRedirected = useRef(false);

    useEffect(() => {
        if (status === 'checking') return;

        if (status === 'unauthenticated') {
            if (!hasRedirected.current) {
                hasRedirected.current = true;
                navigate('/login', { replace: true });
            }
            return;
        }

        if (!isAuthorized) {
            if (hasRedirected.current) return;
            hasRedirected.current = true;

            log('ProtectedRoute: unauthorized access attempt', { userRole, allowedRoles });
            const redirectPath = getRoleBasedRedirect(userRole);

            if (redirectPath === '/unauthorized') {
                navigate('/', { replace: true });
            } else {
                navigate(redirectPath, { replace: true });
            }
        }
    }, [status, isAuthorized, rolesKey, navigate]);

    if (status === 'checking') {
        return <SharedLoader />;
    }

    if (!isAuthenticated || !isAuthorized) {
        return null;
    }

    return children;
};

export default ProtectedRoute;