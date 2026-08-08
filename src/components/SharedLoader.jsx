import React from 'react';

/**
 * SharedLoader Component
 * Lightweight, hardware-accelerated loader designed for fast rendering
 * and smooth performance even on lower-spec hardware.
 */
export default function SharedLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 min-w-[240px] transform-gpu">
        {/* Animated Tech Bars */}
        <div className="flex items-end gap-1.5 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 bg-emerald-500 rounded-full animate-loader-bar"
              style={{
                animationDelay: `${i * 0.12}s`,
                height: '40%',
                willChange: 'height, opacity',
              }}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="text-center space-y-0.5">
          <h3 className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">
            Loading...
          </h3>
          <p className="text-[9px] font-medium text-[var(--text-tertiary)] opacity-60">
            Lead Sync System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loader-bar {
          0%, 100% { height: 35%; opacity: 0.4; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-loader-bar {
          animation: loader-bar 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
