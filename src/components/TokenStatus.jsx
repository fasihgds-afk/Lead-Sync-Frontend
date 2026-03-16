import { useCallback, useEffect, useState } from 'react';
import tokenManager from '../utils/tokenManager';

const PUBLIC_ROUTES = new Set(['/', '/login', '/signup']);
const LOGIN_PATH = '/login';

const isPublicRoute = () => PUBLIC_ROUTES.has(window.location.pathname);
const redirectToLogin = () => {
  if (!isPublicRoute()) window.location.replace(LOGIN_PATH);
};

export default function TokenStatus() {
  const [status, setStatus] = useState(null);
  const [warning, setWarning] = useState(false);
  const [visible, setVisible] = useState(false);

  const clearAuth = () => tokenManager.clearAuthData();

  const updateStatus = useCallback(() => {
    if (isPublicRoute()) return;

    const nextStatus = tokenManager.getTokenStatus();
    setStatus(nextStatus);

    const expiring = nextStatus?.expiringSoon || nextStatus?.expired;
    setWarning(expiring);

    if (nextStatus?.expired) {
      setVisible(true);
      // Don't auto-redirect immediately, let user see the expired message
    }
  }, []);

  useEffect(() => {
    if (isPublicRoute()) return;

    tokenManager.initializeMonitoring();
    updateStatus();

    const onExpired = () => {
      updateStatus();
    };

    const onExpiringSoon = () => {
      updateStatus();
    };

    const onLoginSuccess = () => {
      setVisible(false);
      setWarning(false);
    };

    window.addEventListener('tokenExpired', onExpired);
    window.addEventListener('tokenExpiringSoon', onExpiringSoon);
    window.addEventListener('loginSuccess', onLoginSuccess);

    const intervalId = setInterval(updateStatus, 15000); // Check more frequently for smoothness

    return () => {
      window.removeEventListener('tokenExpired', onExpired);
      window.removeEventListener('tokenExpiringSoon', onExpiringSoon);
      window.removeEventListener('loginSuccess', onLoginSuccess);
      clearInterval(intervalId);
    };
  }, [updateStatus]);

  if (isPublicRoute() || !status) return null;

  if (warning || status.expired) {
    return (
      <div className={`fixed top-6 right-6 z-[9999] animate-slideDown`}>
        <div className="flex items-center gap-4 p-5 rounded-2xl shadow-2xl border"
          style={{
            backgroundColor: "#0f172a", // Deep black-blue
            borderColor: status.expired ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)",
            boxShadow: status.expired
              ? "0 10px 30px -5px rgba(239, 68, 68, 0.3)"
              : "0 10px 30px -5px rgba(245, 158, 11, 0.3)"
          }}>

          {/* Icon Container */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl`}
            style={{
              background: status.expired
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(245, 158, 11, 0.1)"
            }}>
            <svg className={`h-6 w-6 ${status.expired ? 'text-red-500' : 'text-amber-500'} animate-pulse`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Text Content */}
          <div>
            <h4 className="text-sm font-black tracking-tight uppercase"
              style={{ color: status.expired ? "#ef4444" : "#f59e0b" }}>
              {status.expired ? 'Session Expired' : 'Session Expiring Soon'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-slate-400">Remaining:</span>
              <span className={`text-xs font-bold ${status.expired ? 'text-red-400' : 'text-amber-400'}`}>
                {status.formattedTime}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button onClick={() => {
            clearAuth();
            window.location.href = '/login';
          }}
            className="ml-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: status.expired
                ? "linear-gradient(135deg, #ef4444, #991b1b)"
                : "linear-gradient(135deg, #f59e0b, #b45309)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}>
            {status.expired ? 'Login Now' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-slate-900/40 backdrop-blur-md shadow-lg opacity-40 hover:opacity-100 transition-opacity cursor-default group">

    </div>
  );
}
