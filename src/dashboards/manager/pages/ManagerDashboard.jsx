import React, { useState, useEffect } from 'react';
import { managerAPI } from '../../../api/manager.api';
import { Link, useNavigate } from 'react-router-dom';
import SharedLoader from '../../../components/SharedLoader';

const StatCard = ({ title, value, subValue, icon, trend, colorClass, onClick }) => (
    <div
        onClick={onClick}
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-[24px] hover:border-[var(--accent-primary)]/40 transition-all duration-500 group shadow-lg hover:shadow-xl cursor-pointer"
    >
        <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${colorClass}`}>
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            {trend && (
                <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </div>
            )}
        </div>
        <div className="space-y-0.5">
            <h3 className="text-[var(--text-tertiary)] text-[9px] font-black uppercase tracking-[0.2em] truncate">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{value}</span>
                {subValue && <span className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-60 truncate">{subValue}</span>}
            </div>
        </div>
    </div>
);

export default function ManagerDashboard() {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const navigate = useNavigate();

    useEffect(() => {
        // Initial fetch for today's stats as requested
        fetchData(true);
    }, []);

    const fetchData = async (isInitial = false) => {
        try {
            setLoading(true);
            const params = {
                // Return stats for today by default on initial load
                today: isInitial && !dateRange.from && !dateRange.to,
                from: dateRange.from || undefined,
                to: dateRange.to || undefined
            };
            const response = await managerAPI.getStats(params);
            if (response.success) {
                setStatsData(response.stats);
            }
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = [
        {
            title: "REVENUE GENERATED",
            value: `$${(statsData?.totalRevenue || 0).toLocaleString()}`,
            subValue: "Selected Period Earnings",
            icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            colorClass: "bg-emerald-500/10 text-emerald-500",
            onClick: () => navigate('/gds/manager/analytics')
        },
        {
            title: "UNPAID LEADS",
            value: statsData?.unpaidLeads || 0,
            subValue: "Action Required",
            icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
            colorClass: "bg-amber-500/10 text-amber-500",
            onClick: () => navigate('/gds/manager/new-leads')
        },
        {
            title: "PENDING REJECTIONS",
            value: statsData?.rejectionRequestsPending || 0,
            subValue: "Awaiting Admin",
            icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            colorClass: "bg-blue-500/10 text-blue-500",
            onClick: () => navigate('/gds/manager/history')
        },
        {
            title: "APPROVED REJECTIONS",
            value: statsData?.approvedRejections || 0,
            subValue: "Final Rejected",
            icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            colorClass: "bg-rose-500/10 text-rose-500",
            onClick: () => navigate('/gds/manager/rejected')
        }
    ];

    if (loading && !statsData) return <SharedLoader />;

    return (
        <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto px-6 py-8">
            {/* Hero Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Manager Dashboard</h1>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest border border-[var(--accent-primary)]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                            LIVE
                        </span>
                    </div>

                    {/* Date Filters */}
                    <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)]/40 p-2.5 rounded-[24px] shadow-sm w-fit backdrop-blur-sm relative z-20">
                        <div className="flex items-center gap-3 px-3">
                            <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.15em] opacity-80">From</span>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="bg-[var(--bg-tertiary)]/50 border border-transparent rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 cursor-pointer appearance-none min-w-[140px]"
                                />
                                <div className="absolute inset-0 rounded-xl border border-[var(--accent-primary)] opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300" />
                            </div>
                        </div>

                        <div className="w-px h-8 bg-[var(--border-primary)]/20 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-3 px-3">
                            <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.15em] opacity-80">To</span>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="bg-[var(--bg-tertiary)]/50 border border-transparent rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 cursor-pointer appearance-none min-w-[140px]"
                                />
                                <div className="absolute inset-0 rounded-xl border border-[var(--accent-primary)] opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300" />
                            </div>
                        </div>

                        <button
                            onClick={() => fetchData(false)}
                            disabled={loading}
                            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary)]/80 hover:scale-[1.02] active:scale-[0.98] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all duration-300 shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:scale-100 min-w-[110px] justify-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    Search
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 flex items-center gap-4 shadow-sm backdrop-blur-sm whitespace-nowrap">
                        <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                            Today's Stats
                        </span>
                        <div className="w-px h-3 bg-[var(--accent-primary)]/20" />
                        <span className="text-[9px] font-bold text-[var(--text-tertiary)]">Use date filters for weekly or monthly stats</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Responsive layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardStats.map((stat, i) => <StatCard key={i} {...stat} />)}
            </div>
        </div>
    );
}
