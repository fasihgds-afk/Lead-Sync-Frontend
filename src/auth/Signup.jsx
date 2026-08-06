import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from '../api/auth.api';
import AuthHeader from "../components/AuthHeader";
import { SIGNUP_DEPARTMENTS } from "../utils/roleRedirect";
import { useTheme } from "../context/ThemeContext";
import CosmicSpaceBackground from "../components/CosmicSpaceBackground";

const ACCENT = "#0cac78";
const ACCENT_DARK = "#0a8f64";

/* ── Icons (kept tiny + inline, no external icon lib needed) ───────── */
const Icon = {
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z",
    gender: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    dept: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    chevron: "M19 9l-7 7-7-7",
    eyeOff: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
    alert: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    userPlus: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
};

const Svg = ({ d, d2, className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d2} />}
    </svg>
);

/* ── Shared field chrome: label + icon + input/select box ──────────
   Native <select> popups can't be styled with CSS directly, but
   setting colorScheme tells the browser to render its native
   dropdown (options list) using dark or light system colors, which
   is what fixes the "white popup in dark mode" issue.           ── */
function Field({ label, icon, isDark, children, error }) {
    return (
        <div>
            <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.8)" }}
            >
                {label}
            </label>
            <div className="relative">
                <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(30,41,59,0.4)" }}
                >
                    <Svg d={icon} className="h-5 w-5" />
                </div>
                {children}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 animate-fadeIn flex items-center gap-1">
                    <Svg d={Icon.alert} className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

function fieldStyle(isDark, invalid) {
    return {
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(241,245,249,0.8)",
        borderColor: invalid ? "#ef4444" : isDark ? "rgba(12,172,120,0.2)" : "rgba(12,172,120,0.3)",
        color: isDark ? "#ffffff" : "#0f172a",
        colorScheme: isDark ? "dark" : "light",
    };
}

const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent";
const selectClass =
    "w-full pl-10 pr-10 py-3 rounded-xl border appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent cursor-pointer";
const passwordClass =
    "w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0cac78] focus:border-transparent";

function SelectChevron({ isDark }) {
    return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Svg d={Icon.chevron} className="h-4 w-4" />
            <span
                className="sr-only"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(30,41,59,0.4)" }}
            />
        </div>
    );
}

const PERKS = [
    { title: "Real-time Sync", desc: "Instant data propagation" },
    { title: "Advanced Analytics", desc: "Deep insight generation" },
    { title: "Secure Protocol", desc: "Enterprise-grade encryption" },
];

export default function SignupPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const departments = SIGNUP_DEPARTMENTS;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        sex: "",
        department: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
            Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));

            await authAPI.signup(submitData);
            setSuccess("Account created successfully. Pending approval.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    const labelMuted = { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.6)" };
    const eyeBtnColor = { color: isDark ? "rgba(255,255,255,0.4)" : "rgba(30,41,59,0.5)" };

    return (
        <div
            className="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: isDark ? "#0f2a3f" : "#f8fafc" }}
        >
            <CosmicSpaceBackground />

            {/* Dynamic Background - Matching Home Page */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-20 blur-[150px] animate-float-slow"
                    style={{ background: "radial-gradient(circle, #0cac78 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-15 blur-[130px] animate-float-delayed"
                    style={{ background: "radial-gradient(circle, #0cac78 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px] animate-float-medium"
                    style={{ background: "radial-gradient(circle, #0cac78 0%, transparent 70%)" }}
                />
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, #0cac78 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <AuthHeader />

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 relative z-10">
                <div
                    className="rounded-2xl shadow-2xl overflow-hidden animate-fadeIn transition-colors duration-300"
                    style={{
                        backgroundColor: isDark ? "rgba(15,42,63,0.85)" : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: isDark ? "1px solid rgba(12,172,120,0.15)" : "1px solid rgba(12,172,120,0.25)",
                    }}
                >
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel - Branding */}
                        <div
                            className="hidden lg:flex lg:w-[350px] flex-col justify-center p-10 relative overflow-hidden flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)` }}
                        >
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl rotate-3 hover:rotate-6 transition-transform">
                                        <Svg d={Icon.dept} className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-4 leading-tight uppercase tracking-tight">
                                        Join our <br />
                                        <span className="text-white/80">Digital</span> Network
                                    </h3>
                                    <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed max-w-xs uppercase tracking-widest opacity-80">
                                        Experience the next generation of lead management synchronization.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {PERKS.map((item) => (
                                        <div key={item.title} className="flex items-start space-x-4 group/item">
                                            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10 group-hover/item:bg-white/20 transition-all">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
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

                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        </div>

                        {/* Right Panel - Form */}
                        <div className="flex-1 p-8 md:p-10 lg:p-14">
                            <div className="text-center mb-8">
                                <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Create Account
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={labelMuted}>
                                    Join the lead management revolution
                                </p>
                            </div>

                            {(error || success) && (
                                <div className="mb-6 animate-fadeIn">
                                    {error && (
                                        <div
                                            className="p-4 rounded-xl flex items-center gap-3"
                                            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                                        >
                                            <Svg d={Icon.alert} className="h-5 w-5 shrink-0" style={{ color: "#ef4444" }} />
                                            <span className="text-sm font-medium" style={{ color: "#ef4444" }}>
                                                {error}
                                            </span>
                                        </div>
                                    )}
                                    {success && (
                                        <div
                                            className="p-4 rounded-xl flex items-center gap-3"
                                            style={{ backgroundColor: "rgba(12,172,120,0.1)", border: "1px solid rgba(12,172,120,0.2)" }}
                                        >
                                            <Svg d={Icon.check} className="h-5 w-5 shrink-0" style={{ color: ACCENT }} />
                                            <span className="text-sm font-medium" style={{ color: ACCENT }}>
                                                {success}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-5">
                                    {/* Row 1: Name & Email */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Full Name" icon={Icon.user} isDark={isDark}>
                                            <input
                                                name="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className={inputClass}
                                                style={fieldStyle(isDark)}
                                            />
                                        </Field>

                                        <Field label="Email Address" icon={Icon.mail} isDark={isDark}>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@company.com"
                                                className={inputClass}
                                                style={fieldStyle(isDark)}
                                            />
                                        </Field>
                                    </div>

                                    {/* Row 2: Gender & Department */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Gender" icon={Icon.gender} isDark={isDark}>
                                            <select
                                                name="sex"
                                                required
                                                value={formData.sex}
                                                onChange={handleChange}
                                                className={selectClass}
                                                style={fieldStyle(isDark)}
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <SelectChevron isDark={isDark} />
                                        </Field>

                                        <Field label="Department" icon={Icon.dept} isDark={isDark}>
                                            <select
                                                name="department"
                                                required
                                                value={formData.department}
                                                onChange={handleChange}
                                                className={selectClass}
                                                style={fieldStyle(isDark)}
                                            >
                                                <option value="">Select department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept} value={dept}>
                                                        {dept}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectChevron isDark={isDark} />
                                        </Field>
                                    </div>

                                    {/* Row 3: Password & Confirm Password */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Password" icon={Icon.lock} isDark={isDark}>
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a password"
                                                className={passwordClass}
                                                style={fieldStyle(isDark)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                                                style={eyeBtnColor}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                <Svg d={showPassword ? Icon.eyeOff : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} d2={showPassword ? null : "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} className="h-5 w-5" />
                                            </button>
                                        </Field>

                                        <Field
                                            label="Confirm Password"
                                            icon={Icon.lock}
                                            isDark={isDark}
                                            error={passwordMismatch ? "Passwords do not match" : ""}
                                        >
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm your password"
                                                className={`${passwordClass} ${passwordMismatch ? "focus:ring-red-500" : "focus:ring-[#0cac78]"}`}
                                                style={fieldStyle(isDark, passwordMismatch)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                                                style={eyeBtnColor}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                <Svg d={showConfirmPassword ? Icon.eyeOff : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} d2={showConfirmPassword ? null : "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} className="h-5 w-5" />
                                            </button>
                                        </Field>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            background: loading ? "rgba(255,255,255,0.2)" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                                            boxShadow: "0 15px 30px -10px rgba(12,172,120,0.3)",
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        />
                                                    </svg>
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Svg d={Icon.userPlus} className="h-5 w-5" />
                                                    <span>Create Account</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div
                                                className="w-full border-t"
                                                style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
                                            />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span
                                                className="px-3"
                                                style={{
                                                    backgroundColor: isDark ? "rgba(15,42,63,0.85)" : "rgba(255,255,255,0.9)",
                                                    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(30,41,59,0.5)",
                                                }}
                                            >
                                                or
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to="/login"
                                        className="block w-full px-6 py-3.5 rounded-xl text-center font-semibold transition-all duration-300 border-2 hover:shadow-md hover:scale-[1.02] transform"
                                        style={{
                                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(12,172,120,0.3)",
                                            color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,41,59,0.85)",
                                            backgroundColor: "transparent",
                                        }}
                                    >
                                        Already have an account? Sign In
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float-slow { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(3deg); } }
                @keyframes float-delayed { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-3deg); } }
                @keyframes float-medium { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-25px) scale(1.1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 18s ease-in-out infinite; }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }

                * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

                /* Force native <option> list to render dark in dark mode across browsers
                   that don't fully honor the inline colorScheme style on <select>. */
                select option {
                    background-color: ${isDark ? "#0f2a3f" : "#ffffff"};
                    color: ${isDark ? "#ffffff" : "#0f172a"};
                }
            `}</style>
        </div>
    );
}