import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardConfig } from '../dashboards/dashboardConfig';
import Logo from './Logo';

export default function DynamicSidebar({ isOpen, isCollapsed, onClose, onToggle, onToggleCollapse, user }) {
  const location = useLocation();
  const userRole = user?.role || user?.department;

  // Find current dashboard and page
  const currentPath = location.pathname;
  const currentDashboard = dashboardConfig.find(dashboard =>
    currentPath.startsWith(dashboard.basePath)
  );

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 z-[70] h-full transform transition-all duration-500 ease-out
        border-r border-[var(--border-primary)] shadow-2xl
        bg-[#0F2A3F]
        backdrop-blur-xl
        sm:fixed sm:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Decorative line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[var(--accent-primary)]/20" />

        {/* Border Resize Handle - Enhanced */}
        <div
          onClick={onToggleCollapse}
          className={`
            absolute top-1/2 -right-3 w-6 h-16 -translate-y-1/2 cursor-col-resize z-[65] 
            hover:bg-[var(--accent-primary)]/20 transition-all duration-300 group/border
            flex items-center justify-center hidden lg:flex rounded-full
            backdrop-blur-sm border border-[var(--border-primary)]/50
            bg-[var(--bg-secondary)]/80 shadow-lg
          `}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="w-0.5 h-8 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-50 group-hover/border:opacity-100 rounded-full transition-all" />
          <div className="absolute inset-0 rounded-full border border-[var(--accent-primary)]/20 opacity-0 group-hover/border:opacity-100 transition-opacity" />
        </div>

        {/* Sidebar Header - Premium Design */}
        <div className={`h-24 border-b border-[var(--border-primary)]/50 flex items-center relative transition-all duration-300 
          bg-[#0F2A3F]
          ${isCollapsed ? 'justify-center px-1' : 'px-4 md:px-6'}`}>

          {!isCollapsed ? (
            <>
              {/* Hide Button (X) - Enhanced */}
              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 transition-all active:scale-90 group"
                title="Hide Sidebar"
              >
                <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo with Animation */}
              <div className="flex-1 flex justify-center px-4 overflow-hidden">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <Logo className="h-12 w-auto" />
                </div>
              </div>

              {/* Collapse Button (<<) - Enhanced */}
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-xl hover:bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] transition-all active:scale-90 group"
                title="Collapse Menu"
              >
                <svg className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white hover:shadow-xl hover:scale-110 transition-all active:scale-95 group"
              title="Expand Menu"
            >
              <svg className="h-6 w-6 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation with Premium Styling */}
        <nav className={`p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-primary)] scrollbar-track-transparent
          transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}
          style={{ maxHeight: 'calc(100vh - 180px)' }}>

          {!currentDashboard && !isCollapsed && (
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider animate-pulse">
              ⚠️ Configuration Unknown
            </div>
          )}

          {currentDashboard && (
            <div className="space-y-3">
              {/* Current Dashboard Header - Premium */}
              <div className="mb-4">
                <div className={`
                  relative overflow-hidden rounded-xl transition-all duration-300 
                  bg-[var(--bg-tertiary)]
                  border border-[var(--accent-primary)]/20
                  ${isCollapsed ? 'p-3 flex justify-center' : 'p-3'}
                `}>
                  <div className={`flex items-center gap-3 relative z-10 ${isCollapsed ? '' : 'w-full'}`}>
                    <span className={`flex-shrink-0 text-2xl filter drop-shadow-lg ${isCollapsed ? '' : 'text-[var(--accent-primary)]'}`}>
                      {currentDashboard.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <div className="flex-1">
                          <span className="font-black text-sm uppercase tracking-wider text-[var(--accent-primary)]">
                            {currentDashboard.name}
                          </span>
                          <p className="text-[8px] font-medium text-[var(--text-tertiary)] opacity-50 uppercase tracking-wider mt-0.5">
                            Active Dashboard
                          </p>
                        </div>
                        {/* Status dot */}
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Title */}
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-40">
                    Navigation
                  </p>
                </div>
              )}

              {/* Current Dashboard Pages */}
              {currentDashboard.pages.filter(page => {
                if (page.showInSidebar === false) return false;
                if (page.allowedRoles && (!userRole || !page.allowedRoles.includes(userRole))) return false;
                return true;
              }).map((page) => {
                const pagePath = `${currentDashboard.basePath}${page.path ? '/' + page.path : ''}`;
                const isPageActive = currentPath === pagePath;

                return (
                  <Link
                    key={pagePath}
                    to={pagePath}
                    title={isCollapsed ? page.name : ""}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`
                      flex items-center transition-all duration-300 group/item relative
                      ${isCollapsed
                        ? 'justify-center p-3 rounded-xl'
                        : 'gap-3 px-4 py-3 rounded-xl'
                      }
                      ${isPageActive
                        ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80 hover:text-[var(--text-primary)] hover:shadow-md hover:border-[var(--border-primary)]/50'
                      }
                      border border-transparent hover:border-[var(--border-primary)]/30
                      backdrop-blur-sm
                    `}
                  >
                    {/* Icon with animation */}
                    <span className={`
                      flex-shrink-0 text-lg transition-all duration-300 
                      ${isPageActive
                        ? 'text-white scale-110'
                        : 'group-hover/item:text-[var(--accent-primary)] group-hover/item:scale-110'
                      }
                    `}>
                      {page.icon}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-bold truncate tracking-wide">
                          {page.name}
                        </span>

                        {/* Active indicator */}
                        {isPageActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                        )}
                      </>
                    )}

                    {/* Hover effect gradient */}
                    <div className={`
                      absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300
                      bg-gradient-to-r from-[var(--accent-primary)]/5 to-[var(--accent-secondary)]/5 pointer-events-none
                      ${isPageActive ? 'hidden' : ''}
                    `} />
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        {/* Navigation spacing */}
        <div className="flex-1" />
      </div>
    </>
  );
}
