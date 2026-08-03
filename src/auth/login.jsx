import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth.api";
import { getRoleBasedRedirect } from "../utils/roleRedirect";
import tokenManager from "../utils/tokenManager";
import AuthHeader from "../components/AuthHeader";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Clear expired tokens and stop monitoring on login page
    useEffect(() => {
        // Always clear tokens when on login page to ensure a fresh session and prevent stale token issues
        tokenManager.clearAuthData();

        // Stop token monitoring on login page
        tokenManager.clearTimers();

        const handleTokenExpired = (event) => {
            setError(event.detail?.message || 'Session expired. Please login again.');
        };

        window.addEventListener('tokenExpired', handleTokenExpired);
        return () => {
            window.removeEventListener('tokenExpired', handleTokenExpired);
        };
    }, []);

    const handleChange = useCallback(({ target }) => {
        const { name, value } = target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (loading) return;

        setError(null);
        setLoading(true);

        try {
            const response = await authAPI.login(formData);

            const { token, user, expiresIn } = response;

            if (!token || !user) {
                throw new Error("Invalid server response");
            }

            tokenManager.saveAuthData(token, user, expiresIn);

            window.dispatchEvent(
                new CustomEvent("loginSuccess", {
                    detail: { message: "Login successful", user },
                })
            );

            const redirectPath = getRoleBasedRedirect(user.role || user.department);

            navigate(redirectPath, { replace: true });

        } catch (err) {
            let message = "An error occurred during login. Please try again.";

            if (err.response) {
                const data = err.response.data;

                if (data && typeof data === 'object') {
                    message = data.error || data.message || data.msg || message;
                } else if (typeof data === 'string' && data.trim()) {
                    message = data;
                }
            } else if (err.request) {
                message = "Unable to connect to the server. Please check your internet connection or try again later.";
            } else if (err.message) {
                message = err.message;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [formData, loading, navigate]);

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
            style={{
                backgroundColor: isDark ? '#0f2a3f' : '#f8fafc',
            }}>

            {/* Dynamic Background - Matching Home Page */}
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

            <AuthHeader />

            <div className="w-full max-w-lg mx-auto px-4 sm:px-0 relative z-10">
                {/* Login Card */}
                <div className="rounded-2xl shadow-2xl overflow-hidden animate-fadeIn transition-colors duration-300"
                    style={{
                        backgroundColor: isDark ? 'rgba(15, 42, 63, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: isDark ? '1px solid rgba(12, 172, 120, 0.15)' : '1px solid rgba(12, 172, 120, 0.25)'
                    }}>

                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel - Branding Section with your green */}
                        <div className="hidden lg:flex lg:w-[220px] flex-col justify-center p-6 relative overflow-hidden flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #0cac78 0%, #0a8f64 100%)',
                            }}>
                            <div className="relative z-10">
                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Welcome Back!</h3>
                                    <p className="text-white/90 text-base mb-8 leading-relaxed">
                                        Sign in to access your dashboard and continue your journey with us.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm">Secure access to your account</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm">Track your progress and achievements</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm">Connect with team members</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm">24/7 support available</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        </div>

                        {/* Right Panel - Form with consistent colors */}
                        <div className="flex-1 p-8 lg:p-10">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <h2 className={`text-3xl font-black mb-2 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Welcome Back
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.6)' }}>
                                    Sign in to access your dashboard
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 animate-fadeIn">
                                    <div className="p-4 rounded-xl flex items-center gap-3"
                                        style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ef4444" }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium" style={{ color: "#ef4444" }}>{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)' }}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.4)' }}>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)',
                                                borderColor: isDark ? 'rgba(12, 172, 120, 0.2)' : 'rgba(12, 172, 120, 0.3)',
                                                color: isDark ? '#ffffff' : '#0f172a'
                                            }}
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)' }}>
                                            Password
                                        </label>
                                        <Link to="/forgot-password"
                                            className="text-xs font-semibold transition-colors hover:opacity-80"
                                            style={{ color: '#0cac78' }}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.4)' }}>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)',
                                                borderColor: isDark ? 'rgba(12, 172, 120, 0.2)' : 'rgba(12, 172, 120, 0.3)',
                                                color: isDark ? '#ffffff' : '#0f172a'
                                            }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                                            style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.5)' }}>
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button - Using your green */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            background: loading
                                                ? "rgba(255, 255, 255, 0.2)"
                                                : "linear-gradient(135deg, #0cac78, #0a8f64)",
                                            boxShadow: '0 15px 30px -10px rgba(12, 172, 120, 0.3)'
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Sign In</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </form>

                            {/* Footer Links - Consistent styling */}
                            <div className="mt-8 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="px-3" style={{
                                            backgroundColor: isDark ? 'rgba(15, 42, 63, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                                            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.5)'
                                        }}>New here?</span>
                                    </div>
                                </div>

                                <Link
                                    to="/signup"
                                    className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                                    style={{ color: '#0cac78' }}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Create a new account</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations matching home page */}
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
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 18s ease-in-out infinite; }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
                
                * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `}</style>
        </div>
    );
}