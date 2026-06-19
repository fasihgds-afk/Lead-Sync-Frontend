import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

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
  const [showProfileModal, setShowProfileModal] = useState(false);

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
  }, [navigate]);

  const confirmLogout = () => {
    tokenManager.clearAuthData();
    window.location.href = '/login';
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      toast.success('Email copied!', {
        duration: 2000,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }
      });
    }
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
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] animate-pulse opacity-80" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">
                      Current Role
                    </div>
                    <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                      {getDashboardTitleFromPath(location.pathname, user?.role || user?.department)}
                    </div>
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

              <div className="relative group/user cursor-pointer" onClick={() => setShowProfileModal(true)}>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-[#00BE9B]/10 transition-all group-hover/user:scale-105 group-hover/user:rotate-2 border-2 border-[var(--border-primary)] ring-4 ring-transparent group-hover/user:ring-[#00BE9B]/5 overflow-hidden"
                  style={{
                    background: user?.profileImage ? 'transparent' : 'linear-gradient(135deg, #00BE9B, #00a082)',
                  }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.split(' ').map(n => n[0]).join('') || 'U'
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full shadow-lg" />
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

        {/* User Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowProfileModal(false)}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl w-full max-w-xs shadow-xl overflow-hidden animate-slideUp p-6 text-center relative" onClick={e => e.stopPropagation()}>

              {/* Close Icon */}
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-20 h-20 mx-auto mb-4 rounded-[1rem] overflow-hidden border-2 border-[var(--border-primary)] flex items-center justify-center font-black text-2xl" style={{ background: user?.profileImage ? 'transparent' : 'linear-gradient(135deg, #00BE9B, #00a082)', color: 'white' }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.split(' ').map(n => n[0]).join('') || 'U'
                )}
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{user?.name}</h3>
              <p 
                onClick={handleCopyEmail}
                className="text-xs font-medium text-[var(--text-tertiary)] mb-5 cursor-pointer hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5 group"
                title="Click to copy email"
              >
                {user?.email}
                <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </p>

              <div className="space-y-3 mb-6 text-left bg-[var(--bg-tertiary)] p-3.5 rounded-2xl border border-[var(--border-primary)] shadow-inner">
                <div className="flex justify-between items-center border-b border-[var(--border-primary)] pb-2.5">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Role</span>
                  <span className="text-[13px] font-semibold text-[#00BE9B] bg-[#00BE9B]/10 px-2.5 py-0.5 rounded-md">{user?.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Gender</span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)] capitalize">{user?.sex || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
