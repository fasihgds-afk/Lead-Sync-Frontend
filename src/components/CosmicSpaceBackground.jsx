import React from 'react';

/**
 * Aurora Cosmos — Reusable Space Background Component
 * Ported "same to same" from the Aurora Cosmos HTML design into React.
 *
 * Features:
 * - Deep space gradient base (#060812 → #0d1a2e → #040810)
 * - Multi-layer nebula glow spots (cyan/purple, pink/orange, green/blue)
 * - Flowing aurora wave bands
 * - Shooting stars, sparkle stars, floating geometric shapes
 * - Three concentric orbiting planet rings (CW / CCW / fast CW)
 * - Rising particle drift
 */
export default function CosmicSpaceBackground({ children, className = '' }) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#060812] ${className}`}>
      {/* ── Keyframes & Animation Classes ─────────────────────────────── */}
      <style>{`
        @keyframes auroraFlow1 {
          0% { transform: translateX(-30%) scaleY(1) rotate(0deg); opacity: 0.2; }
          25% { transform: translateX(20%) scaleY(1.8) rotate(2deg); opacity: 0.6; }
          50% { transform: translateX(60%) scaleY(1.2) rotate(-1deg); opacity: 0.4; }
          75% { transform: translateX(10%) scaleY(2) rotate(1deg); opacity: 0.7; }
          100% { transform: translateX(-30%) scaleY(1) rotate(0deg); opacity: 0.2; }
        }
        @keyframes auroraFlow2 {
          0% { transform: translateX(30%) scaleY(1.2) rotate(0deg); opacity: 0.15; }
          33% { transform: translateX(-40%) scaleY(2) rotate(-2deg); opacity: 0.5; }
          66% { transform: translateX(20%) scaleY(1.5) rotate(1deg); opacity: 0.3; }
          100% { transform: translateX(30%) scaleY(1.2) rotate(0deg); opacity: 0.15; }
        }
        @keyframes auroraFlow3 {
          0% { transform: translateX(-50%) scaleY(0.8); opacity: 0.1; }
          50% { transform: translateX(50%) scaleY(2.2); opacity: 0.4; }
          100% { transform: translateX(-50%) scaleY(0.8); opacity: 0.1; }
        }
        @keyframes floatShape1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(40px, -30px) rotate(90deg) scale(1.1); }
          50% { transform: translate(-30px, 40px) rotate(180deg) scale(0.9); }
          75% { transform: translate(30px, -20px) rotate(270deg) scale(1.05); }
        }
        @keyframes floatShape2 {
          0%, 100% { transform: translate(0, 0) rotate(45deg) scale(1); }
          33% { transform: translate(-35px, 25px) rotate(135deg) scale(1.2); }
          66% { transform: translate(25px, -35px) rotate(225deg) scale(0.85); }
        }
        @keyframes floatShape3 {
          0%, 100% { transform: translate(0, 0) rotate(-20deg) scale(1); }
          50% { transform: translate(50px, 20px) rotate(70deg) scale(1.15); }
        }
        @keyframes sparkleStar {
          0%, 100% { opacity: 0.05; transform: scale(0.6); }
          20% { opacity: 0.9; transform: scale(1.6); }
          40% { opacity: 0.3; transform: scale(1); }
          60% { opacity: 0.8; transform: scale(1.3); }
          80% { opacity: 0.1; transform: scale(0.8); }
        }
        @keyframes orbitCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) scale(1); opacity: 0; }
          5% { opacity: 1; }
          15% { opacity: 0; }
          100% { transform: translateX(-300px) translateY(150px) scale(0); opacity: 0; }
        }
        @keyframes particleDrift {
          0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
          10% { opacity: 0.8; transform: translateY(80vh) translateX(20px) scale(1); }
          90% { opacity: 0.6; }
          100% { transform: translateY(-20vh) translateX(-30px) scale(0.5); opacity: 0; }
        }

        .aurora-1 { animation: auroraFlow1 22s ease-in-out infinite alternate; }
        .aurora-2 { animation: auroraFlow2 28s ease-in-out infinite alternate; }
        .aurora-3 { animation: auroraFlow3 18s ease-in-out infinite alternate; }

        .float-shape-1 { animation: floatShape1 14s ease-in-out infinite; }
        .float-shape-2 { animation: floatShape2 18s ease-in-out infinite; }
        .float-shape-3 { animation: floatShape3 12s ease-in-out infinite; }

        .sparkle-1 { animation: sparkleStar 3s ease-in-out infinite; }
        .sparkle-2 { animation: sparkleStar 4.5s ease-in-out infinite 0.7s; }
        .sparkle-3 { animation: sparkleStar 3.8s ease-in-out infinite 1.5s; }
        .sparkle-4 { animation: sparkleStar 5.2s ease-in-out infinite 2.3s; }
        .sparkle-5 { animation: sparkleStar 4s ease-in-out infinite 0.3s; }
        .sparkle-6 { animation: sparkleStar 6s ease-in-out infinite 3.1s; }
        .sparkle-7 { animation: sparkleStar 3.5s ease-in-out infinite 1.8s; }

        .orbit-cw { animation: orbitCW 40s linear infinite; }
        .orbit-ccw { animation: orbitCCW 30s linear infinite; }
        .orbit-cw-fast { animation: orbitCW 20s linear infinite; }

        .glow-pulse { animation: glowPulse 8s ease-in-out infinite; }

        .shooting-star { animation: shootingStar 4s ease-in-out infinite; }
        .shooting-star-2 { animation: shootingStar 5.5s ease-in-out infinite 2.5s; }

        .particle-up { animation: particleDrift 12s linear infinite; }
        .particle-up-2 { animation: particleDrift 16s linear infinite 4s; }
        .particle-up-3 { animation: particleDrift 14s linear infinite 8s; }
      `}</style>

      {/* ── Base Gradient Layers ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060812] via-[#0d1a2e] to-[#040810]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-[#1a0a2e]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a2a]/30 via-transparent to-[#1a0a2a]/30" />

      {/* ── Nebula Glow Spots ────────────────────────────────────────── */}
      <div
        className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full blur-[180px] opacity-40 glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0, 200, 255, 0.3), rgba(100, 0, 200, 0.1), transparent)' }}
      />
      <div
        className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full blur-[200px] opacity-30 glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(255, 0, 200, 0.25), rgba(200, 100, 0, 0.1), transparent)', animationDelay: '3s' }}
      />
      <div
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[250px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0, 255, 150, 0.15), rgba(50, 0, 200, 0.05), transparent)' }}
      />

      {/* ── Aurora Waves ─────────────────────────────────────────────── */}
      <div
        className="absolute top-[15%] left-0 w-[250%] h-[250px] rounded-full blur-[120px] aurora-1"
        style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(0, 255, 200, 0.25) 20%, rgba(0, 150, 255, 0.35) 40%, rgba(100, 0, 200, 0.2) 60%, rgba(200, 0, 150, 0.15) 80%, transparent 100%)' }}
      />
      <div
        className="absolute bottom-[20%] left-[-50%] w-[300%] h-[180px] rounded-full blur-[140px] aurora-2"
        style={{ background: 'linear-gradient(100deg, transparent 0%, rgba(255, 0, 200, 0.2) 25%, rgba(255, 100, 0, 0.25) 50%, rgba(200, 0, 150, 0.2) 75%, transparent 100%)' }}
      />
      <div
        className="absolute top-[45%] left-0 w-[200%] h-[120px] rounded-full blur-[100px] aurora-3"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.15), rgba(100, 200, 255, 0.2), rgba(0, 200, 200, 0.1), transparent)' }}
      />

      {/* ── Shooting Stars ───────────────────────────────────────────── */}
      <div className="absolute top-[8%] right-[20%] w-[100px] h-[2px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent rotate-[-35deg] shooting-star" />
      <div className="absolute top-[15%] right-[40%] w-[80px] h-[1.5px] bg-gradient-to-r from-transparent via-pink-300/60 to-transparent rotate-[-25deg] shooting-star-2" />

      {/* ── Floating Geometric Shapes ────────────────────────────────── */}
      <div className="absolute top-[12%] left-[15%] w-14 h-14 border-2 border-cyan-400/30 rounded-full float-shape-1 shadow-[0_0_40px_rgba(0,255,200,0.1)]" />
      <div className="absolute bottom-[18%] right-[12%] w-20 h-20 border-2 border-pink-400/25 rotate-45 float-shape-2 shadow-[0_0_50px_rgba(255,0,200,0.08)]" />
      <div
        className="absolute top-[60%] left-[75%] w-16 h-16 float-shape-3"
        style={{ background: 'transparent', border: '2px solid rgba(168, 85, 247, 0.25)', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', boxShadow: '0 0 40px rgba(168, 85, 247, 0.08)' }}
      />
      <div
        className="absolute top-[30%] left-[85%] w-8 h-8 border-2 border-emerald-400/20 rotate-45 float-shape-1"
        style={{ animationDelay: '2s', boxShadow: '0 0 30px rgba(52, 211, 153, 0.06)' }}
      />
      <div
        className="absolute bottom-[35%] left-[8%] w-12 h-12 float-shape-2"
        style={{ background: 'transparent', border: '2px solid rgba(251, 191, 36, 0.2)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animationDelay: '5s', boxShadow: '0 0 30px rgba(251, 191, 36, 0.06)' }}
      />

      {/* ── Sparkle Stars ────────────────────────────────────────────── */}
      <div className="absolute top-[8%] left-[22%] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] sparkle-1" />
      <div className="absolute top-[35%] right-[20%] w-3 h-3 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.7)] sparkle-2" />
      <div className="absolute bottom-[12%] left-[35%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] sparkle-3" />
      <div className="absolute top-[72%] right-[30%] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)] sparkle-4" />
      <div className="absolute top-[22%] left-[55%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] sparkle-5" />
      <div className="absolute top-[50%] left-[10%] w-2 h-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)] sparkle-6" />
      <div className="absolute bottom-[45%] right-[8%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] sparkle-7" />

      {/* Extra tiny static-glow stars */}
      <div className="absolute top-[5%] left-[45%] w-1 h-1 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
      <div className="absolute top-[18%] right-[55%] w-1 h-1 rounded-full bg-white/40 shadow-[0_0_6px_rgba(255,255,255,0.2)]" />
      <div className="absolute bottom-[8%] right-[45%] w-1 h-1 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
      <div className="absolute top-[80%] left-[50%] w-1.5 h-1.5 rounded-full bg-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
      <div className="absolute top-[45%] left-[45%] w-1 h-1 rounded-full bg-white/40 shadow-[0_0_6px_rgba(255,255,255,0.2)]" />

      {/* ── Orbiting Systems ─────────────────────────────────────────── */}
      {/* Large outer orbit */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-500/10 orbit-cw shadow-[0_0_80px_rgba(6,182,212,0.03)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #67e8f9, #0891b2)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_25px_rgba(251,191,36,0.5)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #fcd34d, #b45309)' }}
        />
        <div
          className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #c084fc, #7e22ce)' }}
        />
      </div>

      {/* Medium inner orbit */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-pink-500/8 orbit-ccw shadow-[0_0_60px_rgba(236,72,153,0.02)]">
        <div
          className="absolute top-0 left-1/3 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.5)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #f472b6, #be185d)' }}
        />
        <div
          className="absolute bottom-0 right-1/3 translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full shadow-[0_0_18px_rgba(52,211,153,0.5)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #34d399, #047857)' }}
        />
      </div>

      {/* Small inner orbit */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-emerald-500/8 orbit-cw-fast shadow-[0_0_40px_rgba(16,185,129,0.02)]">
        <div
          className="absolute top-0 right-1/4 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #fbbf24, #d97706)' }}
        />
      </div>

      {/* ── Rising Particles ─────────────────────────────────────────── */}
      <div className="absolute left-[5%] w-1.5 h-1.5 rounded-full bg-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)] particle-up" />
      <div className="absolute left-[15%] w-2 h-2 rounded-full bg-pink-400/30 shadow-[0_0_15px_rgba(236,72,153,0.25)] particle-up-2" />
      <div className="absolute left-[30%] w-1 h-1 rounded-full bg-purple-400/35 shadow-[0_0_12px_rgba(168,85,247,0.2)] particle-up-3" />
      <div className="absolute left-[45%] w-1.5 h-1.5 rounded-full bg-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.2)] particle-up" style={{ animationDelay: '2s' }} />
      <div className="absolute left-[60%] w-1 h-1 rounded-full bg-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)] particle-up-2" style={{ animationDelay: '6s' }} />
      <div className="absolute left-[75%] w-1.5 h-1.5 rounded-full bg-cyan-400/25 shadow-[0_0_15px_rgba(34,211,238,0.2)] particle-up-3" style={{ animationDelay: '3s' }} />
      <div className="absolute left-[90%] w-1 h-1 rounded-full bg-pink-400/30 shadow-[0_0_12px_rgba(236,72,153,0.2)] particle-up" style={{ animationDelay: '7s' }} />

      {/* ── Orbiting Dot Pairs (decorative ring) ─────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-300/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
      </div>

      {children}
    </div>
  );
}