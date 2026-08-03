import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from '../api/auth.api';
import AuthHeader from "../components/AuthHeader";
import { SIGNUP_DEPARTMENTS } from "../utils/roleRedirect";

export default function SignupPage() {
    const departments = SIGNUP_DEPARTMENTS;

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
        <div className="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
            style={{
                backgroundColor: '#0f2a3f',
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

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 relative z-10">
                {/* Signup Card */}
                <div className="rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
                    style={{
                        backgroundColor: 'rgba(15, 42, 63, 0.85)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(12, 172, 120, 0.15)'
                    }}>

                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel - Branding Section with your green */}
                        <div className="hidden lg:flex lg:w-[350px] flex-col justify-center p-10 relative overflow-hidden flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #0cac78 0%, #0a8f64 100%)',
                            }}>
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3 hover:rotate-6 transition-transform">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-4 leading-tight uppercase tracking-tight">
                                        Join our <br /><span className="text-white/80">Digital</span> Network
                                    </h3>
                                    <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed max-w-xs uppercase tracking-widest opacity-80">
                                        Experience the next generation of lead management synchronization.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "Real-time Sync", desc: "Instant data propagation" },
                                        { title: "Advanced Analytics", desc: "Deep insight generation" },
                                        { title: "Secure Protocol", desc: "Enterprise-grade encryption" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start space-x-4 group/item">
                                            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10 group-hover/item:bg-white/20 transition-all">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-wider">{item.title}</h4>
                                                <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">{item.desc}</p>
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

                        {/* Right Panel - Form with consistent colors */}
                        <div className="flex-1 p-8 md:p-10 lg:p-14">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-2 text-white">
                                    Create Account
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    Join the lead management revolution
                                </p>
                            </div>

                            {/* Messages */}
                            {(error || success) && (
                                <div className="mb-6 animate-fadeIn">
                                    {error && (
                                        <div className="p-4 rounded-xl flex items-center gap-3"
                                            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ef4444" }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium" style={{ color: "#ef4444" }}>{error}</span>
                                        </div>
                                    )}
                                    {success && (
                                        <div className="p-4 rounded-xl flex items-center gap-3"
                                            style={{ backgroundColor: "rgba(12, 172, 120, 0.1)", border: "1px solid rgba(12, 172, 120, 0.2)" }}>
                                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#0cac78" }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium" style={{ color: "#0cac78" }}>{success}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* 2-Column Grid Layout */}
                                <div className="space-y-5">
                                    {/* Row 1: Full Name & Email */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent"
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
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
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}
                                                    placeholder="you@company.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Gender & Department */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Gender
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <select
                                                    name="sex"
                                                    required
                                                    value={formData.sex}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-10 py-3 rounded-xl border appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent cursor-pointer"
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}>
                                                    <option value="">Select gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Department
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <select
                                                    name="department"
                                                    required
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-10 py-3 rounded-xl border appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent cursor-pointer"
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}>
                                                    <option value="">Select department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3: Password & Confirm Password */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
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
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}
                                                    placeholder="Create a password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                                                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
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

                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${!passwordMatch && formData.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-[#0cac78]'}`}
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderColor: !passwordMatch && formData.confirmPassword ? '#ef4444' : 'rgba(12, 172, 120, 0.2)',
                                                        color: '#ffffff'
                                                    }}
                                                    placeholder="Confirm your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                                                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                    {showConfirmPassword ? (
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
                                            {!passwordMatch && formData.confirmPassword && (
                                                <p className="mt-1 text-xs text-red-500 animate-fadeIn flex items-center gap-1">
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Passwords do not match
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="mt-8 space-y-3">
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
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                    <span>Create Account</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="px-3" style={{
                                                backgroundColor: 'rgba(15, 42, 63, 0.85)',
                                                color: 'rgba(255, 255, 255, 0.4)'
                                            }}>or</span>
                                        </div>
                                    </div>

                                    <Link to="/login"
                                        className="block w-full px-6 py-3.5 rounded-xl text-center font-semibold transition-all duration-300 border-2 hover:shadow-md hover:scale-[1.02] transform"
                                        style={{
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            backgroundColor: 'transparent'
                                        }}>
                                        Already have an account? Sign In
                                    </Link>
                                </div>
                            </form>
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