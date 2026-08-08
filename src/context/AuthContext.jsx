import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import tokenManager from '../utils/tokenManager';


const AuthContext = createContext(null);

const isProd = process.env.NODE_ENV === 'production';
const log = (...args) => { if (!isProd) console.log(...args); };

const getInitialAuthState = () => {
    try {
        const token = tokenManager.getToken();
        if (!token || !tokenManager.isCurrentTokenValid()) {
            tokenManager.clearAuthData();
            return { status: 'unauthenticated', user: null };
        }
        const userData = tokenManager.getUser();
        if (!userData) {
            tokenManager.clearAuthData();
            return { status: 'unauthenticated', user: null };
        }
        return { status: 'authenticated', user: userData };
    } catch {
        return { status: 'unauthenticated', user: null };
    }
};

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState(getInitialAuthState);

    const loadAuth = useCallback(() => {
        setAuthState(getInitialAuthState());
    }, []);

    // Run once on mount. Re-run on the custom tokenExpired event (fired by tokenManager's
    // own scheduled timers), not on every route change — route changes don't change
    // whether the token is valid.
    useEffect(() => {
        loadAuth();

        const handleTokenExpired = (event) => {
            log('AuthContext: token expired -', event.detail?.message || 'session expired');
            tokenManager.clearAuthData();
            setAuthState({ status: 'unauthenticated', user: null });
        };

        const handleLoginSuccess = () => {
            log('AuthContext: login success event received');
            loadAuth();
        };

        window.addEventListener('tokenExpired', handleTokenExpired);
        window.addEventListener('loginSuccess', handleLoginSuccess);
        tokenManager.scheduleTimers();

        return () => {
            window.removeEventListener('tokenExpired', handleTokenExpired);
            window.removeEventListener('loginSuccess', handleLoginSuccess);
            tokenManager.clearTimers();
        };
    }, [loadAuth]);

    // logout is exposed so any component (e.g. a logout button) can update
    // context state immediately instead of waiting on a re-mount.
    const logout = useCallback(() => {
        tokenManager.clearAuthData();
        tokenManager.clearTimers();
        setAuthState({ status: 'unauthenticated', user: null });
    }, []);

    // Call after a successful login API call to sync context immediately
    // without a full page reload.
    const refreshAuth = useCallback(() => {
        loadAuth();
    }, [loadAuth]);

    const userRole = authState.user?.role || authState.user?.department || null;

    const value = useMemo(
        () => ({
            status: authState.status,
            user: authState.user,
            userRole,
            isAuthenticated: authState.status === 'authenticated',
            isChecking: authState.status === 'checking',
            logout,
            refreshAuth,
        }),
        [authState.status, authState.user, userRole, logout, refreshAuth]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}