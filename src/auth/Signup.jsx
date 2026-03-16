import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from '../api/auth.api';
import AuthHeader from "../components/AuthHeader";

export default function SignupPage() {
    const departments = [
        'Development',
        'IT',
        'Marketing&SEO',
        'RND',
        'Quality Assurance',
        'Sales',
        'Writing',
        'Youtube Automation',
        'Lead Qualifiers',
        'Medical Billing'
    ];

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        sex: "",
        department: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long!");
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('sex', formData.sex);
            submitData.append('department', formData.department);
            submitData.append('password', formData.password);
            submitData.append('confirmPassword', formData.confirmPassword);

            const response = await authAPI.signup(submitData);
            setSuccess("Account created successfully. Pending approval.");

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            if (name === 'password' || name === 'confirmPassword') {
                if (updated.confirmPassword && updated.password !== updated.confirmPassword) {
                    setPasswordMatch(false);
                } else {
                    setPasswordMatch(true);
                }
            }

            return updated;
        });
    };

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-6 px-6"
            style={{
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
            }}>
            <AuthHeader />

            <div className="w-full max-w-4xl m-auto">


                {/* Signup Card */}
                <div className="rounded-[2.5rem] p-8 md:p-12 border shadow-2xl animate-fadeIn"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                    }}>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Create Your Account
                        </h2>

                    </div>

                    {/* Messages */}
                    {(error || success) && (
                        <div className="mb-8 animate-fadeIn">
                            {error && (
                                <div className="p-4 rounded-2xl border flex items-center gap-3"
                                    style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", color: "var(--accent-error)" }}>
                                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-black uppercase tracking-wider">{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="p-4 rounded-2xl border flex items-center gap-3"
                                    style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)", color: "var(--accent-success)" }}>
                                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-black uppercase tracking-wider">{success}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-6 md:gap-8">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                        style={{ color: "var(--text-primary)" }}
                                        placeholder="John Doe" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all font-bold text-sm"
                                        style={{ color: "var(--text-primary)" }}
                                        placeholder="you@company.com" />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <select name="sex" required value={formData.sex} onChange={handleChange}
                                        className="w-full pl-12 pr-10 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all appearance-none font-bold text-sm"
                                        style={{ color: "var(--text-primary)" }}>
                                        <option value="" className="bg-[var(--bg-secondary)]">Select...</option>
                                        <option value="male" className="bg-[var(--bg-secondary)]">Male</option>
                                        <option value="female" className="bg-[var(--bg-secondary)]">Female</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-40">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Department</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <select name="department" required value={formData.department} onChange={handleChange}
                                        className="w-full pl-12 pr-10 py-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)] transition-all appearance-none font-bold text-sm"
                                        style={{ color: "var(--text-primary)" }}>
                                        <option value="" className="bg-[var(--bg-secondary)]">Select Department...</option>
                                        {departments.map(dept => <option key={dept} value={dept} className="bg-[var(--bg-secondary)]">{dept}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-40">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
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
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent-success)]" style={{ color: 'var(--text-tertiary)' }}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange}
                                        className={`w-full pl-12 pr-12 py-4 rounded-2xl border bg-[var(--bg-tertiary)]/30 focus:bg-transparent focus:outline-none focus:ring-2 transition-all font-bold text-sm ${!passwordMatch && formData.confirmPassword ? 'border-[var(--accent-error)] ring-[var(--accent-error)]/20' : 'border-[var(--border-primary)] focus:ring-[var(--accent-success)]/20 focus:border-[var(--accent-success)]'}`}
                                        style={{
                                            color: "var(--text-primary)"
                                        }}
                                        placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {!passwordMatch && formData.confirmPassword && (
                                    <p className="absolute -bottom-5 left-1 text-[8px] font-black text-[var(--accent-error)] animate-fadeIn uppercase tracking-[0.2em]">
                                        Passwords do not match
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 flex flex-row items-center justify-center gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-white transition-all duration-300 hover:shadow-2xl focus:outline-none transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                style={{
                                    background: loading
                                        ? "var(--text-tertiary)"
                                        : "linear-gradient(135deg, var(--accent-success), #10b981)",
                                    boxShadow: loading
                                        ? "none"
                                        : "0 10px 20px -5px rgba(52,211,153,0.4)",
                                }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {loading ? (
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <span className="whitespace-nowrap">Create Account</span>
                                            <svg className="h-3 w-3 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>

                            <Link to="/login"
                                className="flex-1 px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 border hover:shadow-lg text-center whitespace-nowrap"
                                style={{
                                    borderColor: 'var(--border-secondary)',
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'rgba(69, 104, 130, 0.1)'
                                }}>
                                Already have account? Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}