import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dataMinorAPI from '../../../api/data-minor';

// ────────────────────────────────────────────────
// Cookie Helpers
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length !== 2) return null;
    try {
        return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
    } catch {
        return null;
    }
};

const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires.toUTCString()}; path=/`;
};

const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

// ────────────────────────────────────────────────
const VerifierLeads = () => {
    // ─── State ─────────────────────────────────────
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedNames, setExpandedNames] = useState(() => new Set());
    const [filterDate, setFilterDate] = useState('');
    const [pendingEmailChanges, setPendingEmailChanges] = useState({});
    const [processingLeads, setProcessingLeads] = useState(() => new Set());
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const itemsPerPage = 15;

    const hasInitiallyLoadedRef = useRef(false);

    // ─── Helpers ───────────────────────────────────
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    // ─── Cookie Sync ───────────────────────────────
    useEffect(() => {
        const saved = getCookie('verifier_email_changes');
        if (saved) setPendingEmailChanges(saved);
    }, []);

    useEffect(() => {
        if (Object.keys(pendingEmailChanges).length > 0) {
            setCookie('verifier_email_changes', pendingEmailChanges);
        } else {
            deleteCookie('verifier_email_changes');
        }
    }, [pendingEmailChanges]);

    // ─── Data Fetching ─────────────────────────────
    const fetchLeads = useCallback(async (pageArg) => {
        const page = pageArg ?? currentPage;
        setLoading(true);

        try {
            const skip = (page - 1) * itemsPerPage;
            const res = await dataMinorAPI.getVerifierLeads(itemsPerPage, skip);

            if (res.success || Array.isArray(res.leads)) {
                const fetchedLeads = res.leads ?? [];
                const total = res.totalLeads ?? res.total ?? res.count ?? 0;

                setTotalLeads(total);

                // Handle page overflow (e.g. after processing leads)
                const totalPages = Math.ceil(total / itemsPerPage);
                if (page > totalPages && total > 0) {
                    const targetPage = Math.max(1, totalPages);
                    setCurrentPage(targetPage);
                    return fetchLeads(targetPage);
                }

                setLeads(fetchedLeads);
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            showNotification('Failed to load leads', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, showNotification]);

    // Initial Load
    useEffect(() => {
        if (!hasInitiallyLoadedRef.current) {
            hasInitiallyLoadedRef.current = true;
            fetchLeads(1);
        }
    }, [fetchLeads]);

    // Fetch on page change
    useEffect(() => {
        if (hasInitiallyLoadedRef.current) {
            fetchLeads(currentPage);
        }
    }, [currentPage, fetchLeads]);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // ─── UI Interactions ───────────────────────────
    const toggleExpand = useCallback((id) => {
        setExpandedNames((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const getStatusBadge = (status) => {
        const s = (status ?? '').toUpperCase();
        if (s === 'ACTIVE') return 'border-[var(--accent-success)]/20 bg-[var(--accent-success)]/10 text-[var(--accent-success)]';
        if (s === 'BOUNCED') return 'border-[var(--accent-error)]/20 bg-[var(--accent-error)]/10 text-[var(--accent-error)]';
        if (s === 'DEAD') return 'border-gray-500/20 bg-gray-500/10 text-gray-500';
        return 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]';
    };

    const getStatusIcon = (status) => {
        const s = (status ?? '').toUpperCase();
        if (s === 'ACTIVE') return '✓';
        if (s === 'BOUNCED' || s === 'DEAD') return '✕';
        if (s === 'NO_EMAIL') return '–';
        return '…';
    };

    // ─── Computed Data ─────────────────────────────
    const filteredLeads = useMemo(() => {
        return leads
            .filter((lead) => {
                if (!filterDate) return true;
                const d = new Date(lead.submittedDate || lead.createdAt);
                return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === filterDate;
            })
            .map((lead) => ({
                ...lead,
                displayEmails: lead.emails ?? [],
            }));
    }, [leads, filterDate]);

    const searchedLeads = useMemo(() => {
        if (!searchTerm.trim()) return filteredLeads;

        const term = searchTerm.toLowerCase();
        return filteredLeads.filter((lead) =>
            lead.displayEmails.some((emailObj) => {
                const email = (emailObj.normalized || emailObj.value || '').toLowerCase();
                return email.includes(term);
            })
        );
    }, [filteredLeads, searchTerm]);

    const totalEmailsOnPage = useMemo(() => {
        return searchedLeads.reduce((acc, lead) => acc + (lead.displayEmails?.length || 0), 0);
    }, [searchedLeads]);

    // ─── Lead Actions ───────────────────────────────
    const markEmailStatus = useCallback((leadId, email, status) => {
        if (!email) return;

        setPendingEmailChanges((prev) => ({
            ...prev,
            [leadId]: {
                ...(prev[leadId] ?? {}),
                [email]: status,
            },
        }));

        setLeads((prev) =>
            prev.map((lead) =>
                lead._id === leadId
                    ? {
                        ...lead,
                        emails: lead.emails?.map((e) =>
                            (e.normalized || e.value) === email ? { ...e, status } : e
                        ) ?? [],
                    }
                    : lead
            )
        );
    }, []);

    const handleProcessAllLeads = async () => {
        setIsProcessing(true);
        setShowConfirmModal(false);

        try {
            const res = await dataMinorAPI.distributeVerifierLeadsToLQ();

            if (res.success) {
                if (res.count === 0) {
                    showNotification(res.message || 'No leads to distribute.', 'info');
                } else {
                    showNotification(res.message || 'Leads distributed successfully!', 'success');
                    setCurrentPage(1);
                    fetchLeads(1);
                }
            }
        } catch (err) {
            console.error('Batch distribute failed:', err);
            showNotification(
                err.response?.status === 404
                    ? 'No verified leads found.'
                    : `Batch process failed: ${err.response?.data?.message || err.message}`,
                'error'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDoneManual = async (leadId) => {
        const lead = leads.find((l) => l._id === leadId);
        if (!lead) return;

        setProcessingLeads((prev) => new Set([...prev, leadId]));

        try {
            const pending = pendingEmailChanges[leadId] ?? {};

            const emailsToUpdate = (lead.emails ?? []).map((e) => {
                const norm = e.normalized || e.value;
                const status =
                    pending[norm] ||
                    (e.status && e.status.toUpperCase() !== 'PENDING' ? e.status : 'ACTIVE');

                return { normalized: norm, status };
            });

            await dataMinorAPI.updateLeadAllEmails(leadId, emailsToUpdate);

            setPendingEmailChanges((prev) => {
                const next = { ...prev };
                delete next[leadId];
                return next;
            });

            showNotification('Lead verified & completed!', 'success');
            fetchLeads();
        } catch (err) {
            console.error('Manual done failed:', err);
            showNotification('Failed to complete lead: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setProcessingLeads((prev) => {
                const next = new Set(prev);
                next.delete(leadId);
                return next;
            });
        }
    };

    const copyAllEmailsOnPage = async () => {
        const allEmails = searchedLeads.flatMap((lead) =>
            (lead.displayEmails || [])
                .map((emailObj) => emailObj.normalized || emailObj.value)
                .filter(Boolean)
        );

        if (allEmails.length === 0) {
            showNotification('No emails found on this page.', 'info');
            return;
        }

        try {
            await navigator.clipboard.writeText(allEmails.join('\n'));
            showNotification(`Copied ${allEmails.length} emails to clipboard!`, 'success');
        } catch (err) {
            console.error('Failed to copy emails:', err);
            showNotification('Failed to copy emails to clipboard.', 'error');
        }
    };

    // ─── Render Helpers ─────────────────────────────
    const isDM = (lead) => lead.stage === 'DM';
    const isVerifierStage = (lead) => lead.stage === 'Verifier';

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen animate-in fade-in slide-in-from-bottom-5 duration-700"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            <div className="space-y-4">
                {/* Header + Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Verifier Leads
                        </h1>
                        <p className="text-sm font-medium mt-1 opacity-80" style={{ color: 'var(--text-secondary)' }}>
                            Review and verify submitted leads
                        </p>

                        {totalLeads > 0 && (
                            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                    boxShadow: '0 4px 20px -8px var(--accent-primary)/50'
                                }}>
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-sm font-black text-white tracking-wide">
                                    Total Leads: {totalLeads.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                        {/* Copy Emails Button */}
                        <div className="flex items-center gap-2 pr-4 border-r border-[var(--border-primary)]">
                            <button
                                onClick={copyAllEmailsOnPage}
                                className="group px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                <span>Copy Emails ({totalEmailsOnPage})</span>
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className="relative group/search">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by email..."
                                    className="pl-9 pr-8 py-2.5 w-48 rounded-xl border text-[13px] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 font-bold transition-all focus:w-64"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-primary)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-[var(--accent-primary)]">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-500/10 text-gray-400"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="pl-3 pr-2 py-2.5 rounded-xl border text-[13px] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 font-bold w-36 uppercase tracking-tighter"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    borderColor: 'var(--border-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            />

                            <button
                                onClick={() => fetchLeads()}
                                disabled={loading}
                                className="px-4 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 text-[13px] font-bold disabled:opacity-50 hover:bg-[var(--bg-primary)] active:scale-95 border-[var(--border-primary)] shadow-sm"
                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            >
                                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Process All Button */}
                <div className="flex justify-center py-4 pt-2">
                    <div className="p-2.5 px-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm inline-flex items-center">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isProcessing}
                            className="group px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 border border-emerald-400/20"
                        >
                            {isProcessing ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                            <span>Process All Verified</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div
                key={currentPage}
                className={`space-y-4 transition-all duration-500 ease-in-out ${loading ? 'opacity-40 scale-[0.99] blur-[2px] pointer-events-none' : 'opacity-100 scale-100 blur-0'} animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both`}
            >
                {loading && leads.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-12 h-12 mb-4 border-4 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent-primary)' }}></div>
                        <p style={{ color: 'var(--text-secondary)' }}>Loading leads...</p>
                    </div>
                ) : searchedLeads.length === 0 ? (
                    <div className="p-20 text-center opacity-60 flex flex-col items-center justify-center rounded-3xl border border-dashed"
                        style={{ borderColor: 'var(--border-primary)' }}>
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {searchTerm ? `No leads match "${searchTerm}" on this page` : 'No leads found for verification'}
                        </p>
                    </div>
                ) : (
                    searchedLeads.map((lead, index) => {
                        const isExpanded = expandedNames.has(lead._id);
                        const source = lead.sources?.[0];
                        const sourceText = source?.name || 'Local Upload';
                        const pendingCount = lead.displayEmails.filter(emailObj => {
                            const email = emailObj.normalized || emailObj.value;
                            const status = pendingEmailChanges[lead._id]?.[email] || emailObj.status || 'PENDING';
                            return String(status).toUpperCase() === 'PENDING';
                        }).length;

                        const totalCount = lead.displayEmails.length;
                        const isDMLead = isDM(lead);
                        const isVerifierLead = isVerifierStage(lead);

                        return (
                            <div
                                key={lead._id}
                                className={`group rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-2xl ${isVerifierLead ? 'ring-1 ring-emerald-500/30 shadow-emerald-500/5' : ''}`}
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: isVerifierLead ? '#10b98144' : (isExpanded ? 'var(--accent-primary)' : 'var(--border-primary)'),
                                    boxShadow: isExpanded ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none'
                                }}
                            >
                                {/* Card Header */}
                                <div
                                    onClick={() => toggleExpand(lead._id)}
                                    className="px-6 py-5 flex items-center justify-between cursor-pointer transition-colors"
                                    style={{ backgroundColor: isExpanded ? 'var(--bg-tertiary)' : 'transparent' }}
                                >
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="relative">
                                            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] text-[10px] font-black flex items-center justify-center shadow-lg z-10 border-2 border-[var(--bg-secondary)]">
                                                {((currentPage - 1) * itemsPerPage) + index + 1}
                                            </div>
                                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transform transition-transform group-hover:scale-105"
                                                style={{
                                                    background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                                                    border: '1px solid var(--border-primary)',
                                                    color: 'white'
                                                }}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-3">
                                                <h3 className="font-bold text-lg truncate tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                                    Lead #{((currentPage - 1) * itemsPerPage) + index + 1}
                                                </h3>
                                                {isVerifierLead && (
                                                    <span className="text-[9px] uppercase font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Ready for LQ
                                                    </span>
                                                )}
                                                {isExpanded && !isVerifierLead && (
                                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-tertiary)' }}>
                                                        Viewing Details
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-medium">
                                                <div className="flex items-center gap-1.5 text-emerald-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-bold">
                                                        {lead.submittedDate || (lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : 'N/A')}
                                                    </span>
                                                </div>

                                                <div className="w-1 h-1 rounded-full opacity-20" style={{ backgroundColor: 'var(--text-primary)' }}></div>

                                                <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                    <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{pendingCount} Pending / {totalCount} Total</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: 'var(--text-tertiary)' }}>
                                                {lead.submittedDate ? 'Submitted Date' : 'Created At'}
                                            </p>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {lead.submittedDate
                                                    ? lead.submittedDate
                                                    : (lead.createdAt
                                                        ? new Date(lead.createdAt).toLocaleString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        }).replace(',', '')
                                                        : 'N/A')
                                                }
                                            </p>
                                        </div>

                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'rotate-180 bg-[var(--bg-primary)]' : 'bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white'}`}
                                            style={{ color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        <div className="px-6 pb-6 pt-2">
                                            <div className="rounded-xl overflow-hidden border"
                                                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>

                                                {/* Table Header */}
                                                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase font-black tracking-widest"
                                                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                                                    <div className="col-span-5">Email Address</div>
                                                    <div className="col-span-3">Status</div>
                                                    <div className="col-span-4 text-right">Verification</div>
                                                </div>

                                                {/* Emails List */}
                                                <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                                                    {lead.displayEmails.map((emailObj, idx) => {
                                                        const email = emailObj.normalized || emailObj.value;
                                                        const originalStatus = emailObj.status || 'PENDING';
                                                        const pendingStatus = pendingEmailChanges[lead._id]?.[email];
                                                        const status = pendingStatus || originalStatus;
                                                        const hasPendingChange = !!pendingStatus;

                                                        return (
                                                            <div key={`${lead._id}-${idx}`}
                                                                className="grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors hover:bg-[var(--bg-tertiary)]/20">

                                                                {/* Email */}
                                                                <div className="col-span-5 flex items-center gap-2 group/copy">
                                                                    <span className="font-mono text-sm break-all font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                        {email}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigator.clipboard.writeText(email).then(() => {
                                                                                setCopiedEmail(email);
                                                                                setTimeout(() => setCopiedEmail(null), 3000);
                                                                            });
                                                                        }}
                                                                        className={`opacity-0 group-hover/copy:opacity-100 transition-all p-1.5 rounded-md ${copiedEmail === email ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                                                        title={copiedEmail === email ? 'Copied!' : 'Copy Email'}
                                                                    >
                                                                        {copiedEmail === email ? (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="col-span-3">
                                                                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(status)} ${hasPendingChange ? 'ring-2 ring-yellow-400/50' : ''}`}>
                                                                        <span className="text-xs">{getStatusIcon(status)}</span>
                                                                        <span>{status}</span>
                                                                        {hasPendingChange && <span className="text-[8px] bg-yellow-400 text-black px-1 rounded">PENDING</span>}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="col-span-4 flex justify-end">
                                                                    <div className="relative w-36 group/select">
                                                                        <select
                                                                            value={status}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                markEmailStatus(lead._id, email, e.target.value);
                                                                            }}
                                                                            className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all shadow-sm hover:shadow-md"
                                                                            style={{
                                                                                backgroundColor: 'var(--bg-secondary)',
                                                                                borderColor: 'var(--border-primary)',
                                                                                color: 'var(--text-primary)'
                                                                            }}
                                                                        >
                                                                            <option value="PENDING">Pending Check</option>
                                                                            <option value="ACTIVE">Mark Active</option>
                                                                            <option value="BOUNCED">Mark Bounced</option>
                                                                            <option value="DEAD">Mark Dead</option>
                                                                        </select>
                                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover/select:translate-x-0.5"
                                                                            style={{ color: 'var(--text-secondary)' }}>
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Footer Actions */}
                                                <div className="px-5 py-4 bg-[var(--bg-tertiary)]/10 border-t border-[var(--border-primary)] flex items-center justify-between">
                                                    <div className="flex gap-3">
                                                        {isDMLead && pendingCount > 0 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    lead.displayEmails.forEach(emailObj => {
                                                                        const email = emailObj.normalized || emailObj.value;
                                                                        if (!emailObj.status || emailObj.status.toUpperCase() === 'PENDING') {
                                                                            markEmailStatus(lead._id, email, 'ACTIVE');
                                                                        }
                                                                    });
                                                                }}
                                                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-blue-500/20"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Mark All Active
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {isDMLead && pendingCount === 0 && (
                                                            <button
                                                                onClick={() => handleDoneManual(lead._id)}
                                                                disabled={processingLeads.has(lead._id)}
                                                                className="px-5 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-indigo-600 text-white rounded-lg text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                            >
                                                                {processingLeads.has(lead._id) ? (
                                                                    <>
                                                                        <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Mark as Done
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        {isVerifierLead && (
                                                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Lead Verified (Use Process Button at Top)
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {!loading && leads.length > 0 && (totalLeads > itemsPerPage || currentPage > 1) && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 transition-all font-bold text-xs flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {totalLeads > 0 && [...Array(Math.ceil(totalLeads / itemsPerPage))].map((_, i) => {
                            const pageNum = i + 1;
                            const totalPages = Math.ceil(totalLeads / itemsPerPage);

                            if (totalPages > 7 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                                if (Math.abs(pageNum - currentPage) === 2) return <span key={pageNum} className="px-2 opacity-50">...</span>;
                                return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                                        ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20 scale-110'
                                        : 'border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={totalLeads > 0 ? currentPage >= Math.ceil(totalLeads / itemsPerPage) : leads.length < itemsPerPage}
                        className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 transition-all font-bold text-xs flex items-center gap-2"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Pagination Summary */}
            {!loading && leads.length > 0 && (
                <div className="text-center text-xs font-bold opacity-50 pb-10" style={{ color: 'var(--text-tertiary)' }}>
                    {searchTerm ? (
                        `Matched ${searchedLeads.length} of ${filteredLeads.length} leads on this page`
                    ) : totalLeads > 0 ? (
                        `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalLeads)} - ${Math.min(currentPage * itemsPerPage, totalLeads)} of ${totalLeads} leads`
                    ) : (
                        `Showing ${leads.length} leads on page ${currentPage}`
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                        <div className="p-8 text-center bg-gradient-to-b from-emerald-500/10 to-transparent">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Distribute Leads?</h3>
                            <p className="mt-2 text-sm font-medium opacity-60 px-4" style={{ color: 'var(--text-secondary)' }}>
                                You are about to move all verified leads to Lead Qualifiers. This action cannot be undone.
                            </p>
                        </div>

                        <div className="p-6 flex flex-col gap-3">
                            <button
                                onClick={handleProcessAllLeads}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                Confirm Distribution
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="w-full py-4 rounded-2xl border font-bold text-sm transition-all hover:bg-[var(--bg-tertiary)] active:scale-95"
                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-500">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500 text-white' :
                            notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                            {notification.type === 'success' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            {notification.type === 'error' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
                            {notification.type === 'info' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </div>
                        <div>
                            <p className="font-black text-sm tracking-tight">{notification.message}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">System Notification</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifierLeads;