import React from 'react';

/**
 * Reusable Cosmic Space Background Component
 * Features:
 * - Deep cosmic space gradient background matching the design
 * - Perfectly positioned left & right orbital systems with rotating 3D glowing planets
 * - Smooth real-time infinite 360-degree orbit rotation
 * - Twinkling starfield with horizontal drift
 */
export default function CosmicSpaceBackground({ children, className = '' }) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#040e1d] ${className}`}>
      {/* ── Keyframes for Smooth Cosmic Animations ────────────────────── */}
      <style>{`
        @keyframes orbitRotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitRotateCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes starGlowDrift {
          0% { transform: translateX(0) translateY(0); opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { transform: translateX(100vw) translateY(-15px); opacity: 0.1; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-orbit-cw {
          animation: orbitRotateCW 35s linear infinite;
        }
        .animate-orbit-cw-slow {
          animation: orbitRotateCW 55s linear infinite;
        }
        .animate-orbit-ccw {
          animation: orbitRotateCCW 45s linear infinite;
        }
        .star-dot {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 5px #ffffff, 0 0 10px rgba(56, 189, 248, 0.8);
          animation: starGlowDrift linear infinite;
        }
      `}</style>

      {/* ── Base Space Color Gradient ───────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020916] via-[#071933] to-[#030d1c]" />

      {/* ── Glowing Backdrop Nebulas ───────────────────────────────────── */}
      <div
        className="absolute top-1/4 -left-20 w-[550px] h-[550px] rounded-full blur-[130px] opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(12, 172, 120, 0.4) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%)',
          animation: 'pulseGlow 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-10 -right-20 w-[650px] h-[650px] rounded-full blur-[140px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)',
          animation: 'pulseGlow 16s ease-in-out infinite reverse',
        }}
      />

      {/* ── Moving Starfield Particles ─────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden opacity-90">
        {[
          { top: '10%', size: '2px', duration: '32s', delay: '0s' },
          { top: '22%', size: '3px', duration: '26s', delay: '-6s' },
          { top: '35%', size: '1.5px', duration: '40s', delay: '-14s' },
          { top: '48%', size: '2.5px', duration: '30s', delay: '-8s' },
          { top: '62%', size: '3px', duration: '22s', delay: '-18s' },
          { top: '75%', size: '2px', duration: '36s', delay: '-4s' },
          { top: '85%', size: '1.5px', duration: '44s', delay: '-20s' },
          { top: '16%', size: '2.5px', duration: '28s', delay: '-10s' },
          { top: '92%', size: '2px', duration: '34s', delay: '-12s' },
        ].map((s, idx) => (
          <div
            key={idx}
            className="star-dot"
            style={{
              top: s.top,
              left: '-2%',
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* ── Left Orbit System (Visually Framed on Screen Left) ─────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-48 sm:-left-36 w-[550px] h-[550px] sm:w-[650px] sm:h-[650px] pointer-events-none flex items-center justify-center">
        {/* Outer Orbit Path */}
        <div className="w-full h-full rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative animate-orbit-cw">
          {/* Orbiting Blue Planet */}
          <div
            className="absolute top-14 left-16 w-7 h-7 rounded-full shadow-lg shadow-cyan-400/80"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #38bdf8, #0284c7 60%, #0369a1)',
            }}
          />
          {/* Orbiting Amber Planet */}
          <div
            className="absolute bottom-16 right-20 w-5 h-5 rounded-full shadow-lg shadow-amber-400/90"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fbbf24, #d97706 60%, #78350f)',
            }}
          />
        </div>

        {/* Inner Orbit Path */}
        <div className="absolute w-[70%] h-[70%] rounded-full border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)] animate-orbit-ccw">
          {/* Orbiting Emerald Planet */}
          <div
            className="absolute top-8 right-12 w-4 h-4 rounded-full shadow-lg shadow-emerald-400/90"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #34d399, #059669 60%, #064e3b)',
            }}
          />
        </div>
      </div>

      {/* ── Right Orbit System (Visually Framed on Screen Right) ────────── */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-56 sm:-right-40 w-[620px] h-[620px] sm:w-[750px] sm:h-[750px] pointer-events-none flex items-center justify-center">
        {/* Outer Orbit Path */}
        <div className="w-full h-full rounded-full border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] relative animate-orbit-cw-slow">
          {/* Orbiting Purple Planet with Saturn Rings */}
          <div className="absolute top-20 left-24 flex items-center justify-center">
            <div
              className="w-9 h-9 rounded-full shadow-xl shadow-purple-500/80 relative z-10"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #c084fc, #7e22ce 60%, #4c1d95)',
              }}
            />
            <div className="absolute w-16 h-3.5 rounded-full border-2 border-purple-300/60 rotate-[-28deg] shadow-[0_0_12px_rgba(192,132,252,0.8)] z-20 pointer-events-none" />
          </div>

          {/* Orbiting Neon Green Planet */}
          <div
            className="absolute bottom-24 left-16 w-5 h-5 rounded-full shadow-lg shadow-emerald-400/90"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #4ade80, #16a34a 60%, #14532d)',
            }}
          />

          {/* Orbiting Pink Planet */}
          <div
            className="absolute bottom-32 right-28 w-4 h-4 rounded-full shadow-lg shadow-pink-500/80"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #f472b6, #db2777 60%, #831843)',
            }}
          />
        </div>

        {/* Inner Orbit Path */}
        <div className="absolute w-[68%] h-[68%] rounded-full border border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] animate-orbit-ccw">
          {/* Orbiting Cyan Mini-Planet */}
          <div
            className="absolute top-12 right-16 w-3.5 h-3.5 rounded-full shadow-md shadow-cyan-300"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #67e8f9, #0891b2)',
            }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}

