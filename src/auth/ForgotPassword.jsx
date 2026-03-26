import { useState } from "react";
import { Link } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import { authAPI } from "../api/auth.api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authAPI.forgotPassword(email);
            setSuccessMessage(response.message);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-primary)',
                backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
            }}>
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-success)]/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <AuthHeader />

            <div className="w-full max-w-lg mx-auto px-4 sm:px-0 mt-8">
                {/* Forgot Password Card */}
                <div className="rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                    }}>

                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel - Branding Section */}
                        <div className="hidden lg:flex lg:w-[220px] flex-col justify-center p-6 relative overflow-hidden flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            }}>
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3 hover:rotate-6 transition-transform">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM9 12.75A6 6 0 003 18.75h12a6 6 0 00-6-6zM21 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM18.75 18.75h3.75a3.75 3.75 0 00-7.5 0h3.75z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                                        Account <br/><span className="text-white/80">Recovery</span>
                                    </h3>
                                    <p className="text-white/80 text-[10px] font-medium leading-relaxed uppercase tracking-widest opacity-80">
                                        Recover your digital credentials securely.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "Encrypted", desc: "Private recovery" },
                                        { title: "Verified", desc: "Security first" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start space-x-4 group/item">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10 transition-all">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{item.title}</h4>
                                                <p className="text-[8px] text-white/60 font-medium uppercase tracking-[0.2em]">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        </div>

                        {/* Right Panel - Form */}
                        <div className="flex-1 p-8 lg:p-10">
                            {!submitted ? (
                                <>
                                    {/* Header */}
                                    <div className="text-center mb-10">
                                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                            Reset Password
                                        </h2>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                            Enter your email for reset instructions
                                        </p>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="mb-6 animate-fadeIn">
                                            <div className="p-4 rounded-xl flex items-center gap-3"
                                                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-error)" }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium" style={{ color: "var(--accent-error)" }}>{error}</span>
                                            </div>
                                        </div>
                                    )}

                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-tertiary)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)] focus:border-transparent"
                                                    style={{
                                                        backgroundColor: 'var(--bg-tertiary)',
                                                        borderColor: 'var(--border-primary)',
                                                        color: 'var(--text-primary)'
                                                    }}
                                                    placeholder="you@company.com"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    background: loading
                                                        ? "var(--text-tertiary)"
                                                        : "linear-gradient(135deg, #10b981, #059669)",
                                                }}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    {loading ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Sending...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>Send Reset Link</span>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </form>

                                    {/* Footer Links */}
                                    <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }}></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="px-3 bg-[var(--bg-secondary)]" style={{ color: 'var(--text-tertiary)' }}>Remember your password?</span>
                                            </div>
                                        </div>

                                        <Link
                                            to="/login"
                                            className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                                            style={{ color: 'var(--accent-success)' }}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Back to Login</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                /* Success State */
                                <div className="flex flex-col justify-center min-h-[400px]">
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-fadeIn"
                                            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-success)" }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                        </div>

                                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                            Check Your Email
                                        </h2>

                                        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {successMessage || "We've sent a password reset link to your email address. Please check your inbox and follow the instructions."}
                                        </p>

                                        <div className="bg-[var(--bg-tertiary)]/30 rounded-xl p-4 mb-6 border border-[var(--border-primary)]">
                                            <p className="text-xs font-mono break-all" style={{ color: 'var(--text-primary)' }}>
                                                {email}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setEmail("");
                                                    setError("");
                                                }}
                                                className="w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 hover:shadow-md"
                                                style={{
                                                    borderColor: 'var(--border-secondary)',
                                                    color: 'var(--text-primary)',
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                Send another link
                                            </button>

                                            <Link
                                                to="/login"
                                                className="flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                                                style={{ color: 'var(--accent-success)' }}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Back to Login</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}