import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth.api";
import { getRoleBasedRedirect } from "../utils/roleRedirect";
import tokenManager from "../utils/tokenManager";
import AuthHeader from "../components/AuthHeader";

export default function LoginPage() {
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
        tokenManager.stopExpiryMonitoring();

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

        console.log("Login clicked");
        console.log("API URL:", import.meta.env.VITE_API_BASE_URL);

        try {
            const response = await authAPI.login(formData);

            console.log("Login API success:", response);

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
            console.error("Login API Error:", err);

            let message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Login failed";

            if (err.code === "ECONNABORTED") {
                message = "Server took too long to respond";
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [formData, navigate]);





    return (
        <div className="min-h-screen flex flex-col pt-24 pb-6 px-6"
            style={{
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
            }}>
            <AuthHeader />

            {/* Main Container */}
            <div className="w-full max-w-lg m-auto">

                {/* Login Card */}
                <div className="rounded-[2.5rem] p-8 md:p-10 border shadow-2xl animate-fadeIn"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)'
                    }}>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Welcome Back
                        </h2>
                        <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="mb-8 p-4 rounded-2xl border flex items-center gap-3"
                            style={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                borderColor: "rgba(239, 68, 68, 0.2)",
                                color: "var(--accent-error)"
                            }}
                        >
                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-black tracking-wider leading-relaxed">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                    placeholder="you@company.com" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                <Link to="/forgot-password" 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-success)] hover:brightness-110 transition-all">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }}>
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:shadow-2xl focus:outline-none transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                style={{
                                    background: loading
                                        ? "var(--text-tertiary)"
                                        : "linear-gradient(135deg, var(--accent-success), #10b981)",
                                    boxShadow: loading
                                        ? "none"
                                        : "0 15px 30px -10px rgba(52,211,153,0.4)",
                                }}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Login</span>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <Link
                            to="/signup"
                            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[var(--accent-success)]"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <span>Not have account? Sign Up</span>

                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
