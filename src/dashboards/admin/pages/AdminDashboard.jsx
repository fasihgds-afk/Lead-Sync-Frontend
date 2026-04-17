import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';
import {
    FiFolder,
    FiEdit,
    FiCheckCircle,
    FiClock,
    FiTarget,
    FiDollarSign,
    FiUsers,
    FiAward,
    FiTrendingUp,
    FiActivity,
    FiAlertCircle,
    FiRefreshCw,
} from "react-icons/fi";


export default function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [customDates, setCustomDates] = useState({ from: '', to: '' });

    const getDateRange = useCallback((filter) => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        switch (filter) {
            case 'TODAY':
                // from today to today
                break;
            case 'YESTERDAY':
                start.setDate(now.getDate() - 1);
                end.setDate(now.getDate() - 1);
                break;
            case 'WEEK':
                start.setDate(now.getDate() - 7);
                break;
            case 'THIS_MONTH':
                start.setDate(1);
                break;
            case 'CUSTOM':
                return customDates;
            case 'ALL':
            default:
                return { from: '', to: '' };
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        return { from: formatDate(start), to: formatDate(end) };
    }, [customDates]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const params = getDateRange(activeFilter);
            const res = await adminAPI.getOverview(params);
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            console.error('Dashboard Load Error:', error);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, getDateRange]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);



    if (loading && !data) return <SharedLoader />;

    const { totals, conversions, leaderboards } = data;

    const safeTotals = {
        totalLeads: totals.totalLeads || 0,
        dmCount: totals.dmCount || 0,
        lqCount: totals.lqCount || 0,
        verifierCount: totals.verifierCount || 0,
        managerCount: totals.managerCount || 0,
        qualifiedCount: totals.qualifiedCount || 0,
        unpaidCount: totals.unpaidCount || 0,
        paidCount: totals.paidCount || 0,
    };

    return (
        <div className="p-4 md:p-6 space-y-5 max-w-[1200px] mx-auto animate-fadeIn min-h-screen">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[var(--accent-primary)]/10 rounded-xl">
                            <svg className="w-6 h-6 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                Admin Dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-1 rounded-xl">
                            {[
                                { id: 'ALL', label: 'ALL' },
                                { id: 'TODAY', label: 'Today' },
                                { id: 'YESTERDAY', label: 'Previous Day' },
                                { id: 'WEEK', label: '7 Days' },
                                { id: 'THIS_MONTH', label: 'This Month' },
                                { id: 'CUSTOM', label: 'Custom' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === f.id
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}

                            {activeFilter === 'CUSTOM' && (
                                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-primary)] ml-1">
                                    <input
                                        type="date"
                                        value={customDates.from}
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, from: e.target.value }))}
                                        className="bg-[var(--bg-secondary)] text-xs px-2 py-1 rounded border border-[var(--border-primary)] w-24"
                                    />
                                    <span className="text-xs">—</span>
                                    <input
                                        type="date"
                                        value={customDates.to}
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, to: e.target.value }))}
                                        className="bg-[var(--bg-secondary)] text-xs px-2 py-1 rounded border border-[var(--border-primary)] w-24"
                                    />
                                    <button
                                        onClick={fetchDashboardData}
                                        className="p-1.5 bg-[var(--accent-primary)] text-white rounded-lg text-xs"
                                    >
                                        Go
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={fetchDashboardData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                            {loading && data ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`space-y-5 transition-all duration-500 ${loading ? 'blur-[3px] opacity-60 pointer-events-none' : 'blur-0 opacity-100'}`}>
                {/* Overall Summary (Moved up and Full Width) */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                            <FiActivity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Overall Summary</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                        {
                            icon: <FiFolder />,
                            label: "Total Leads",
                            value: safeTotals.totalLeads,
                            bgGradient: "from-blue-500/10 to-blue-600/5",
                            iconBg: "bg-blue-500/15",
                            iconColor: "text-blue-500",
                            textColor: "text-blue-600 dark:text-blue-400"
                        },
                        {
                            icon: <FiEdit />,
                            label: "Data Mining",
                            value: safeTotals.dmCount,
                            bgGradient: "from-indigo-500/10 to-indigo-600/5",
                            iconBg: "bg-indigo-500/15",
                            iconColor: "text-indigo-500",
                            textColor: "text-indigo-600 dark:text-indigo-400"
                        },
                        {
                            icon: <FiTarget />,
                            label: "Verifier Leads",
                            value: safeTotals.verifierCount,
                            bgGradient: "from-emerald-500/10 to-emerald-600/5",
                            iconBg: "bg-emerald-500/15",
                            iconColor: "text-emerald-500",
                            textColor: "text-emerald-600 dark:text-emerald-400"
                        },
                        {
                            icon: <FiCheckCircle />,
                            label: "LQ Leads",
                            value: safeTotals.lqCount,
                            bgGradient: "from-purple-500/10 to-purple-600/5",
                            iconBg: "bg-purple-500/15",
                            iconColor: "text-purple-500",
                            textColor: "text-purple-600 dark:text-purple-400"
                        },
                        {
                            icon: <FiUsers />,
                            label: "Manager Leads",
                            value: safeTotals.managerCount,
                            bgGradient: "from-amber-500/10 to-amber-600/5",
                            iconBg: "bg-amber-500/15",
                            iconColor: "text-amber-500",
                            textColor: "text-amber-600 dark:text-amber-400"
                        },
                        {
                            icon: <FiAlertCircle />,
                            label: "Unpaid Leads",
                            value: safeTotals.unpaidCount,
                            bgGradient: "from-rose-500/10 to-rose-600/5",
                            iconBg: "bg-rose-500/15",
                            iconColor: "text-rose-500",
                            textColor: "text-rose-600 dark:text-rose-400"
                        },
                        {
                            icon: <FiDollarSign />,
                            label: "Paid Leads",
                            value: safeTotals.paidCount,
                            bgGradient: "from-teal-500/10 to-teal-600/5",
                            iconBg: "bg-teal-500/15",
                            iconColor: "text-teal-500",
                            textColor: "text-teal-600 dark:text-teal-400"
                        },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${item.bgGradient} p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
                        >
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200">
                                <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-white/20 blur-xl"></div>
                            </div>

                            <div className="relative flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                                            <span className="text-base">{item.icon}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-xl font-bold ${item.textColor}`}>
                                            {item.value?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Decorative element */}
                                <div className={`absolute bottom-2 right-2 text-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-200`}>
                                    {item.icon}
                                </div>
                            </div>

                            {/* Progress bar (optional) */}
                            <div className="relative mt-3 h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${item.iconColor.replace('text', 'to')} opacity-30 group-hover:opacity-50 transition-opacity duration-200`}
                                    style={{ width: `${safeTotals.totalLeads > 0 ? (item.value / safeTotals.totalLeads) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conversion Funnel */}
            <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-[var(--accent-primary)] rounded-full" />
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Overall Performance Breakdown</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Data Mining → Verification */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Mining → Verification</p>
                            <p className="text-base font-bold text-[var(--text-primary)]">{conversions.dm_to_lq}%</p>
                        </div>
                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${conversions.dm_to_lq}%` }} />
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                            <span className="text-[var(--text-secondary)]">{totals.lqCount} converted</span>
                            <span className="text-[var(--text-primary)] font-medium">{totals.dmCount} total</span>
                        </div>
                    </div>

                    {/* Verification → Manager */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Verification → Manager</p>
                            <p className="text-base font-bold text-[var(--text-primary)]">{conversions.lq_to_manager}%</p>
                        </div>
                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${conversions.lq_to_manager}%` }} />
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                            <span className="text-[var(--text-secondary)]">{totals.managerCount} converted</span>
                            <span className="text-[var(--text-primary)] font-medium">{totals.lqCount} total</span>
                        </div>
                    </div>

                    {/* Manager → Paid */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Manager → Paid</p>
                            <p className="text-base font-bold text-[var(--text-primary)]">{conversions.manager_paid}%</p>
                        </div>
                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${conversions.manager_paid}%` }} />
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                            <span className="text-[var(--text-secondary)]">{totals.paidCount} converted</span>
                            <span className="text-[var(--text-primary)] font-medium">{totals.managerCount} total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional Leaderboards Grid */}
            <div className={`grid grid-cols-1 ${[leaderboards.dataMinors, leaderboards.leadQualifiers, leaderboards.managers].filter(d => d?.length > 0).length === 1
                ? 'md:grid-cols-1'
                : [leaderboards.dataMinors, leaderboards.leadQualifiers, leaderboards.managers].filter(d => d?.length > 0).length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
                } gap-5`}>
                {/* Data Minors */}
                {leaderboards.dataMinors?.length > 0 && (
                    <LeaderboardCard
                        title="Top Data Minors"
                        icon={<FiEdit />}
                        color="blue"
                        data={leaderboards.dataMinors}
                        valueKey="leadsCreated"
                        valueLabel="Leads"
                    />
                )}

                {/* Lead Qualifiers */}
                {leaderboards.leadQualifiers?.length > 0 && (
                    <LeaderboardCard
                        title="Top Lead Qualifiers"
                        icon={<FiTarget />}
                        color="purple"
                        data={leaderboards.leadQualifiers}
                        valueKey="leadsUpdated"
                        valueLabel="Qualified"
                    />
                )}

                {/* Managers */}
                {leaderboards.managers?.length > 0 && (
                    <LeaderboardCard
                        title="Manager Performance"
                        icon={<FiAward />}
                        color="amber"
                        data={leaderboards.managers}
                        valueKey="leadsInManager"
                        valueLabel="Leads"
                        renderExtra={(user) => (
                            <div className="flex gap-1.5 mt-1.5">
                                <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    {user.paidCount} Paid
                                </span>
                                <span className="text-[9px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                    {user.unpaidCount} Pending
                                </span>
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 text-[10px] text-[var(--text-tertiary)] opacity-50 border-t border-[var(--border-primary)]/20">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live Data • Filter: {activeFilter}
                </div>
                <span>{new Date().toLocaleTimeString('en-PK')} PKT</span>
            </div>
            </div>
        </div>
    );
}

// Simplified Leaderboard Component
// Enhanced Leaderboard Component
function LeaderboardCard({ title, icon, color, data, valueKey, valueLabel, renderExtra }) {
    // Extended color mapping with modern gradients
    const colorMap = {
        blue: {
            text: 'text-blue-700 dark:text-blue-400',
            avatar: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20',
            border: 'border-blue-200 dark:border-blue-500/20',
            medal: ['from-amber-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'],
            shadow: 'shadow-blue-500/5',
            progress: 'bg-blue-500'
        },
        purple: {
            text: 'text-purple-700 dark:text-purple-400',
            avatar: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20',
            border: 'border-purple-200 dark:border-purple-500/20',
            medal: ['from-amber-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'],
            shadow: 'shadow-purple-500/5',
            progress: 'bg-purple-500'
        },
        amber: {
            text: 'text-amber-700 dark:text-amber-400',
            avatar: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20',
            border: 'border-amber-200 dark:border-amber-500/20',
            medal: ['from-amber-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'],
            shadow: 'shadow-amber-500/5',
            progress: 'bg-amber-500'
        }
    };

    const colors = colorMap[color] || colorMap.blue;
    const total = data.reduce((sum, user) => sum + (user[valueKey] || 0), 0);

    // Medal icons instead of plain numbers
    const getMedalIcon = (idx) => {
        if (idx === 0) return '🥇';
        if (idx === 1) return '🥈';
        if (idx === 2) return '🥉';
        return null;
    };

    return (
        <div className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${colors.shadow}`}>
            {/* Header with gradient accent */}
            <div className={`relative p-4 border-b ${colors.border} bg-gradient-to-r ${colors.bg} from-transparent to-transparent`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl ${colors.avatar} flex items-center justify-center text-lg shadow-sm`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] opacity-60 flex items-center gap-1">
                                <FiTrendingUp className="text-[var(--accent-primary)]" /> Performance Ranking
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-black ${colors.text} tabular-nums`}>{data.length}</div>
                        <div className="text-[8px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Active Members</div>
                    </div>
                </div>
            </div>

            {/* Stats Summary Bar */}
            <div className="px-4 py-2 bg-[var(--bg-tertiary)]/30 border-b border-[var(--border-primary)]/10">
                <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[var(--text-secondary)]">Total {valueLabel}</span>
                    <span className={`font-bold ${colors.text}`}>{total.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1 w-full bg-[var(--border-primary)]/20 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors.progress}`} style={{ width: '100%' }}></div>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                {data.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="text-3xl opacity-20 mb-2">🏆</div>
                        <p className="text-xs text-[var(--text-secondary)] opacity-50">No data available</p>
                    </div>
                ) : (
                    data.map((user, idx) => {
                        const percentage = total > 0 ? ((user[valueKey] || 0) / total) * 100 : 0;
                        const medalIcon = getMedalIcon(idx);

                        return (
                            <div
                                key={user.userId}
                                className={`group relative p-3 hover:bg-[var(--bg-tertiary)]/30 border-b border-[var(--border-primary)]/10 last:border-0 transition-all duration-200 ${idx < 3 ? 'bg-gradient-to-r from-transparent via-transparent to-transparent' : ''
                                    }`}
                            >
                                {/* Animated progress bar on hover */}
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-current group-hover:to-current opacity-0 group-hover:opacity-20 transition-all duration-300"></div>

                                <div className="flex items-center gap-3 relative">
                                    {/* Rank with medal or number */}
                                    <div className="relative w-8">
                                        {medalIcon ? (
                                            <div className="text-xl transform group-hover:scale-110 transition-transform duration-200">
                                                {medalIcon}
                                            </div>
                                        ) : (
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx < 3 ? `${colors.bg} ${colors.text}` : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                                } group-hover:scale-105 transition-transform duration-200`}>
                                                {idx + 1}
                                            </div>
                                        )}

                                        {/* Rank badge line for top 3 */}
                                        {idx < 3 && (
                                            <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full ${colors.progress} opacity-40`}></div>
                                        )}
                                    </div>

                                    {/* Avatar with online indicator */}
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-xl ${colors.avatar} flex items-center justify-center ${colors.text} font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-secondary)]"></div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                                                {user.name}
                                            </p>
                                            {idx === 0 && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-700 dark:text-amber-400">
                                                    TOP
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[var(--text-secondary)] truncate opacity-60">
                                            {user.email?.split('@')[0]}@{user.email?.split('@')[1]?.substring(0, 2)}...
                                        </p>
                                        {renderExtra && renderExtra(user)}
                                    </div>

                                    {/* Score with visual bar */}
                                    <div className="text-right">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-base font-black ${colors.text} tabular-nums`}>
                                                {user[valueKey]?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-[8px] font-medium text-[var(--text-secondary)] opacity-50">
                                                {valueLabel}
                                            </span>
                                        </div>
                                        <div className="mt-1 w-12 h-0.5 bg-[var(--border-primary)]/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${colors.progress} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer with view more */}
            {data.length > 5 && (
                <div className="p-2 border-t border-[var(--border-primary)]/10 bg-[var(--bg-tertiary)]/20">
                    <button className="w-full text-center text-[9px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 flex items-center justify-center gap-1 group">
                        <span>View All Members</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                </div>
            )}
        </div>
    );
}