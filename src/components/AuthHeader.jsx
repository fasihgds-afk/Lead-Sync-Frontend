import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import tokenManager from '../utils/tokenManager';
import { getRoleBasedRedirect } from '../utils/roleRedirect';
import Logo from './Logo';

const AuthHeader = ({ isLandingPage = false }) => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = tokenManager.getToken();
        if (token && tokenManager.isCurrentTokenValid()) {
            setIsLoggedIn(true);
            setUser(tokenManager.getUser());
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, [location.pathname]);

    const handleGoToDashboard = () => {
        if (user) {
            const path = getRoleBasedRedirect(user.role || user.department);
            navigate(path);
        }
    };

    return (
        <header className="fixed top-0 w-full z-50 py-4 px-6 flex items-center justify-between transition-all duration-300 backdrop-blur-md border-b"
            style={{
                borderColor: theme === 'dark' ? 'rgba(12, 172, 120, 0.15)' : 'rgba(12, 172, 120, 0.25)',
                backgroundColor: theme === 'dark' ? 'rgba(15, 42, 63, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                height: '70px'
            }}>

            {/* Subtle background gradient for depth */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(12, 172, 120, 0.03) 0%, transparent 100%)'
            }}></div>

            <Link to="/" className="flex items-center gap-2 group relative z-10">
                <div className="w-20 transition-transform group-hover:scale-105">
                    <Logo className="h-full w-full" />
                </div>
            </Link>

            <div className="flex items-center gap-6 pr-8 relative z-10">
                {/* Theme Toggle - Highly Visible Pill Button */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    style={{
                        backgroundColor: theme === 'dark' ? 'rgba(255, 220, 60, 0.15)' : 'rgba(15, 42, 63, 0.12)',
                        border: theme === 'dark' ? '1px solid rgba(255, 220, 60, 0.5)' : '1px solid rgba(15, 42, 63, 0.3)',
                        color: theme === 'dark' ? '#ffd93d' : '#0f2a3f',
                        boxShadow: theme === 'dark'
                            ? '0 0 12px rgba(255, 220, 60, 0.2), 0 2px 8px rgba(0,0,0,0.3)'
                            : '0 0 12px rgba(15, 42, 63, 0.1), 0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Light</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span>Dark</span>
                        </>
                    )}
                </button>

                {isLandingPage ? (
                    isLoggedIn ? (
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.6)' }}>Authenticated</span>
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Authorized User'}</span>
                            </div>
                            <button
                                onClick={handleGoToDashboard}
                                className="group relative px-8 py-3 rounded-xl text-white text-xs font-black uppercase tracking-[0.15em] shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #0cac78, #0a8f64)',
                                    boxShadow: '0 15px 30px -10px rgba(12, 172, 120, 0.3)'
                                }}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Dashboard
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-[-20deg]"></div>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login"
                                className="px-5 py-2.5 text-sm font-black uppercase tracking-widest transition-colors"
                                style={{
                                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#0cac78'}
                                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)'}
                            >
                                Sign In
                            </Link>
                            <Link to="/signup"
                                className="px-8 py-3 rounded-2xl text-white text-sm font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #0cac78, #0a8f64)',
                                    boxShadow: '0 15px 30px -10px rgba(12, 172, 120, 0.3)'
                                }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )
                ) : (
                    <Link to="/"
                        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all group/back"
                        style={{
                            borderColor: 'rgba(12, 172, 120, 0.2)',
                            backgroundColor: 'rgba(12, 172, 120, 0.05)',
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.85)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(12, 172, 120, 0.15)';
                            e.currentTarget.style.borderColor = '#0cac78';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(12, 172, 120, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(12, 172, 120, 0.2)';
                        }}
                    >
                        <svg className="w-5 h-5 transition-transform group-hover/back:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                )}
            </div>

            {/* Status indicator dot */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{
                background: 'linear-gradient(90deg, transparent, #0cac78, transparent)',
                opacity: 0.3
            }}></div>
        </header>
    );
};

export default AuthHeader;