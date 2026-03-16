import React, { useState, useEffect, useCallback } from 'react';
import { dataMinorAPI } from '../../../api/data-minor';
import SharedLoader from '../../../components/SharedLoader';
import StatCard from '../components/StatCard';
import tokenManager from '../../../utils/tokenManager';

export default function DataMinorDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        today: 0,
        monthly: 0,
        filtered: 0
    });
    const [user, setUser] = useState(null);
    const [dateFilter, setDateFilter] = useState('today');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const dailyTarget = 50;

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Today, Monthly, and Filtered stats in parallel for a complete dashboard view
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const todayStr = now.toISOString().split('T')[0];

            let filterParams = {};
            if (dateFilter === 'today') filterParams.today = 'true';
            else if (dateFilter === 'custom') {
                if (customFrom) filterParams.from = customFrom;
                if (customTo) filterParams.to = customTo;
            }

            const [todayRes, monthRes, filteredRes] = await Promise.all([
                dataMinorAPI.getMyStats({ today: 'true' }),
                dataMinorAPI.getMyStats({ from: startOfMonth, to: todayStr }),
                Object.keys(filterParams).length > 0 ? dataMinorAPI.getMyStats(filterParams) : dataMinorAPI.getMyStats()
            ]);

            setStats({
                today: todayRes.totalCount || 0,
                monthly: monthRes.totalCount || 0,
                filtered: filteredRes.totalCount || 0
            });

        } catch (err) {
            console.error('Production sync failed:', err);
            setError("Network error while loading dashboard statistics.");
        } finally {
            setLoading(false);
        }
    }, [dateFilter, customFrom, customTo]);

    useEffect(() => {
        const currentUser = tokenManager.getUser();
        setUser(currentUser);
        fetchStats();
    }, [fetchStats]);

    if (loading && stats.today === 0) return <SharedLoader />;

    const efficiency = Math.min(Math.round((stats.today / dailyTarget) * 100), 100);

    return (
        <div className="space-y-8 animate-fadeIn">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold animate-fadeIn">
                    ⚠ {error}
                </div>
            )}

            {/* Header Segment - Matching LQ-style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--test-primary)] tracking-tight">DataMinor Dashboard</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                    {/* Simplified Identity Icon */}
                    <div className="flex items-center px-2 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl shadow-inner">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00BE9B] to-[#00a082] flex items-center justify-center text-white text-xs font-black shadow-lg">
                            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                    </div>

                    {/* Functional Date Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#00BE9B] cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 animate-fadeIn bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 py-1.5">
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                                />
                                <span className="text-[var(--text-tertiary)] font-black text-[10px] opacity-40">TO</span>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={fetchStats}
                        className="px-5 py-2.5 rounded-xl bg-[#00BE9B] text-white text-sm font-bold shadow-lg shadow-[#00BE9B]/20 hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Search
                    </button>

                    <div className="w-px h-6 bg-[var(--border-primary)] mx-1 hidden sm:block"></div>

                    <button
                        onClick={() => {
                            setDateFilter('today');
                            setCustomFrom('');
                            setCustomTo('');
                            // Stats will update via useEffect/fetchStats dependency or manual call
                            setTimeout(fetchStats, 0);
                        }}
                        className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] active:scale-95 transition-all duration-300"
                        title="Reset & Refresh"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Stats Grid - Compact Single Row */}
            <div className="max-w-4xl">
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        title="Today Leads"
                        value={stats.today}
                        subtitle={`Target: ${dailyTarget}`}
                        color="bg-[#00BE9B]/10 text-[#00BE9B]"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />

                    <StatCard
                        title={dateFilter === 'today' ? "Today Focus" : dateFilter === 'custom' ? "Custom Range" : "System Total"}
                        value={stats.filtered}
                        subtitle={dateFilter === 'today' ? "Current Workday" : dateFilter === 'custom' ? "Selected Period" : "All-Time Output"}
                        color="bg-[#00BE9B] text-white"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z" /></svg>}
                    />
                </div>
            </div>
            {/* Progress Section */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent-primary)]">Productivity </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] uppercase">Daily Target </p>
                        <p className="text-lg font-black text-[var(--accent-primary)]">{efficiency}%</p>
                    </div>
                    <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded-2xl p-1 border border-[var(--border-primary)] relative overflow-hidden">
                        <div
                            className={`h-full rounded-xl transition-all duration-1000 ${efficiency >= 85 ? 'bg-[#00BE9B] shadow-[0_0_15px_rgba(0,190,155,0.3)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'}`}
                            style={{ width: `${efficiency}%` }}
                        >
                            <div className="w-full h-full bg-white/20 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black opacity-30 uppercase tracking-tighter">
                        <span>Add Leads: {stats.today} Leads</span>
                        <span>System Relay: {dailyTarget} Leads/Day</span>
                    </div>
                </div>
            </div>
        </div>
    );
}