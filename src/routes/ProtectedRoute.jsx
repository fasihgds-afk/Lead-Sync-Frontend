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

    // Stable key derived from VALUES, not the array reference.
    const rolesKey = useMemo(
        () => [...allowedRoles].map((r) => String(r).toLowerCase().trim()).sort().join('|'),
        [allowedRoles]
    );

    const hasRoleRestriction = allowedRoles.length > 0;
    const isAuthorized = !hasRoleRestriction || hasRequiredRole(userRole, allowedRoles);

    // Avoid firing the same redirect twice (e.g. StrictMode double-invoke, or
    // parent + child ProtectedRoute mounting in the same tick).
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

        // status === 'authenticated' from here on
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAuthorized, rolesKey, navigate]);

    // Still resolving global auth state -> one shared loader, no flicker.
    if (status === 'checking') {
        return <SharedLoader />;
    }

    // Not authenticated or not authorized -> render nothing; effect above is
    // already navigating away. Returning null avoids a content flash.
    if (!isAuthenticated || !isAuthorized) {
        return null;
    }

    return children;
};

export default ProtectedRoute;