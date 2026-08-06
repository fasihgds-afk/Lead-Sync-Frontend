import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const ICON_EMAIL = (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ICON_PHONE = (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const ICON_COPY = (
    <svg className="w-3 h-3 opacity-30 group-hover/cp:opacity-70 transition-opacity"
         fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

/* ── shared copy-to-clipboard row (used by MetaDetailModal) ───────── */
function CopyableField({ label, value, copyKey, copied, onCopy }) {
    return (
        <button
            type="button"
            onClick={() => onCopy(String(value), copyKey)}
            className="flex items-center gap-1.5 group/cp relative"
            title={`Click to copy ${label}`}
            aria-label={`Copy ${label}: ${value}`}
        >
            <span
                className="text-[11px] font-bold truncate max-w-[200px] group-hover/cp:text-white transition-colors"
                style={{ color: 'var(--text-primary)' }}
                title={value}
            >
                {value}
            </span>
            {copied ? (
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">✓</span>
            ) : (
                <span style={{ color: 'var(--text-secondary)' }}>{ICON_COPY}</span>
            )}
        </button>
    );
}

/* ── Meta Lead Detail Modal ─────────────────────────────────────── */
function MetaDetailModal({ lead, onClose }) {
    const [copied, setCopied] = useState(null);
    const copyTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    // Close on Escape for keyboard users.
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const copy = useCallback((text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
    }, []);

    const leadId = lead._id ? String(lead._id).slice(-8).toUpperCase() : '—';

    const sections = [
        { label: 'Full Name', value: lead.name || lead.fullName },
        { label: 'Program',   value: lead.program               },
        { label: 'School',    value: lead.school                },
        { label: 'Email',     value: lead.email,  copyKey: 'email'  },
        { label: 'Phone',     value: lead.number, copyKey: 'phone'  },
        { label: 'Website',   value: lead.website, isLink: true     },
        { label: 'Status',    value: lead.status                },
        { label: 'Stage',     value: lead.stage                 },
        { label: 'Assigned',  value: formatDate(lead.assignedAt || lead.createdAt) },
    ].filter(r => r.value);

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="meta-detail-title"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/8 rounded-full blur-[60px] pointer-events-none" />

                {/* header */}
                <div className="relative px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-sm">
                            {(lead.name || lead.fullName || '?').trim()[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h3 id="meta-detail-title" className="text-sm font-black uppercase tracking-tight leading-none"
                                style={{ color: 'var(--text-primary)' }}>
                                Lead Details
                            </h3>
                            <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                                META · {leadId}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* body */}
                <div className="relative px-5 py-4 space-y-1.5">
                    {sections.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/20 border border-white/[0.04] gap-3"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest shrink-0"
                                  style={{ color: 'var(--text-tertiary)' }}>
                                {row.label}
                            </span>

                            <div className="flex items-center gap-1.5 min-w-0">
                                {row.isLink ? (
                                    <a
                                        href={/^https?:\/\//i.test(row.value) ? row.value : `https://${row.value}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-bold truncate max-w-[220px] text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                                        title={row.value}
                                    >
                                        {row.value}
                                    </a>
                                ) : row.copyKey ? (
                                    <CopyableField
                                        label={row.label}
                                        value={row.value}
                                        copyKey={row.copyKey}
                                        copied={copied === row.copyKey}
                                        onCopy={copy}
                                    />
                                ) : (
                                    <span
                                        className="text-[11px] font-bold truncate max-w-[220px]"
                                        style={{ color: 'var(--text-primary)' }}
                                        title={row.value}
                                    >
                                        {row.value}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* footer */}
                <div className="px-5 pb-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── contact chip (email or phone) inside the table row ───────────── */
function ContactChip({ icon, iconBg, value, copyId, isCopied, onCopy, widthClass }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCopy(value, copyId); }}
            className={`flex items-center gap-1 group/copy relative shrink min-w-0 ${widthClass}`}
            title={`Click to copy: ${value}`}
            aria-label={`Copy: ${value}`}
        >
            <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center shrink-0 transition-all`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold tracking-tight truncate max-w-[110px] group-hover/copy:text-white transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                {value}
            </span>
            {isCopied && (
                <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase whitespace-nowrap z-10">
                    Copied!
                </span>
            )}
        </button>
    );
}

/* ── LeadRow ─────────────────────────────────────────────────────── */
const LeadRow = memo(function LeadRow({ lead, count, isMetaTab, onReject, onUpsell, onDetail, copiedId, onCopy }) {
    const [showMetaDetail, setShowMetaDetail] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const isMetaLead = lead.isMetaLead === true || lead.source === 'META_LEAD';

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // contacts
    let emails = [];
    let phones = [];
    if (isMetaLead) {
        if (lead.email)  emails = [{ value: lead.email }];
        if (lead.number) phones = [{ value: lead.number }];
    } else {
        emails = lead.responseSource?.emails?.length > 0
            ? lead.responseSource.emails
            : (lead.responseSource?.email?.value ? [{ value: lead.responseSource.email.value }] : []);
        phones = lead.responseSource?.phones?.length > 0
            ? lead.responseSource.phones
            : (lead.responseSource?.phone?.value ? [{ value: lead.responseSource.phone.value }] : []);
    }

    const firstEmail  = emails[0]?.value || null;
    const firstPhone  = phones[0]?.value || null;
    // Extra contacts beyond the first of each channel — clamp each side at 0 so an
    // empty channel (e.g. no emails at all) doesn't drag the total negative and
    // hide genuine extra phones/emails from the "+N" badge.
    const extraCount  = Math.max(0, emails.length - 1) + Math.max(0, phones.length - 1);
    const dateVal     = lead.assignedAt || lead.createdAt;
    const subtitle    = isMetaLead ? [lead.program, lead.school].filter(Boolean).join(' · ') : null;

    const openMetaDetail = useCallback(() => setShowMetaDetail(true), []);
    const closeMetaDetail = useCallback(() => setShowMetaDetail(false), []);
    const handleReject = useCallback((e) => { e.stopPropagation(); onReject(lead); }, [onReject, lead]);
    const handleUpsell = useCallback((e) => { e.stopPropagation(); onUpsell(lead); }, [onUpsell, lead]);
    const handleDetail = useCallback(() => onDetail(lead), [onDetail, lead]);

    return (
        <>
        <tr className="hover:bg-white/[0.02] transition-colors group align-middle">

            {/* Lead Entity */}
            <td className="px-4 py-2.5 w-[25%] max-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] shrink-0 group-hover:border-emerald-500/30 transition-all"
                         style={{ color: 'var(--text-tertiary)' }}>
                        {count}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold tracking-tight truncate uppercase leading-tight"
                             style={{ color: 'var(--text-primary)' }}
                             title={lead.name || lead.fullName}>
                            {lead.name || lead.fullName || '—'}
                        </div>
                        {subtitle && (
                            <div className="text-[9px] font-medium truncate leading-tight mt-0.5"
                                 style={{ color: 'var(--text-tertiary)' }}
                                 title={subtitle}>
                                {subtitle}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Contact — single row */}
            <td className={`px-4 py-2.5 ${isMetaTab ? 'w-[30%]' : 'w-[28%]'} max-w-0`}>
                <div className="flex items-center gap-2 min-w-0">
                    {firstEmail && (
                        <ContactChip
                            icon={ICON_EMAIL}
                            iconBg="bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover/copy:bg-blue-500 group-hover/copy:text-white group-hover/copy:border-blue-500"
                            value={firstEmail}
                            copyId={`email-${lead._id}`}
                            isCopied={copiedId === `email-${lead._id}`}
                            onCopy={onCopy}
                        />
                    )}
                    {firstEmail && firstPhone && <div className="w-px h-3 bg-white/10 shrink-0" />}
                    {firstPhone && (
                        <ContactChip
                            icon={ICON_PHONE}
                            iconBg="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover/copy:bg-emerald-500 group-hover/copy:text-white group-hover/copy:border-emerald-500"
                            value={firstPhone}
                            copyId={`phone-${lead._id}`}
                            isCopied={copiedId === `phone-${lead._id}`}
                            onCopy={onCopy}
                        />
                    )}
                    {extraCount > 0 && (
                        <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-tighter shrink-0">
                            +{extraCount}
                        </span>
                    )}
                    {!firstEmail && !firstPhone && (
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                </div>
            </td>

            {/* LQ Comment — normal leads only */}
            {!isMetaTab && (
                <td className="px-4 py-2.5 w-[12%] text-center">
                    <button type="button" onClick={handleDetail}
                            className="inline-flex items-center gap-1 group/detail transition-all">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/detail:bg-blue-500 group-hover/detail:text-white transition-all shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-[8px] font-black group-hover/detail:text-blue-400 uppercase tracking-tighter transition-colors"
                              style={{ color: 'var(--text-tertiary)' }}>
                            Details
                        </span>
                    </button>
                </td>
            )}

            {/* Meta Detail button — meta leads only */}
            {isMetaTab && (
                <td className="px-4 py-2.5 w-[10%] text-center">
                    <button type="button" onClick={openMetaDetail}
                            className="inline-flex items-center gap-1 group/md transition-all">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover/md:bg-violet-500 group-hover/md:text-white transition-all shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <span className="text-[8px] font-black group-hover/md:text-violet-400 uppercase tracking-tighter transition-colors"
                              style={{ color: 'var(--text-tertiary)' }}>
                            View
                        </span>
                    </button>
                </td>
            )}

            {/* Assigned date */}
            <td className="px-4 py-2.5 w-[15%] whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_6px_rgba(16,185,129,0.3)] shrink-0" />
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-tight leading-tight"
                             style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(dateVal)}
                        </div>
                        <div className="text-[9px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
                            {formatTime(dateVal)}
                        </div>
                    </div>
                </div>
            </td>

            {/* Actions */}
            <td className="px-4 py-2.5 w-[23%]">
                <div className="flex items-center justify-end gap-2">
                    {/* Primary: Upsell button */}
                    <button type="button" onClick={handleUpsell}
                            disabled={lead.rejectionRequested}
                            className={`px-3 h-7 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                                lead.rejectionRequested
                                    ? 'bg-slate-500/5 border-white/5 text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500 border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white active:scale-95'
                            }`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Upsell</span>
                    </button>

                    {/* 3-dot overflow menu — only for Normal Leads, contains Reject */}
                    {!isMetaTab && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setShowMenu(prev => !prev)}
                                title="More actions"
                                className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-slate-500 hover:text-slate-300"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[120px] bg-[var(--bg-secondary)] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                                    <button
                                        type="button"
                                        onClick={() => { setShowMenu(false); handleReject(); }}
                                        disabled={lead.rejectionRequested}
                                        className={`w-full px-3 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                                            lead.rejectionRequested
                                                ? 'text-slate-600 cursor-not-allowed bg-transparent'
                                                : 'text-rose-400 hover:bg-rose-500/10'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {lead.rejectionRequested ? 'Rejected' : 'Reject'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </td>
        </tr>

        {showMetaDetail && (
            <MetaDetailModal lead={lead} onClose={closeMetaDetail} />
        )}
        </>
    );
});

export default LeadRow;