import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import tokenManager from '../utils/tokenManager';
import { getRoleBasedRedirect } from '../utils/roleRedirect';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = tokenManager.getToken();
        if (token && tokenManager.isCurrentTokenValid()) {
            setIsLoggedIn(true);
            setUser(tokenManager.getUser());
        }
    }, []);

    const dashboardPath = user ? getRoleBasedRedirect(user.role || user.department) : '/login';

    return (
        <div className="min-h-screen font-sans transition-colors duration-300 selection:bg-[#0cac78]/30 selection:text-white"
            style={{ backgroundColor: isDark ? '#0f2a3f' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a' }}>

            {/* Dynamic Background - Using your color scheme */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-20 blur-[150px] animate-float-slow"
                    style={{ background: 'radial-gradient(circle, #0cac78 0%, transparent 70%)' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-15 blur-[130px] animate-float-delayed"
                    style={{ background: 'radial-gradient(circle, #0cac78 0%, transparent 70%)' }}></div>
                <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px] animate-float-medium"
                    style={{ background: 'radial-gradient(circle, #0cac78 0%, transparent 70%)' }}></div>
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #0cac78 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <AuthHeader isLandingPage={true} />

            {/* Hero Section - Professional Layout */}
            <main className="relative z-10 container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 md:pt-36 pb-16 md:pb-20">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8 md:space-y-10">

                    {/* Premium Badge - Using your green */}
                    <div className="animate-slideDown mb-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] rounded-full border backdrop-blur-sm"
                            style={{
                                borderColor: 'rgba(12, 172, 120, 0.3)',
                                backgroundColor: isDark ? 'rgba(12, 172, 120, 0.12)' : 'rgba(12, 172, 120, 0.15)',
                                color: '#0cac78'
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0cac78] animate-pulse"></span>
                            Lead Management System
                        </span>
                    </div>

                    {/* Main Heading - Clean & Professional */}
                    <div className="space-y-3 animate-slideUp">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95]">
                            <span className={`inline-block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Lead Sync
                            </span>
                            <br />
                            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl inline-block mt-1"
                                style={{ color: '#0cac78' }}>
                                ✦ Real-Time Work Stream
                            </span>
                        </h1>
                    </div>

                    {/* Description - Clean Glass Effect with good contrast */}
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed animate-fadeIn px-4 sm:px-6 py-4 sm:py-5 rounded-2xl shadow-sm transition-colors duration-300"
                        style={{
                            animationDelay: '0.2s',
                            color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.9)',
                            border: isDark ? '1px solid rgba(12, 172, 120, 0.15)' : '1px solid rgba(12, 172, 120, 0.25)',
                            backgroundColor: isDark ? 'rgba(15, 42, 63, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)'
                        }}>
                        The instant lead management system for GDS teams. Connecting Data Minors, Qualifiers, Verifiers, and Managers in one live, synchronized workflow.
                    </p>

                    {/* CTA Buttons - Professional & Visible */}
                    <div className="pt-4 sm:pt-6 animate-slideUp flex flex-wrap justify-center gap-3 sm:gap-4" style={{ animationDelay: '0.3s' }}>
                        <Link to={isLoggedIn ? dashboardPath : "/login"}
                            className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #0cac78, #0a8f64)',
                                boxShadow: '0 15px 30px -10px rgba(12, 172, 120, 0.4)'
                            }}>
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoggedIn ? 'Go to Dashboard' : 'Lead Sync Login'}
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </span>
                            <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></span>
                        </Link>
                    </div>

                    {/* Operational Pillars - Clean & Professional */}
                    <div className="pt-12 sm:pt-16 animate-fadeIn w-full" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#0cac78]"></div>
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]"
                                style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.6)' }}>
                                Global Digital Solutions
                            </p>
                            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#0cac78]"></div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {['DATA MINING', 'QUALIFIER', 'VERIFIER', 'MANAGER'].map((role) => (
                                <div key={role}
                                    className="group relative px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-bold tracking-widest rounded-xl transition-all duration-300 hover:-translate-y-1 cursor-default shadow-sm"
                                    style={{
                                        border: isDark ? '1px solid rgba(12, 172, 120, 0.2)' : '1px solid rgba(12, 172, 120, 0.3)',
                                        backgroundColor: isDark ? 'rgba(15, 42, 63, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)'
                                    }}>
                                    {role}
                                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'radial-gradient(circle at center, rgba(12, 172, 120, 0.15), transparent 70%)'
                                        }}></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active GDS Brands - Professional Grid with your colors */}
                    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn w-full" style={{ animationDelay: '0.6s' }}>
                        <div className="flex flex-col items-center mb-8 sm:mb-10 md:mb-12">
                            <div className="h-px w-16 sm:w-20 md:w-24 bg-gradient-to-r from-transparent via-[#0cac78] to-transparent mb-4 sm:mb-6" />
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] text-center flex items-center gap-2"
                                style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.6)' }}>
                                <span className="text-[#0cac78]">✦</span> Production Environment <span className="text-[#0cac78]">✦</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-1 sm:px-2 max-w-5xl mx-auto">
                            {[
                                { name: 'WriteMyNursing', url: 'https://writemynursing.com/', icon: 'WN', desc: 'Academic Excellence' },
                                { name: 'NursFPXWriters', url: 'https://nursfpxwriters.com/', icon: 'NW', desc: 'Professional Writing' },
                                { name: 'TopYourCourse', url: 'https://topyourcourse.com/', icon: 'TC', desc: 'Course Mastery' },
                                { name: 'AssignmentBuds', url: 'https://assignmentbuds.com/', icon: 'AB', desc: 'Assignment Help' }
                            ].map((brand) => (
                                <a
                                    key={brand.name}
                                    href={brand.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex flex-col items-center p-4 sm:p-5 md:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden shadow-sm"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(15, 42, 63, 0.5)' : 'rgba(255, 255, 255, 0.85)',
                                        borderColor: isDark ? 'rgba(12, 172, 120, 0.15)' : 'rgba(12, 172, 120, 0.25)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)'
                                    }}
                                >
                                    {/* Hover Effect Background */}
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'radial-gradient(circle at top right, rgba(12, 172, 120, 0.12), transparent 70%)'
                                        }}></span>

                                    {/* Icon Circle - Using your green */}
                                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl"
                                        style={{
                                            background: 'linear-gradient(135deg, #0cac78, #0a8f64)',
                                            boxShadow: '0 10px 20px -5px rgba(12, 172, 120, 0.3)'
                                        }}>
                                        <span className="text-white relative z-10">{brand.icon}</span>
                                        <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                                    </div>

                                    {/* Brand Info - Clean & Readable */}
                                    <h3 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider mb-1 transition-colors duration-300 text-center w-full"
                                        style={{ color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)' }}>
                                        {brand.name}
                                    </h3>
                                    <p className="text-[7px] sm:text-[8px] md:text-[9px] font-medium uppercase tracking-wider text-center w-full"
                                        style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(51, 65, 85, 0.7)' }}>
                                        {brand.desc}
                                    </p>

                                    {/* Status Indicator - Green */}
                                    <span className="absolute top-2 sm:top-3 left-2 sm:left-3 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full animate-pulse"
                                        style={{ backgroundColor: '#0cac78' }}></span>

                                    {/* Exterior Arrow */}
                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-60 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#0cac78' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l7-7m7-7H3" />
                                        </svg>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Footer Note */}
                        <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-[0.2em] text-center mt-6 sm:mt-8"
                            style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.5)' }}>
                            ⚡ active production brands
                        </p>
                    </div>
                </div>
            </main>

            {/* Enhanced Animations */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(3deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(-3deg); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-25px) scale(1.1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes ping-slow {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
                
                .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 18s ease-in-out infinite; }
                .animate-fadeIn { animation: fadeIn 1.2s ease-out forwards; opacity: 0; }
                .animate-slideUp { animation: slideUp 1s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; opacity: 0; }
                .animate-slideDown { animation: slideDown 0.8s ease-out forwards; opacity: 0; }
                .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                
                /* Smooth scrolling and better text rendering */
                * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* Mobile First Responsive Adjustments */
                @media (max-width: 640px) {
                    .container {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;