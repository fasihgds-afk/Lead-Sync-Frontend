import React from 'react';
import { VALID_STATUSES, getStatusStyle, getStatusIcon } from './VerifierUI';

// Helper: highlight matching portion of text
const HighlightText = ({ text, search }) => {
    if (!search || !text) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-amber-500/30 text-[var(--accent-primary)] rounded px-0.5 font-bold">
                {text.slice(idx, idx + search.length)}
            </mark>
            {text.slice(idx + search.length)}
        </span>
    );
};

export const EmailRow = React.memo(({ email, status, hasPending, onChangeStatus, copiedEmail, onCopy, searchTerm }) => {
    const norm = email;
    const upperStatus = (status || 'PENDING').toUpperCase();
    const isMatch = searchTerm && norm.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <div className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-all duration-300 relative
            ${isMatch 
                ? 'bg-amber-500/10 ring-1 ring-amber-500/30 z-10' 
                : 'hover:bg-[var(--bg-tertiary)]/20'}`}>
            <div className="col-span-5 flex items-center gap-2 group/copy">
                <span className="font-mono text-sm break-all font-medium" style={{ color: 'var(--text-primary)' }}>
                    <HighlightText text={norm} search={searchTerm} />
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(norm); }}
                    className={`opacity-0 group-hover/copy:opacity-100 transition-all p-1.5 rounded-md
            ${copiedEmail === norm ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    title={copiedEmail === norm ? 'Copied!' : 'Copy email'}
                >
                    {copiedEmail === norm
                        ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    }
                </button>
            </div>

            <div className="col-span-3 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider
          ${getStatusStyle(upperStatus)} ${hasPending ? 'ring-2 ring-amber-400/40' : ''}`}>
                    <span>{getStatusIcon(upperStatus)}</span>
                    <span>{upperStatus}</span>
                </span>
            </div>

            <div className="col-span-4 flex justify-center">
                <div className="relative group/sel w-36">
                    <select
                        value={upperStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); onChangeStatus(norm, e.target.value); }}
                        className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all shadow-sm hover:shadow-md"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    >
                        <option value="PENDING" disabled>Select Status</option>
                        {VALID_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
});

const LeadEmailTable = React.memo(({
    lead, pendingChanges, processingLeads,
    copiedEmail, onCopy, onChangeStatus, onMarkAllActive, onDone, searchTerm,
}) => {
    const emails = lead.emails ?? [];
    const isVerified = (lead.stage || 'DM').toUpperCase() === 'VERIFIER';

    const pendingCount = emails.filter((e) => {
        const norm = e.normalized || e.value;
        if (!norm) return false;
        const s = (pendingChanges[norm] || e.status || 'PENDING').toUpperCase();
        return s === 'PENDING';
    }).length;

    const allResolved = pendingCount === 0 && emails.length > 0;

    return (
        <div className="animate-in slide-in-from-top-2 duration-300 px-6 pb-6 pt-2">
            <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase font-black tracking-widest text-center"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                    <div className="col-span-5">Email Address</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-4">Verification</div>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                    {emails.map((emailObj, idx) => {
                        const norm = emailObj.normalized || emailObj.value;
                        const baseStatus = (emailObj.status || 'PENDING').toUpperCase();
                        const overrideStatus = pendingChanges[norm]?.toUpperCase();
                        const displayStatus = overrideStatus || baseStatus;

                        return (
                            <EmailRow
                                key={`${lead._id}-${idx}`}
                                email={norm}
                                status={displayStatus}
                                hasPending={!!overrideStatus && overrideStatus !== baseStatus}
                                onChangeStatus={(e, s) => onChangeStatus(lead._id, e, s)}
                                copiedEmail={copiedEmail}
                                onCopy={onCopy}
                                searchTerm={searchTerm}
                            />
                        );
                    })}
                </div>

                <div className="px-5 py-4 border-t flex items-center justify-between"
                    style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>

                    <div>
                        {!isVerified && pendingCount > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkAllActive(lead._id); }}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-blue-500/20"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Mark All Active
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {isVerified ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Lead Verified
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDone(lead._id); }}
                                disabled={processingLeads.has(lead._id) || !allResolved}
                                title={!allResolved ? `${pendingCount} email(s) still need a status` : 'Submit all email statuses'}
                                className={`px-5 py-2 rounded-lg text-xs font-black shadow-lg transition-all flex items-center gap-2
                  ${!allResolved
                                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/30 shadow-none'
                                        : 'bg-gradient-to-r from-[var(--accent-primary)] to-indigo-600 text-white shadow-indigo-500/20 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {processingLeads.has(lead._id)
                                    ? <><div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" /> Processing…</>
                                    : <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {!allResolved ? `${pendingCount} Pending` : 'Update Lead Status'}
                                    </>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default LeadEmailTable;
