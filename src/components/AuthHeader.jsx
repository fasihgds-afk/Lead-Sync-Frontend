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
    }, [location.pathname]); // Update on navigation

    const handleGoToDashboard = () => {
        if (user) {
            const path = getRoleBasedRedirect(user.role || user.department);
            navigate(path);
        }
    };

    return (
        <header className="fixed top-0 w-full z-50 py-4 px-12 flex items-center justify-between transition-all duration-300 backdrop-blur-md border-b"
            style={{
                borderColor: 'var(--border-primary)',
                backgroundColor: theme === 'dark' ? 'rgba(27, 60, 83, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                height: '70px'
            }}>
            <Link to="/" className="flex items-center gap-4 group pl-4 relative h-full">
                <div className="absolute top-1/2 left-8 -translate-y-1/2 w-20 transition-transform group-hover:scale-105">
                    <Logo className="h-full w-full" />
                </div>
            </Link>

            <div className="flex items-center gap-6 pr-8"> {/* Increased pr-4 to pr-8 */}
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {isLandingPage ? (
                    isLoggedIn ? (
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: 'var(--text-tertiary)' }}>Authenticated</span>
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Authorized User'}</span>
                            </div>
                            <button
                                onClick={handleGoToDashboard}
                                className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-[#00BE9B] via-[#00d4ad] to-[#00BE9B] bg-[length:200%_auto] hover:bg-right text-white text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-[#00BE9B]/20 transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
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
                            <Link to="/login" className="px-5 py-2.5 text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[#00BE9B] transition-colors">Sign In</Link>
                            <Link to="/signup" className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#00BE9B] to-[#00a082] text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-[#00BE9B]/20 hover:scale-105 active:scale-95 transition-all">
                                Sign Up
                            </Link>
                        </div>
                    )
                ) : (
                    <Link to="/" className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white hover:border-transparent transition-all group/back">
                        <svg className="w-5 h-5 transition-transform group-hover/back:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                )}
            </div>
        </header>
    );
};

export default AuthHeader;
