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
                                    Reset Password
                                </h2>
                                <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                    Enter your email to receive a password reset link
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                            style={{ color: "var(--text-primary)" }}
                                            placeholder="you@company.com"
                                            disabled={loading}
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
                                        {loading ? "Sending..." : "Send Reset Link"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-[var(--accent-success)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[var(--accent-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Request Sent
                            </h2>
                            <p className="text-sm font-bold opacity-60 mb-8" style={{ color: 'var(--text-secondary)' }}>
                                {successMessage || "If an account exists, an email has been sent"}
                            </p>
                            <Link to="/login"
                                className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-success)] hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[var(--accent-success)]"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
