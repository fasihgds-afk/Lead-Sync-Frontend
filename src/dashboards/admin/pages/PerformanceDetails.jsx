import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';
import { FiActivity, FiZap, FiRefreshCw } from "react-icons/fi";

export default function PerformanceDetails() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState({});
    const [activeRole, setActiveRole] = useState('Data Minors');
    const [refreshing, setRefreshing] = useState(false);

    const roles = ['Data Minors', 'Lead Qualifiers', 'Manager'];

    const fetchingRef = useRef(new Set());
    const fetchPerformance = useCallback(async (role) => {
        if (fetchingRef.current.has(role)) return;
        fetchingRef.current.add(role);

        try {
            setRefreshing(true);
            const res = await adminAPI.getPerformance(role);
            if (res.success) {
                setPerformanceData(prev => ({
                    ...prev,
                    [role]: res.rows
                }));
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
        } finally {
            setInitialLoading(false);
            setRefreshing(false);
            fetchingRef.current.delete(role);
        }
    }, []);

    // Fetch performance data when role changes
    useEffect(() => {
        if (!performanceData[activeRole]) {
            fetchPerformance(activeRole);
        }
    }, [activeRole, fetchPerformance, performanceData]);

    if (initialLoading) return <SharedLoader />;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                            <FiActivity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-primary)]">Performance Analytics</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => fetchPerformance(activeRole)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-sm disabled:opacity-50"
                    >
                        <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {/* Role Switcher */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-fit shadow-sm">
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeRole === role
                                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/25 scale-105'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {/* Metrics Table */}
                <div className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-sm transition-opacity duration-300 ${refreshing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 flex justify-between items-center">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <FiZap className="text-amber-500" />
                            {activeRole} Performance
                        </h2>
                        <span className="text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2.5 py-1 rounded-lg font-bold">
                            {performanceData[activeRole]?.length || 0} Members Found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/10">
                                <tr>
                                    <th className="px-6 py-4">Full Name</th>
                                    {activeRole === 'Lead Qualifiers' && (
                                        <>
                                            <th className="px-6 py-4 text-emerald-500">Qualified</th>
                                            <th className="px-6 py-4 text-rose-500">Dead</th>
                                            <th className="px-6 py-4 text-blue-500">Reached</th>
                                        </>
                                    )}
                                    {activeRole === 'Manager' && (
                                        <>
                                            <th className="px-6 py-4 text-emerald-500">Paid</th>
                                            <th className="px-6 py-4 text-rose-500">Unpaid</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 text-right">Processed Leads</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {(!performanceData[activeRole] || performanceData[activeRole].length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <FiActivity className="w-12 h-12" />
                                                <p className="text-sm font-bold">No performance data found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    performanceData[activeRole].map((row) => (
                                        <tr key={row.userId} className="group hover:bg-[var(--bg-tertiary)]/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-indigo-500/10 flex items-center justify-center font-black text-[var(--accent-primary)] text-sm shadow-sm">
                                                        {row.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text-primary)]">{row.name}</div>
                                                        <div className="text-[10px] text-[var(--text-secondary)] opacity-50 font-medium">{row.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {activeRole === 'Lead Qualifiers' && (
                                                <>
                                                    <td className="px-6 py-4 text-emerald-500 font-bold text-sm">{row.metrics.qualified || 0}</td>
                                                    <td className="px-6 py-4 text-rose-500 font-bold text-sm">{row.metrics.dead || 0}</td>
                                                    <td className="px-6 py-4 text-blue-500 font-bold text-sm">{row.metrics.inConversation || 0}</td>
                                                </>
                                            )}
                                            {activeRole === 'Manager' && (
                                                <>
                                                    <td className="px-6 py-4 text-emerald-500 font-bold text-sm">{row.metrics.paid || 0}</td>
                                                    <td className="px-6 py-4 text-rose-500 font-bold text-sm">{row.metrics.unpaid || 0}</td>
                                                </>
                                            )}
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-lg text-xs font-mono font-black text-[var(--text-primary)]">
                                                    {row.metrics.processed || 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
