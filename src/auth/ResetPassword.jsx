import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import { authAPI } from "../api/auth.api";

export default function ResetPassword() {
    const { token } = useParams();
    const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.password !== passwords.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (passwords.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!token) {
            setError("Reset token is missing. Please check your email link.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await authAPI.resetPassword(token, passwords);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. The link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-6 px-6"
            style={{
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
            }}>
            <AuthHeader />

            <div className="w-full max-w-lg m-auto">
                <div className="rounded-[2.5rem] p-8 md:p-10 border shadow-2xl animate-fadeIn"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)'
                    }}>
                    
                    {!submitted ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    Set New Password
                                </h2>
                                <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                    Please enter and confirm your new password below
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}
                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input 
                                            name="password" 
                                            type={showPassword ? "text" : "password"} 
                                            required 
                                            value={passwords.password} 
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                            style={{ color: "var(--text-primary)" }}
                                            placeholder="••••••••" 
                                        />
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

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input 
                                            name="confirmPassword" 
                                            type={showPassword ? "text" : "password"} 
                                            required 
                                            value={passwords.confirmPassword} 
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                            style={{ color: "var(--text-primary)" }}
                                            placeholder="••••••••" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:shadow-2xl focus:outline-none transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                        style={{
                                            background: "linear-gradient(135deg, var(--accent-success), #10b981)",
                                            boxShadow: "0 15px 30px -10px rgba(52,211,153,0.4)",
                                        }}
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-[var(--accent-success)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[var(--accent-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Password Updated
                            </h2>
                            <p className="text-sm font-bold opacity-60 mb-8" style={{ color: 'var(--text-secondary)' }}>
                                Your password has been successfully reset. You can now login with your new credentials.
                            </p>
                            <Link to="/login" 
                                className="w-full py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 block text-center"
                                style={{
                                    background: "linear-gradient(135deg, var(--accent-success), #10b981)",
                                }}
                            >
                                Continue to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
