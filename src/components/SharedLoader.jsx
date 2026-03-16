import React from 'react';

export default function SharedLoader() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="relative group">
        {/* Outer Glow/Border Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent blur-2xl rounded-3xl opacity-50" />

        {/* Main Loader Container */}
        <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 min-w-[280px]">

          {/* Non-Circular Animation: Tech Bars */}
          <div className="flex items-end gap-1.5 h-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 bg-[var(--accent-primary)] rounded-full animate-loader-bar"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: '40%'
                }}
              />
            ))}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-1">
            <h3 className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] animate-pulse">
              Establishing Connection
            </h3>
            <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">
              Leadsync Active
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent-primary)] w-1/3 animate-progress-scan" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loader-bar {
          0%, 100% { height: 40%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        @keyframes progress-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loader-bar {
          animation: loader-bar 1s ease-in-out infinite;
        }
        .animate-progress-scan {
          animation: progress-scan 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
      `}</style>
    </div>
  );
}
