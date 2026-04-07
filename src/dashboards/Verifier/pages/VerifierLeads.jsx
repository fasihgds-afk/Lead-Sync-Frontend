import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dataMinorAPI from '../../../api/data-minor';
import LeadCard from '../components/LeadCard';
import ConfirmModal from '../components/ConfirmModal';
import { Toast, VALID_STATUSES } from '../components/VerifierUI';


// ── Cookie helpers ──────────────────────────────────────────────────────────
const getCookie = (name) => {
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    if (parts.length !== 2) return null;
    try { return JSON.parse(decodeURIComponent(parts.pop().split(';').shift())); }
    catch { return null; }
};
const setCookie = (name, value, days = 7) => {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${exp}; path=/`;
};
const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

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
    const [showConfirm, setShowConfirm] = useState(false);
    const initialLoadDone = useRef(false);

    const notify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    // Cookie sync
    useEffect(() => {
        const saved = getCookie('verifier_email_changes');
        if (saved) setPendingChanges(saved);
    }, []);

    useEffect(() => {
        Object.keys(pendingChanges).length > 0
            ? setCookie('verifier_email_changes', pendingChanges)
            : deleteCookie('verifier_email_changes');
    }, [pendingChanges]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch a larger batch for frontend searching if needed, 
            // or just use the default.
            const res = await dataMinorAPI.getVerifierLeads(100, 0);
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
            const emailMatch = (lead.emails ?? []).some((e) => {
                const val = (e.normalized || e.value || '').toLowerCase();
                return val.includes(lowSearch);
            });
            const linkedinMatch = lead.linkedinUrl?.toLowerCase().includes(lowSearch);
            
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
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleCopy = useCallback((email) => {
        navigator.clipboard.writeText(email).then(() => {
            setCopiedEmail(email);
            setTimeout(() => setCopiedEmail(null), 3000);
        });
    }, []);

    const copyAllEmails = useCallback(async () => {
        const all = filteredLeads.flatMap((l) =>
            (l.emails ?? []).map((e) => e.normalized || e.value).filter(Boolean)
        );
        if (!all.length) { notify('No emails on this page.', 'info'); return; }
        await navigator.clipboard.writeText(all.join('\n'));
        notify(`Copied ${all.length} emails!`);
    }, [filteredLeads, notify]);

    const changeEmailStatus = useCallback((leadId, email, status) => {
        setLeads((prev) =>
            prev.map((l) =>
                l._id !== leadId ? l : {
                    ...l,
                    emails: (l.emails ?? []).map((e) =>
                        (e.normalized || e.value) === email ? { ...e, status } : e
                    ),
                }
            )
        );
        setPendingChanges((prev) => ({
            ...prev,
            [leadId]: { ...(prev[leadId] ?? {}), [email]: status },
        }));
    }, []);

    const markAllActive = useCallback((leadId) => {
        const lead = leads.find((l) => l._id === leadId);
        if (!lead) return;
        (lead.emails ?? []).forEach((e) => {
            const norm = e.normalized || e.value;
            if (!norm) return;
            if ((e.status || 'PENDING').toUpperCase() === 'PENDING') {
                changeEmailStatus(leadId, norm, 'ACTIVE');
            }
        });
    }, [leads, changeEmailStatus]);

    const markAllLeadsActive = useCallback(() => {
        let count = 0;
        const nextPending = { ...pendingChanges };
        const filteredIds = new Set(filteredLeads.map(l => l._id));

        const nextLeads = leads.map((lead) => {
            if (!filteredIds.has(lead._id)) return lead;

            const leadPending = { ...(nextPending[lead._id] ?? {}) };
            let modified = false;

            const nextEmails = (lead.emails ?? []).map((e) => {
                const norm = e.normalized || e.value;
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

    const handleDone = useCallback(async (leadId) => {
        const lead = leads.find((l) => l._id === leadId);
        if (!lead) return;

        const emailsPayload = (lead.emails ?? []).map((e) => {
            const norm = e.normalized || e.value;
            const overrideStatus = pendingChanges[leadId]?.[norm];
            const status = (overrideStatus || e.status || '').toUpperCase();
            return { normalized: norm, status };
        });

        const stillPending = emailsPayload.some((ep) => !VALID_STATUSES.includes(ep.status));
        if (stillPending) {
            notify('Please set a status for all emails first.', 'error');
            return;
        }

        setProcessingLeads((prev) => new Set([...prev, leadId]));
        try {
            await dataMinorAPI.updateLeadAllEmails(leadId, emailsPayload);
            setPendingChanges((prev) => {
                const next = { ...prev };
                delete next[leadId];
                return next;
            });
            setLeads((prev) =>
                prev.map((l) => l._id === leadId ? { ...l, stage: 'Verifier' } : l)
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
    }, [leads, pendingChanges, notify, fetchLeads]);

    const handleMoveToLQ = async () => {
        setIsMoving(true);
        setShowConfirm(false);
        try {
            const res = await dataMinorAPI.moveVerifierLeadsToLQ();
            if (res.success) {
                notify(res.message || 'Leads moved to LQ!');
                fetchLeads();
            }
        } catch (err) {
            notify(err.response?.data?.message || 'Failed to move leads.', 'error');
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="flex flex-col items-center justify-center text-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Verifier Leads</h1>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>
                        Review and verify submitted leads
                    </p>
                    {leads.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black shadow-lg"
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {filteredLeads.length.toLocaleString()} Leads {searchTerm && `Found (of ${leads.length})`}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-3 rounded-2xl border shadow-md w-full max-w-5xl"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                    {/* Mark All Active (Global) */}
                    <button onClick={markAllLeadsActive}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                        Mark All Leads Active
                    </button>

                    <div className="w-px h-8 opacity-20" style={{ backgroundColor: 'var(--border-primary)' }} />

                    <button onClick={copyAllEmails}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy ({totalEmailsOnPage})
                    </button>
                    <div className="w-px h-8 opacity-20" style={{ backgroundColor: 'var(--border-primary)' }} />
                    <div className="relative">
                        <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search email…"
                            className="pl-9 pr-8 py-2.5 w-64 rounded-xl border text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 transition-all font-mono"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-500/10 text-gray-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button onClick={() => fetchLeads()} disabled={loading}
                        className="p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-all"
                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1">
                <button onClick={() => setShowConfirm(true)} disabled={isMoving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all border border-emerald-400/20">
                    {isMoving
                        ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                    Move Verified Leads to LQ
                </button>
            </div>

            <div className={`space-y-4 transition-all duration-300 ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
                {loading && leads.length === 0 ? (
                    <div className="p-20 flex flex-col items-center gap-4 opacity-60">
                        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent-primary)' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Loading leads…</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="p-20 text-center opacity-60 flex flex-col items-center rounded-3xl border border-dashed"
                        style={{ borderColor: 'var(--border-primary)' }}>
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
                        />
                    ))
                )}
            </div>

            <ConfirmModal
                show={showConfirm}
                onConfirm={handleMoveToLQ}
                onCancel={() => setShowConfirm(false)}
                isMoving={isMoving}
            />

            <Toast notification={notification} onClose={() => setNotification(null)} />
        </div>
    );
};

export default VerifierLeads;
