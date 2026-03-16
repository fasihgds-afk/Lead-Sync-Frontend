import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';

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
            case 'WEEK':
                start.setDate(now.getDate() - 7);
                break;
            case 'MONTH':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'PREV_MONTH':
                start.setMonth(now.getMonth() - 1);
                start.setDate(1);
                end.setDate(0);
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

    const cards = useMemo(() => {
        if (!data) return [];
        const { totals, conversions } = data;
        return [
            {
                id: 'mining',
                title: 'Data Mining',
                value: totals.dmCount,
                subtitle: 'Raw Leads Collected',
                trend: conversions.dm_to_lq,
                path: 'combined-leads',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
                        <path d="M4 15a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                        <path d="M8 3v2M16 3v2M8 19v2M16 19v2" />
                    </svg>
                )
            },
            {
                id: 'qualification',
                title: 'Verified Leads',
                value: totals.lqCount,
                subtitle: 'Qualified by Verifiers',
                trend: conversions.lq_to_manager,
                path: 'combined-leads',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                )
            },
            {
                id: 'qualified',
                title: 'Qualified Leads',
                value: totals.qualifiedCount,
                subtitle: 'Ready for Managers',
                trend: ((totals.qualifiedCount / totals.lqCount) * 100).toFixed(1),
                path: 'manager-leads',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path d="M12 8v8M8 12h8" />
                    </svg>
                )
            },
            {
                id: 'deals',
                title: 'Paid Sales',
                value: totals.paidCount,
                subtitle: 'Completed Deals',
                trend: conversions.manager_paid,
                path: 'manager-leads',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                )
            }
        ];
    }, [data]);

    if (loading && !data) return <SharedLoader />;

    const { totals, conversions, leaderboards } = data;

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
                            <p className="text-xs text-[var(--text-secondary)] opacity-60">Real-time overview</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-1 rounded-xl">
                            {[
                                { id: 'ALL', label: 'All' },
                                { id: 'WEEK', label: '7D' },
                                { id: 'MONTH', label: '30D' },
                                { id: 'PREV_MONTH', label: 'Prev' },
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


                    </div>
                </div>
            </div>

            {/* KPI Cards - 2x2 Grid (Full Width) */}
            <div className="grid grid-cols-2 gap-4 w-full">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => card.path && navigate(card.path)}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-3.5 hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-1.5 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary)]">
                                {card.icon}
                            </div>

                        </div>

                        <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{card.title}</h3>

                        <div className="flex items-end justify-between gap-2">
                            <span className="text-2xl font-black text-[var(--text-primary)] leading-none">{card.value}</span>

                        </div>

                        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 mt-2 pt-2 border-t border-[var(--border-primary)]/10 truncate">
                            {card.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            {/* Conversion Funnel & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Conversion Funnel - Takes 2 columns */}
                <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-[var(--accent-primary)] rounded-full" />
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Conversion Funnel • {activeFilter}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Data Mining → Verification */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-[var(--text-secondary)]">Mining → Verification</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{conversions.dm_to_lq}%</p>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${conversions.dm_to_lq}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-[var(--text-secondary)]">{totals.lqCount} converted</span>
                                <span className="text-[var(--text-primary)] font-medium">{totals.dmCount} total</span>
                            </div>
                        </div>

                        {/* Verification → Manager */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-[var(--text-secondary)]">Verification → Manager</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{conversions.lq_to_manager}%</p>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${conversions.lq_to_manager}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-[var(--text-secondary)]">{totals.managerCount} converted</span>
                                <span className="text-[var(--text-primary)] font-medium">{totals.lqCount} total</span>
                            </div>
                        </div>

                        {/* Manager → Paid */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-[var(--text-secondary)]">Manager → Paid</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{conversions.manager_paid}%</p>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${conversions.manager_paid}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-[var(--text-secondary)]">{totals.paidCount} converted</span>
                                <span className="text-[var(--text-primary)] font-medium">{totals.managerCount} total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligence Summary */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📊</span>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Intelligence Summary</h3>
                    </div>

                    <div className="space-y-2">
                        {[
                            { icon: '📁', label: 'Total Leads', value: totals.totalLeads, color: 'text-blue-600' },
                            { icon: '📝', label: 'Data Mining', value: totals.dmCount, color: 'text-indigo-600' },
                            { icon: '✅', label: 'Verified Leads', value: totals.lqCount, color: 'text-purple-600' },
                            { icon: '⏳', label: 'Manager Queue', value: totals.managerCount, color: 'text-amber-600' },
                            { icon: '🎯', label: 'Qualified Leads', value: totals.qualifiedCount, color: 'text-emerald-600' },
                            { icon: '⏰', label: 'Pending Payment', value: totals.unpaidCount, color: 'text-rose-600' },
                            { icon: '💰', label: 'Completed Sales', value: totals.paidCount, color: 'text-emerald-700' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[var(--border-primary)]/10 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{item.icon}</span>
                                    <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
                                </div>
                                <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboards - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data Minors */}
                <LeaderboardCard
                    title="Top Data Minors"
                    icon="📄"
                    color="blue"
                    data={leaderboards.dataMinors}
                    valueKey="leadsCreated"
                    valueLabel="Leads"
                />

                {/* Verifiers */}
                <LeaderboardCard
                    title="Top Verifiers"
                    icon="✅"
                    color="purple"
                    data={leaderboards.leadQualifiers}
                    valueKey="leadsUpdated"
                    valueLabel="Verified"
                />

                {/* Managers */}
                <LeaderboardCard
                    title="Manager Performance"
                    icon="💰"
                    color="amber"
                    data={leaderboards.managers}
                    valueKey="leadsInManager"
                    valueLabel="Leads"
                    renderExtra={(user) => (
                        <div className="flex gap-1 mt-1">
                            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {user.paidCount} Paid
                            </span>
                            <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                {user.unpaidCount} Pending
                            </span>
                        </div>
                    )}
                />
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
    );
}

// Simplified Leaderboard Component
function LeaderboardCard({ title, icon, color, data, valueKey, valueLabel, renderExtra }) {
    // Explicit color mapping to ensure Tailwind picks up the classes
    const colorMap = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            avatar: 'bg-blue-100'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            avatar: 'bg-purple-100'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            avatar: 'bg-amber-100'
        }
    };

    const colors = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <h3 className="text-xs font-semibold text-[var(--text-primary)]">{title}</h3>
                    </div>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
                        {data.length} Active
                    </span>
                </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {data.map((user, idx) => (
                    <div key={user.userId} className="p-3 hover:bg-[var(--bg-tertiary)]/20 border-b border-[var(--border-primary)]/10 last:border-0 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded ${idx < 3 ? `${colors.bg} ${colors.text}` : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                }`}>
                                {idx + 1}
                            </span>

                            <div className={`w-7 h-7 rounded-lg ${colors.avatar} flex items-center justify-center ${colors.text} font-bold text-xs`}>
                                {user.name?.[0] || 'U'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                                <p className="text-[9px] text-[var(--text-secondary)] truncate opacity-60">{user.email}</p>
                                {renderExtra && renderExtra(user)}
                            </div>

                            <div className="text-right border-l border-[var(--border-primary)]/10 pl-3 ml-1">
                                <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{user[valueKey]}</span>
                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-tighter opacity-50">{valueLabel}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}