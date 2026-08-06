import React, { useEffect, useState } from 'react';
import './MaintenancePage.css';

/**
 * MaintenancePage Component
 * Full-screen production-ready maintenance page displayed when VITE_MAINTENANCE_MODE=true.
 */
const MaintenancePage = () => {
  const [refreshCountdown, setRefreshCountdown] = useState(60);

  useEffect(() => {
    // 1. Lock scrolling on body when maintenance mode is active
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // 2. Update page title for SEO / browser tab
    const previousTitle = document.title;
    document.title = 'Site Under Maintenance | Lead Sync';

    // 3. Setup 60-second auto-refresh timer to automatically check if maintenance is complete
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup effects on unmount
    return () => {
      document.body.style.overflow = originalStyle;
      document.title = previousTitle;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="maintenance-root">
      {/* Background ambient glow overlays */}
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>
      <div className="grid-pattern-overlay"></div>

      {/* Main Glassmorphism Card */}
      <main className="maintenance-card" role="main">
        {/* Status Indicator Badge */}
        <div className="status-badge" aria-label="Status: System Maintenance">
          <span className="status-dot"></span>
          Scheduled System Upgrade
        </div>

        {/* Animated Gear / Tools Icon */}
        <div className="icon-container">
          <div className="icon-glow-ring"></div>
          <div className="icon-wrapper">
            <svg
              className="gear-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Headings & Description */}
        <h1 className="maintenance-heading">We'll Be Back Soon</h1>
        <p className="maintenance-description">
          Lead Sync is currently undergoing scheduled maintenance as we add exciting new features. We'll be back online shortly.
        </p>

        {/* Information Grid Cards */}
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-icon">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="detail-content">
              <span className="detail-label">Estimated Downtime</span>
              <span className="detail-value">2 hours</span>
            </div>
          </div>


        </div>

        {/* Auto-Refresh Status Indicator */}
        <div className="auto-refresh-bar">
          <div className="spinner-small"></div>
          <span>Auto-checking system status in {refreshCountdown}s...</span>
        </div>

        {/* Footer */}
        <footer className="maintenance-footer">
          <p>&copy; {new Date().getFullYear()} Lead Sync. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default MaintenancePage;
