import React from 'react';
import { Link } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const LandingPage = () => {
    return (
        <div className="min-h-screen font-sans selection:bg-[var(--accent-primary)]/30 selection:text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Enhanced Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-30 blur-[150px] animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-20 blur-[130px] animate-float"
                    style={{ background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)' }}></div>
                <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full opacity-15 blur-[100px] animate-float-delayed"
                    style={{ background: 'radial-gradient(circle, var(--accent-tertiary) 0%, transparent 70%)' }}></div>
            </div>

            <AuthHeader isLandingPage={true} />

            {/* Hero Section - Enhanced */}
            <main className="relative z-10 container mx-auto px-6 pt-40 pb-20">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-12">

                    {/* Premium Badge */}
                    <div className="animate-slideDown mb-4">
                        <span className="px-4 py-2 text-xs font-black uppercase tracking-[0.3em] rounded-full border backdrop-blur-sm"
                            style={{
                                borderColor: 'var(--border-primary)',
                                backgroundColor: 'rgba(var(--accent-primary-rgb), 0.05)',
                                color: 'var(--accent-primary)'
                            }}>
                            Lead Management
                        </span>
                    </div>

                    {/* Main Heading - Enhanced Typography */}
                    <div className="space-y-4 animate-slideUp">
                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.85]">
                            <span className="relative inline-block">
                                Lead Sync
                                <span className="absolute -top-6 -right-8 text-2xl opacity-50 animate-ping-slow">✦</span>
                            </span>
                            <br />
                            <span className="text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--text-primary)]">
                                Real-Time Work Stream
                            </span>
                        </h1>
                    </div>

                    {/* Description with Enhanced Readability */}
                    <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed animate-fadeIn backdrop-blur-sm p-6 rounded-2xl"
                        style={{
                            animationDelay: '0.2s',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'rgba(var(--bg-primary-rgb), 0.3)'
                        }}>
                        The instant lead management system for GDS teams. Connecting Data Minors, Qualifiers, Verifiers, and Managers in one live, synchronized workflow.
                    </p>

                    {/* CTA Button - Enhanced */}
                    <div className="pt-8 animate-slideUp flex gap-4" style={{ animationDelay: '0.3s' }}>
                        <Link to="/login"
                            className="group relative px-10 py-4 rounded-2xl font-black text-lg text-white shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                boxShadow: '0 20px 40px -15px var(--accent-primary)'
                            }}>
                            <span className="relative z-10 flex items-center gap-2">
                                Lead Sync Login
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </span>
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                        </Link>


                    </div>



                    {/* Operational Pillars - Enhanced */}
                    <div className="pt-16 animate-fadeIn w-full" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent-primary)]"></div>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30" style={{ color: 'var(--text-tertiary)' }}>
                                Global Digital Solutions
                            </p>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent-secondary)]"></div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {['DATA MINING', 'QUALIFIER', 'VERIFIER', 'MANAGER'].map((brand, index) => (
                                <div key={brand}
                                    className="group relative px-6 py-3 text-xs font-black tracking-widest rounded-xl transition-all duration-500 hover:-translate-y-1 cursor-default"
                                    style={{
                                        border: '1px solid var(--border-primary)',
                                        backgroundColor: 'rgba(var(--bg-primary-rgb), 0.5)',
                                        backdropFilter: 'blur(10px)',
                                        color: 'var(--text-primary)'
                                    }}>
                                    {brand}
                                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'radial-gradient(circle at center, var(--accent-primary)10, transparent 70%)'
                                        }}></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active GDS Brands - Premium Grid */}
                    <div className="pt-24 animate-fadeIn w-full" style={{ animationDelay: '0.6s' }}>
                        <div className="flex flex-col items-center mb-12">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent mb-6" />
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-40 text-center flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                                <span>✦</span> Production Environment <span>✦</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 max-w-5xl mx-auto">
                            {[
                                { name: 'WriteMyNursing', url: 'https://writemynursing.com/', icon: 'WN', desc: 'Academic Excellence' },
                                { name: 'NursFPXWriters', url: 'https://nursfpxwriters.com/', icon: 'NW', desc: 'Professional Writing' },
                                { name: 'TopYourCourse', url: 'https://topyourcourse.com/', icon: 'TC', desc: 'Course Mastery' },
                                { name: 'AssignmentBuds', url: 'https://assignmentbuds.com/', icon: 'AB', desc: 'Assignment Help' }
                            ].map(brand => (
                                <a
                                    key={brand.name}
                                    href={brand.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl overflow-hidden"
                                    style={{
                                        backgroundColor: 'rgba(var(--bg-primary-rgb), 0.03)',
                                        borderColor: 'var(--border-primary)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {/* Hover Effect Background */}
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{
                                            background: 'radial-gradient(circle at top right, var(--accent-primary)10, transparent 70%)'
                                        }}></span>

                                    {/* Icon Circle with Animation */}
                                    <div className="relative w-14 h-14 rounded-xl flex items-center justify-center text-sm font-black mb-4 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                            boxShadow: '0 10px 20px -5px var(--accent-primary)'
                                        }}>
                                        <span className="text-white relative z-10">{brand.icon}</span>
                                        <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-700"></span>
                                    </div>

                                    {/* Brand Info */}
                                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 transition-colors duration-300 group-hover:text-[var(--accent-primary)] text-center w-full"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {brand.name}
                                    </h3>
                                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-wider text-center w-full"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {brand.desc}
                                    </p>

                                    {/* Status Indicator */}
                                    <span className="absolute top-3 left-3 w-2 h-2 rounded-full animate-pulse"
                                        style={{ backgroundColor: 'var(--accent-primary)' }}></span>

                                    {/* Exterior Arrow - Enhanced */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-60 transition-all duration-700 transform translate-x-2 group-hover:translate-x-0">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </a>
                            ))}
                        </div>


                    </div>
                </div>
            </main>

            {/* Enhanced Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(3deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(-3deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(60px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes ping-slow {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }
                
                .animate-float { animation: float 12s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
                .animate-fadeIn { animation: fadeIn 1.2s ease-out forwards; opacity: 0; }
                .animate-slideUp { animation: slideUp 1s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; opacity: 0; }
                .animate-slideDown { animation: slideDown 0.8s ease-out forwards; opacity: 0; }
                .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                
                :root {
                    --accent-tertiary: #8B5CF6;
                }
                
                [style*="--accent-primary-rgb"] {
                    --accent-primary-rgb: 59, 130, 246;
                }
                
                [style*="--bg-primary-rgb"] {
                    --bg-primary-rgb: 15, 23, 42;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;