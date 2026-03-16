import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../../api/super-admin';
import SharedLoader from '../../../components/SharedLoader';

export default function RejectedLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [decisionComments, setDecisionComments] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, leadId: null, decision: null });
    const [reasonModal, setReasonModal] = useState({ show: false, comments: [] });

    useEffect(() => {
        fetchRejectionRequests();
    }, []);

    const fetchRejectionRequests = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setRefreshing(true);

            const data = await superAdminAPI.getRejectionRequests();
            if (data.success) {
                setLeads(data.leads || []);
                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching rejection requests:', err);
            if (!isBackground) {
                setError(err.response?.data?.message || 'Failed to fetch rejection requests');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDecision = async () => {
        const { leadId, decision } = confirmModal;
        try {
            setActionLoading(leadId + decision);
            const comment = decisionComments[leadId] || '';
            const data = await superAdminAPI.decideRejectionRequest(leadId, decision, comment);

            if (data.success) {
                setLeads(prev => prev.filter(l => l._id !== leadId));
                setDecisionComments(prev => {
                    const next = { ...prev };
                    delete next[leadId];
                    return next;
                });
                setError(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${decision.toLowerCase()} rejection`);
            console.error(`Error with decision ${decision}:`, err);
        } finally {
            setActionLoading(null);
            setConfirmModal({ show: false, leadId: null, decision: null });
        }
    };

    const triggerConfirm = (leadId, decision) => {
        if (!decision) return;
        setConfirmModal({ show: true, leadId, decision });
    };

    if (loading && !refreshing) return <SharedLoader />;

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-tight">
                                    Rejected By<span className="text-emerald-500"> Manager</span>
                                </h1>

                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-[var(--border-primary)] opacity-20 hidden md:block" />

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{leads.length}</span>
                                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase">Leads</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-[var(--border-primary)] opacity-20 hidden lg:block" />

                        <div className="flex items-center bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)]/40 rounded-full pl-1 pr-3 py-1 gap-3 hover:border-emerald-500/40 transition-all group/sync-badge">
                            <button
                                onClick={() => fetchRejectionRequests(true)}
                                disabled={refreshing}
                                className="w-7 h-7 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                            >
                                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : 'group-hover/sync-badge:rotate-180 transition-transform duration-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div className="flex flex-col leading-none">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Refresh</span>
                                </div>
                                <span className="text-[9px] font-black text-[var(--text-primary)] tabular-nums mt-0.5">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] shadow-xl overflow-hidden animate-slideUp relative">
                {refreshing && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/30 overflow-hidden z-[50]">
                        <div className="w-1/2 h-full bg-emerald-500 animate-[shimmer_1.5s_infinite]" style={{
                            background: 'linear-gradient(90deg, transparent, #10b981, transparent)'
                        }}></div>
                    </div>
                )}

                <div className="overflow-x-auto lg:overflow-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[40px] hidden xl:table-cell">#</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[18%]">Name / Location</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[20%]">Emails</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[18%]">Numbers</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[8%] text-center">Comment</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] w-[12%]">Manager</th>
                                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] text-right w-[12%]">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]/50 text-[var(--text-primary)]">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-16 text-center text-[var(--text-tertiary)] font-black text-[10px] uppercase tracking-[0.3em] opacity-30">
                                        No pending nodes detected
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead, index) => {
                                    const reason = lead.comments?.filter(c => c.createdByRole === 'Manager').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.text || 'No justification';
                                    return (
                                        <tr key={lead._id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors group">
                                            <td className="px-3 py-3 align-middle text-[10px] font-black text-[var(--text-tertiary)] opacity-40 hidden xl:table-cell">{index + 1}</td>

                                            {/* Lead / Prospect */}
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500 border border-emerald-500/10 flex items-center justify-center font-black text-[10px] shrink-0">
                                                        {lead.name?.[0]?.toUpperCase() || 'L'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-bold group-hover:text-emerald-500 transition-colors truncate">{lead.name || 'Anonymous'}</div>
                                                        <div className="text-[8px] font-black text-[var(--text-tertiary)] opacity-60 uppercase truncate">📍 {lead.location || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Emails Column - from responseSource */}
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex flex-col gap-1 min-w-0 max-h-[88px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {(lead.responseSource?.emails || []).map((emailObj, i) => (
                                                        <div
                                                            key={`rs-e-${i}`}
                                                            onClick={() => handleCopy(emailObj.value, `e-${lead._id}-${i}`)}
                                                            className="flex items-center justify-between px-2 py-0.5 bg-blue-500/5 rounded-md border border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all shrink-0 cursor-pointer relative"
                                                        >
                                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] mr-2">{emailObj.value}</span>
                                                            {copiedId === `e-${lead._id}-${i}` ? (
                                                                <span className="text-[7px] font-black text-emerald-500 shrink-0">Copied</span>
                                                            ) : (
                                                                <svg className="w-2.5 h-2.5 text-blue-500/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {(lead.responseSource?.emails || []).length === 0 && lead.responseSource?.email?.value && (
                                                        <div
                                                            onClick={() => handleCopy(lead.responseSource.email.value, `e-${lead._id}-s`)}
                                                            className="flex items-center justify-between px-2 py-0.5 bg-blue-500/5 rounded-md border border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all shrink-0 cursor-pointer relative"
                                                        >
                                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] mr-2">{lead.responseSource.email.value}</span>
                                                            {copiedId === `e-${lead._id}-s` ? (
                                                                <span className="text-[7px] font-black text-emerald-500 shrink-0">Copied</span>
                                                            ) : (
                                                                <svg className="w-2.5 h-2.5 text-blue-500/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(lead.responseSource?.emails || []).length === 0 && !lead.responseSource?.email?.value && (
                                                        <span className="text-[8px] text-[var(--text-tertiary)] opacity-40 italic">No emails</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Numbers Column - from responseSource */}
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex flex-col gap-1 min-w-0 max-h-[88px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {(lead.responseSource?.phones || []).map((phoneObj, i) => (
                                                        <div
                                                            key={`rs-p-${i}`}
                                                            onClick={() => handleCopy(phoneObj.value, `p-${lead._id}-${i}`)}
                                                            className="flex items-center justify-between px-2 py-0.5 bg-green-500/5 rounded-md border border-green-500/10 hover:border-green-500/30 hover:bg-green-500/10 transition-all shrink-0 cursor-pointer relative"
                                                        >
                                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] mr-2">{phoneObj.value}</span>
                                                            {copiedId === `p-${lead._id}-${i}` ? (
                                                                <span className="text-[7px] font-black text-emerald-500 shrink-0">Copied</span>
                                                            ) : (
                                                                <svg className="w-2.5 h-2.5 text-green-500/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {(lead.responseSource?.phones || []).length === 0 && lead.responseSource?.phone?.value && (
                                                        <div
                                                            onClick={() => handleCopy(lead.responseSource.phone.value, `p-${lead._id}-s`)}
                                                            className="flex items-center justify-between px-2 py-0.5 bg-green-500/5 rounded-md border border-green-500/10 hover:border-green-500/30 hover:bg-green-500/10 transition-all shrink-0 cursor-pointer relative"
                                                        >
                                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] mr-2">{lead.responseSource.phone.value}</span>
                                                            {copiedId === `p-${lead._id}-s` ? (
                                                                <span className="text-[7px] font-black text-emerald-500 shrink-0">Copied</span>
                                                            ) : (
                                                                <svg className="w-2.5 h-2.5 text-green-500/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(lead.responseSource?.phones || []).length === 0 && !lead.responseSource?.phone?.value && (
                                                        <span className="text-[8px] text-[var(--text-tertiary)] opacity-40 italic">No phones</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Info/Reason Icon Column */}
                                            <td className="px-3 py-3 align-middle text-center">
                                                <button
                                                    onClick={() => setReasonModal({ show: true, comments: lead.comments || [] })}
                                                    className="w-7 h-7 flex items-center justify-center mx-auto bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                    title="View Rejection Justification"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                            </td>

                                            {/* Manager - name and date+time, no avatar */}
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-black text-[var(--text-primary)] truncate leading-tight">{lead.rejectionRequestedBy?.name || 'Manager'}</span>
                                                    <span className="text-[8px] font-bold text-[var(--text-tertiary)] opacity-60 leading-tight">
                                                        {new Date(lead.rejectionRequestedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        {' • '}
                                                        {new Date(lead.rejectionRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Decision Dropdown */}
                                            <td className="px-3 py-3 align-middle text-right">
                                                <div className="relative inline-block w-full max-w-[100px]">
                                                    <select
                                                        onChange={(e) => triggerConfirm(lead._id, e.target.value)}
                                                        value=""
                                                        className="appearance-none bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[9px] font-black uppercase text-emerald-500 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-emerald-500/40 hover:bg-[var(--bg-secondary)] transition-all w-full pr-8 shadow-sm"
                                                    >
                                                        <option value="" disabled>Review</option>
                                                        <option value="APPROVE" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Finalize</option>
                                                        <option value="REJECT" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Return</option>
                                                    </select>
                                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comments Modal - All Comments */}
            {reasonModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-fadeIn">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[20px] w-full max-w-[380px] overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </div>
                                    <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Comments ({reasonModal.comments.length})</h3>
                                </div>
                                <button
                                    onClick={() => setReasonModal({ show: false, comments: [] })}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] transition-all text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {reasonModal.comments.length === 0 ? (
                                    <p className="text-[9px] text-[var(--text-tertiary)] text-center py-4 opacity-50 italic">No comments</p>
                                ) : (
                                    reasonModal.comments
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                        .map((comment, idx) => {
                                            const roleColors = {
                                                'Manager': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                                                'Lead Qualifiers': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                                                'Admin': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                                                'Super Admin': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                                                'Data Minors': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                                            };
                                            const colorClass = roleColors[comment.createdByRole] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
                                            return (
                                                <div key={idx} className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)]/20 p-2.5 rounded-lg space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
                                                            {comment.createdByRole || 'Unknown'}
                                                        </span>
                                                        <span className="text-[7px] font-bold text-[var(--text-tertiary)] opacity-60">
                                                            {comment.createdDate || new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            {' • '}
                                                            {comment.createdTime
                                                                ? comment.createdTime.slice(0, 5)
                                                                : new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-semibold text-[var(--text-secondary)] leading-relaxed">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                            <button
                                onClick={() => setReasonModal({ show: false, comments: [] })}
                                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[9px] font-black uppercase text-[var(--text-primary)] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal - Ultra Compact Decision & Note */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[20px] w-full max-w-[280px] overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-4 text-center space-y-3.5">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
                                {confirmModal.decision === 'APPROVE' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-black text-[var(--text-primary)] leading-none">
                                    {confirmModal.decision === 'APPROVE' ? 'Finalize' : 'Return'}
                                </h3>
                                <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest leading-none">
                                    {confirmModal.decision === 'APPROVE' ? 'Flag as invalid' : 'Send back'}
                                </p>
                            </div>

                            {/* Audit Note (Used for both) */}
                            <div className="space-y-1 text-left">
                                <label className="text-[7px] font-black uppercase text-[var(--text-tertiary)] opacity-60 ml-0.5">Audit Decision Note</label>
                                <textarea
                                    value={decisionComments[confirmModal.leadId] || ''}
                                    onChange={(e) => setDecisionComments({ ...decisionComments, [confirmModal.leadId]: e.target.value })}
                                    placeholder="Enter decision rationale..."
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1.5 text-[9px] font-bold text-[var(--text-primary)] focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none h-16 resize-none transition-all placeholder:opacity-30 custom-scrollbar shadow-inner"
                                />
                            </div>

                            <div className="flex gap-2.5 pt-1">
                                <button
                                    onClick={() => setConfirmModal({ show: false, leadId: null, decision: null })}
                                    className="flex-1 px-3 py-2 border border-[var(--border-primary)] rounded-lg text-[8px] font-black uppercase text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleDecision}
                                    disabled={actionLoading}
                                    className={`flex-1 px-3 py-2 ${confirmModal.decision === 'APPROVE' ? 'bg-emerald-500' : 'bg-orange-500'} text-white rounded-lg text-[8px] font-black uppercase hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-30`}
                                >
                                    {actionLoading ? 'Ext...' : 'Execute'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 10px; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}} />
        </div>
    );
}
