import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import DynamicSidebar from '../components/DynamicSidebar';
import TokenStatus from '../components/TokenStatus';
import tokenManager from '../utils/tokenManager';
import { dashboardConfig } from '../dashboards/dashboardConfig';
import { getRoleDisplayName, getDashboardTitleFromPath } from '../utils/roleRedirect';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Global Theme Management */
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Find current dashboard & page
  const currentDashboard = dashboardConfig.find(db =>
    location.pathname.startsWith(db.basePath)
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    currentDashboard?.hideSidebar ? false : window.innerWidth >= 1024
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  const currentPage = currentDashboard?.pages.find(page => {
    const fullPath = `${currentDashboard.basePath}${page.path ? '/' + page.path : ''}`;
    return (
      location.pathname === fullPath ||
      location.pathname === fullPath + '/'
    );
  });

  // Load user data
  useEffect(() => {
    const userData = tokenManager.getUser();
    setUser(userData);
  }, []);

  // Dynamic page title (tab title)
  useEffect(() => {
    const role = user?.role || user?.department;
    const roleLabel = role ? getRoleDisplayName(role) : null;

    const baseTitle = 'Lead Sync ';
    const dashboardLabel = currentDashboard?.name || getDashboardTitleFromPath(location.pathname, user?.role || user?.department);
    const pageLabel = currentPage?.name;

    const parts = [baseTitle];
    if (dashboardLabel) parts.push(dashboardLabel);
    if (pageLabel && pageLabel !== dashboardLabel) parts.push(pageLabel);
    if (roleLabel) parts.push(roleLabel);

    document.title = parts.filter(Boolean).join(' • ');
  }, [location.pathname, currentDashboard?.name, currentPage?.name, user?.role, user?.department]);

  // Handle responsive sidebar
  useEffect(() => {
    if (currentDashboard?.hideSidebar) {
      setIsSidebarOpen(false);
      return;
    }

    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsSidebarOpen(!isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentDashboard?.hideSidebar]);

  // Token validation & redirect
  useEffect(() => {
    if (!tokenManager.getToken() || !tokenManager.isCurrentTokenValid()) {
      tokenManager.clearAuthData();
      window.location.href = '/login';
      return;
    }

    tokenManager.initializeMonitoring();
  }, [navigate]);

  const confirmLogout = () => {
    tokenManager.clearAuthData();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] transition-colors duration-300">
      <TokenStatus />

      <DynamicSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        user={user}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen
          ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')
          : 'lg:ml-0'
          }`}
      >
        {/* Header */}
        <header
          className="h-16 flex items-center justify-between px-6 transition-all duration-300 sticky top-0 z-[50] border-b bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-sm"
        >
          <div className="flex items-center gap-4">
            {/* Desktop sidebar toggle - shows when sidebar is closed */}
            {!isSidebarOpen && !currentDashboard?.hideSidebar && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-white/10 shadow-sm text-[var(--accent-primary)]"
                title="Show Sidebar"
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h8M4 18h16" />
                </svg>
              </button>
            )}

            {/* Portal Identity - Premium Design */}
            <div className="flex items-center gap-4">
              {!isSidebarOpen && !currentDashboard?.hideSidebar && (
                <div className="h-10 w-px bg-[var(--border-primary)] hidden md:block mr-2" />
              )}
              {currentDashboard && (
                <div className="flex flex-col">

                  <div className="text-xs sm:text-[15px] font-black text-[var(--text-primary)] uppercase tracking-[-0.02em] leading-none">
                    {getDashboardTitleFromPath(location.pathname, user?.role || user?.department)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Page Context Pill */}
            {currentDashboard && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                  {currentPage?.name || 'Overview'}
                </span>
              </div>
            )}

            {/* Theme Toggle - High Visibility */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] transition-all duration-300 group border border-[var(--border-primary)] shadow-sm text-[var(--text-primary)]"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 transition-transform group-hover:rotate-45 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 transition-transform group-hover:-rotate-12 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Profile - Premium & Fully Visible */}
            <div className="flex items-center gap-5 border-l border-[var(--border-primary)] pl-6 ml-2">
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">
                  {user?.name || 'User'}
                </div>
                <div className="text-[7.5px] font-black text-[#00BE9B] uppercase tracking-[0.2em] mt-1.5 opacity-80">
                  Authentication Verified
                </div>
              </div>

              <div className="relative group/user cursor-pointer">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-[#00BE9B]/10 transition-all group-hover/user:scale-105 group-hover/user:rotate-2 border-2 border-[var(--border-primary)] ring-4 ring-transparent group-hover/user:ring-[#00BE9B]/5"
                  style={{
                    background: 'linear-gradient(135deg, #00BE9B, #00a082)',
                  }}
                >
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full shadow-lg" />

                {/* Profile Tooltip on Hover */}
                <div className="absolute top-[calc(100%+15px)] right-0 w-48 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl opacity-0 translate-y-2 group-hover/user:opacity-100 group-hover/user:translate-y-0 transition-all pointer-events-none z-[100]">
                  <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5">User Info</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{user?.name}</p>
                  <p className="text-[9px] font-medium text-[var(--text-tertiary)] mt-1 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/10 shadow-lg shadow-red-500/5 hover:scale-110 group/logout active:scale-95"
                title="Secure Logout"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-slideUp p-8 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20 shadow-lg">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">Secure Logout?</h3>
              <p className="text-sm font-medium text-[var(--text-tertiary)] opacity-60 mb-8 px-4">
                Are you sure you want to end your session? You will need to re-authenticate to access the dashboard.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
