import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dataMinorAPI from '../../../api/data-minor';
import LeadCard from '../components/LeadCard';
import { Toast, VALID_STATUSES } from '../components/VerifierUI';

// ── SessionStorage helpers ──────────────────────────────────────────────────
const getSession = (name) => {
    try {
        const raw = sessionStorage.getItem(name);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const setSession = (name, value) => {
    sessionStorage.setItem(name, JSON.stringify(value));
};

const removeSession = (name) => {
    sessionStorage.removeItem(name);
};

// ── Constants ────────────────────────────────────────────────────────────────
const LEADS_PAGE_SIZE = 100;
const NOTIFICATION_DURATION_MS = 4000;
const COPY_FEEDBACK_DURATION_MS = 3000;
const COOKIE_NAME = 'verifier_email_changes';

const getEmailValue = (email) => email.normalized || email.value || '';

const VerifierLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingChanges, setPendingChanges] = useState({});
    const [processingLeads, setProcessingLeads] = useState(() => new Set());
    const [copiedEmail, setCopiedEmail] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [numLeadsToMove, setNumLeadsToMove] = useState('');
    const [modalError, setModalError] = useState(null);
    const [verifierCounts, setVerifierCounts] = useState({ totalVerifierStageLeads: 0, myMovableVerifierLeads: 0 });
    const [loadingCounts, setLoadingCounts] = useState(false);
    const initialLoadDone = useRef(false);

    const notify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), NOTIFICATION_DURATION_MS);
    }, []);

    const fetchCounts = useCallback(async () => {
        setLoadingCounts(true);
        try {
            const res = await dataMinorAPI.getVerifierLeadsCount();
            if (res.success) {
                setVerifierCounts({
                    totalVerifierStageLeads: res.totalVerifierStageLeads || 0,
                    myMovableVerifierLeads: res.myMovableVerifierLeads || 0
                });
            }
        } catch (err) {
            console.error('Failed to load verifier counts', err);
        } finally {
            setLoadingCounts(false);
        }
    }, []);

    // SessionStorage sync: load pending changes once on mount
    useEffect(() => {
        const saved = getSession(COOKIE_NAME);
        if (saved) setPendingChanges(saved);
    }, []);

    // SessionStorage sync: persist pending changes whenever they change
    useEffect(() => {
        if (Object.keys(pendingChanges).length > 0) {
            setSession(COOKIE_NAME, pendingChanges);
        } else {
            removeSession(COOKIE_NAME);
        }
    }, [pendingChanges]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dataMinorAPI.getVerifierLeads(LEADS_PAGE_SIZE, 0);
            if (res.success) setLeads(res.leads || []);
        } catch (err) {
            notify(err.response?.data?.message || 'Failed to load leads', 'error');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            fetchLeads();
        }
    }, [fetchLeads]);

    // Frontend filter logic
    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;
        const lowSearch = searchTerm.toLowerCase().trim();

        return leads.filter((lead) => {
            const companyMatch = lead.companyName?.toLowerCase().includes(lowSearch);
            const personMatch = lead.personName?.toLowerCase().includes(lowSearch);
            const websiteMatch = lead.website?.toLowerCase().includes(lowSearch);
            const linkedinMatch = lead.linkedinUrl?.toLowerCase().includes(lowSearch);
            const emailMatch = (lead.emails ?? []).some((e) =>
                getEmailValue(e).toLowerCase().includes(lowSearch)
            );

            return companyMatch || personMatch || websiteMatch || emailMatch || linkedinMatch;
        });
    }, [leads, searchTerm]);

    const totalEmailsOnPage = useMemo(
        () => filteredLeads.reduce((n, l) => n + (l.emails?.length ?? 0), 0),
        [filteredLeads]
    );

    const toggleExpand = useCallback((id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleCopy = useCallback((email) => {
        navigator.clipboard.writeText(email).then(() => {
            setCopiedEmail(email);
            setTimeout(() => setCopiedEmail(null), COPY_FEEDBACK_DURATION_MS);
        });
    }, []);

    const copyAllEmails = useCallback(async () => {
        const all = filteredLeads.flatMap((l) =>
            (l.emails ?? []).map(getEmailValue).filter(Boolean)
        );
        if (!all.length) {
            notify('No emails on this page.', 'info');
            return;
        }
        await navigator.clipboard.writeText(all.join('\n'));
        notify(`Copied ${all.length} emails!`);
    }, [filteredLeads, notify]);

    const changeEmailStatus = useCallback((leadId, email, status) => {
        setLeads((prev) =>
            prev.map((l) =>
                l._id !== leadId
                    ? l
                    : {
                        ...l,
                        emails: (l.emails ?? []).map((e) =>
                            getEmailValue(e) === email ? { ...e, status } : e
                        ),
                    }
            )
        );
        setPendingChanges((prev) => ({
            ...prev,
            [leadId]: { ...(prev[leadId] ?? {}), [email]: status },
        }));
    }, []);

    const markAllActive = useCallback(
        (leadId) => {
            const lead = leads.find((l) => l._id === leadId);
            if (!lead) return;

            (lead.emails ?? []).forEach((e) => {
                const norm = getEmailValue(e);
                if (!norm) return;
                if ((e.status || 'PENDING').toUpperCase() === 'PENDING') {
                    changeEmailStatus(leadId, norm, 'ACTIVE');
                }
            });
        },
        [leads, changeEmailStatus]
    );

    const markAllLeadsActive = useCallback(() => {
        let count = 0;
        const nextPending = { ...pendingChanges };
        const filteredIds = new Set(filteredLeads.map((l) => l._id));

        const nextLeads = leads.map((lead) => {
            if (!filteredIds.has(lead._id)) return lead;

            const leadPending = { ...(nextPending[lead._id] ?? {}) };
            let modified = false;

            const nextEmails = (lead.emails ?? []).map((e) => {
                const norm = getEmailValue(e);
                if (!norm) return e;
                const currentStatus = (leadPending[norm] || e.status || 'PENDING').toUpperCase();

                if (currentStatus === 'PENDING') {
                    leadPending[norm] = 'ACTIVE';
                    modified = true;
                    count++;
                    return { ...e, status: 'ACTIVE' };
                }
                return e;
            });

            if (modified) {
                nextPending[lead._id] = leadPending;
                return { ...lead, emails: nextEmails };
            }
            return lead;
        });

        if (count > 0) {
            setLeads(nextLeads);
            setPendingChanges(nextPending);
            notify(`Marked ${count} emails as ACTIVE across ${searchTerm ? 'filtered' : 'all'} leads!`);
        } else {
            notify('No pending emails found in the current view.', 'info');
        }
    }, [leads, filteredLeads, pendingChanges, notify, searchTerm]);

    const handleDone = useCallback(
        async (leadId) => {
            const lead = leads.find((l) => l._id === leadId);
            if (!lead) return;

            const emailsPayload = (lead.emails ?? []).map((e) => {
                const norm = getEmailValue(e);
                const overrideStatus = pendingChanges[leadId]?.[norm];
                const status = (overrideStatus || e.status || '').toUpperCase();
                return { normalized: norm, status };
            });

            const stillPending = emailsPayload.some((ep) => !VALID_STATUSES.includes(ep.status));
            if (stillPending) {
                notify('Please set a status for all emails first.', 'error');
                return;
            }

            setProcessingLeads((prev) => new Set(prev).add(leadId));
            try {
                await dataMinorAPI.updateLeadAllEmails(leadId, emailsPayload);
                setPendingChanges((prev) => {
                    const next = { ...prev };
                    delete next[leadId];
                    return next;
                });
                setLeads((prev) =>
                    prev.map((l) => (l._id === leadId ? { ...l, stage: 'Verifier' } : l))
                );
                notify('Lead verified & moved to Verifier stage!');
                fetchLeads();
            } catch (err) {
                notify(err.response?.data?.message || 'Failed to update lead.', 'error');
            } finally {
                setProcessingLeads((prev) => {
                    const next = new Set(prev);
                    next.delete(leadId);
                    return next;
                });
            }
        },
        [leads, pendingChanges, notify, fetchLeads]
    );

    const handleMoveToLQ = useCallback(async () => {
        const amount = parseInt(numLeadsToMove, 10);
        if (!numLeadsToMove || isNaN(amount) || amount <= 0) {
            setModalError('Please enter a valid number of leads to move.');
            return;
        }
        setIsMoving(true);
        setModalError(null);
        try {
            const res = await dataMinorAPI.moveVerifierLeadsToLQ(amount);
            if (res.success) {
                notify(res.message || `${amount} leads moved to LQ!`);
                setShowMoveModal(false);
                setNumLeadsToMove('');
                fetchLeads();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to move leads.';
            setModalError(errorMsg);
        } finally {
            setIsMoving(false);
        }
    }, [numLeadsToMove, notify, fetchLeads]);

    return (
        <div
            className="p-4 sm:p-6 md:p-8 space-y-6 min-h-screen"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
            {/* Sleek Enterprise Header */}
            <div className="flex flex-col gap-4 pb-5 border-b border-[var(--border-primary)]">
                {/* Title row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="w-24" /> {/* spacer to balance the right button */}
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Verifier Leads
                        </h1>
                        <p className="text-xs mt-0.5 opacity-60 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                            Review, verify, and seamlessly distribute leads to Lead Qualifiers.
                        </p>
                    </div>
                    <button
                        onClick={() => fetchLeads()}
                        disabled={loading}
                        className="px-3.5 py-2.5 rounded-xl border flex items-center gap-2 hover:bg-[var(--bg-secondary)] active:scale-95 disabled:opacity-50 transition-all shadow-sm shrink-0 font-bold text-xs uppercase tracking-wider"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Centered Move button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            setModalError(null);
                            setShowMoveModal(true);
                            fetchCounts();
                        }}
                        disabled={isMoving}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all border border-emerald-500/20 flex items-center gap-2"
                    >
                        {isMoving ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        Move Verified Leads to LQ
                    </button>
                </div>
            </div>



            {/* Sleek Tool Action Control Bar */}
            <div
                className="flex items-center gap-3 p-3 rounded-2xl border shadow-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
                {/* Search Field */}
                <div className="relative flex-1 min-w-0">
                    <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search emails, company, person…"
                        className="pl-10 pr-9 py-2.5 w-full rounded-xl border text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-mono"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-500/10 text-gray-400"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <button
                    onClick={markAllLeadsActive}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-700/10 hover:from-emerald-600/20 hover:to-teal-700/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 hover:scale-[1.01] active:scale-98 transition-all shrink-0 whitespace-nowrap"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                    Mark All Active
                </button>

                <button
                    onClick={copyAllEmails}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-700/10 hover:from-blue-600/20 hover:to-indigo-700/20 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 hover:scale-[1.01] active:scale-98 transition-all shrink-0 whitespace-nowrap"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy ({totalEmailsOnPage})
                </button>
            </div>

            <div className={`space-y-4 transition-all duration-300 ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
                {loading && leads.length === 0 ? (
                    <div className="p-20 flex flex-col items-center gap-4 opacity-60">
                        <div
                            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent-primary)' }}
                        />
                        <p style={{ color: 'var(--text-secondary)' }}>Loading leads…</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div
                        className="p-20 text-center opacity-60 flex flex-col items-center rounded-3xl border border-dashed"
                        style={{ borderColor: 'var(--border-primary)' }}
                    >
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {searchTerm ? `No leads match "${searchTerm}"` : 'No leads found for verification'}
                        </p>
                    </div>
                ) : (
                    filteredLeads.map((lead, i) => (
                        <LeadCard
                            key={lead._id}
                            lead={lead}
                            index={i}
                            globalIndex={i + 1}
                            isExpanded={expandedIds.has(lead._id)}
                            onToggle={toggleExpand}
                            pendingChanges={pendingChanges}
                            processingLeads={processingLeads}
                            copiedEmail={copiedEmail}
                            onCopy={handleCopy}
                            onChangeStatus={changeEmailStatus}
                            onMarkAllActive={markAllActive}
                            onDone={handleDone}
                            searchTerm={searchTerm}
                        />
                    ))
                )}
            </div>

            {showMoveModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            if (!isMoving) {
                                setShowMoveModal(false);
                                setNumLeadsToMove('');
                                setModalError(null);
                            }
                        }}
                    />

                    {/* Modal container */}
                    <div
                        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 animate-in zoom-in-95"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-primary)'
                        }}
                    >
                        {/* Header Banner */}
                        <div className="pt-5 px-6 pb-2 text-center bg-gradient-to-b from-emerald-500/10 to-transparent">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Move Leads to LQ
                            </h3>
                            <p className="mt-1 text-xs opacity-75 px-4" style={{ color: 'var(--text-secondary)' }}>
                                Distribute verified leads to Lead Qualifiers (Live Sync)
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6 space-y-4">
                            {/* Total Leads Stat */}
                            <div
                                className="p-3 rounded-xl border flex items-center justify-between"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border-primary)'
                                }}
                            >
                                <span className="text-xs font-semibold opacity-85" style={{ color: 'var(--text-primary)' }}>
                                    Total Verified Leads
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 font-mono font-black text-sm min-w-[2.5rem] text-center inline-flex items-center justify-center">
                                    {loadingCounts ? (
                                        <div className="w-3 h-3 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                    ) : (
                                        verifierCounts.totalVerifierStageLeads
                                    )}
                                </span>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                    Number of Leads to Move
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={verifierCounts.totalVerifierStageLeads}
                                    value={numLeadsToMove}
                                    onChange={(e) => {
                                        setNumLeadsToMove(e.target.value);
                                        if (modalError) setModalError(null);
                                    }}
                                    placeholder="Enter quantity (e.g. 50)"
                                    className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all font-mono"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-primary)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            {/* Inline Error Message */}
                            {modalError && (
                                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{modalError}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-2 pt-1">
                                <button
                                    onClick={handleMoveToLQ}
                                    disabled={isMoving}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isMoving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )}
                                    Move Leads
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isMoving) {
                                            setShowMoveModal(false);
                                            setNumLeadsToMove('');
                                            setModalError(null);
                                        }
                                    }}
                                    disabled={isMoving}
                                    className="w-full py-2.5 rounded-xl border font-bold text-xs hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all disabled:opacity-50"
                                    style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast notification={notification} onClose={() => setNotification(null)} />
        </div>
    );
};

export default VerifierLeads;