import React from 'react';

const LeadRow = ({ lead, count, onReject, onUpsell, onDetail, copiedId, onCopy }) => {
    return (
        <tr className="hover:bg-[var(--bg-tertiary)]/5 transition-colors group">
            {/* Lead Info */}
            <td className="px-4 py-3 w-[15%]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] shrink-0 shadow-inner group-hover:border-emerald-500/30 transition-all" style={{ color: 'var(--text-tertiary)' }}>
                        {count}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold tracking-tight truncate uppercase" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                    </div>
                </div>
            </td>

            {/* Contact Info - Using responseSource only */}
            <td className="px-4 py-3 w-[25%]">
                <div className="space-y-1.5">
                    {(() => {
                        const emails = lead.responseSource?.emails?.length > 0 
                            ? lead.responseSource.emails 
                            : (lead.responseSource?.email?.value ? [{ value: lead.responseSource.email.value }] : []);
                        
                        const phones = lead.responseSource?.phones?.length > 0 
                            ? lead.responseSource.phones 
                            : (lead.responseSource?.phone?.value ? [{ value: lead.responseSource.phone.value }] : []);

                        const allContacts = [
                            ...emails.map(e => ({ ...e, type: 'email' })),
                            ...phones.map(p => ({ ...p, type: 'phone' }))
                        ];

                        const visibleContacts = allContacts.slice(0, 2);
                        const remainingCount = allContacts.length - 2;

                        return (
                            <>
                                {visibleContacts.map((contact, i) => (
                                    <div
                                        key={`${contact.type}-${i}`}
                                        onClick={() => onCopy(contact.value, `${contact.type}-${lead._id}-${i}`)}
                                        className="flex items-center gap-2 cursor-pointer group/copy relative w-fit"
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all group-hover/copy:text-white ${
                                            contact.type === 'email' 
                                            ? 'bg-blue-500/10 border-blue-500/20 group-hover/copy:bg-blue-500 group-hover/copy:border-blue-500' 
                                            : 'bg-emerald-500/10 border-emerald-500/20 group-hover/copy:bg-emerald-500 group-hover/copy:border-emerald-500'
                                        }`}>
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {contact.type === 'email' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                )}
                                            </svg>
                                        </div>
                                        <span className="text-[11px] font-bold group-hover/copy:text-white transition-colors tracking-tight" style={{ color: 'var(--text-secondary)' }}>{contact.value}</span>
                                        {copiedId === `${contact.type}-${lead._id}-${i}` && (
                                            <div className="absolute -right-12 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 shadow-lg shadow-emerald-500/20">Copied</div>
                                        )}
                                    </div>
                                ))}
                                {remainingCount > 0 && (
                                    <div className="pt-1">
                                        <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-tighter shadow-sm">
                                            +{remainingCount} more
                                        </span>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </td>

            <td className="px-4 py-3 w-[15%] text-center">
                <button
                    onClick={() => onDetail(lead)}
                    className="inline-flex items-center gap-1.5 group/detail transition-all"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-md group-hover/detail:bg-blue-500 group-hover/detail:text-white group-hover/detail:border-blue-500 transition-all shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-[8px] font-black group-hover/detail:text-blue-400 uppercase tracking-tighter transition-colors" style={{ color: 'var(--text-tertiary)' }}>Details</span>
                </button>
            </td>

            {/* Assigned Date - Improved Style with Time */}
            <td className="px-4 py-3 w-[15%]">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(lead.assignedAt || lead.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                        <span className="text-[9px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(lead.assignedAt || lead.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
            </td>


            {/* Actions */}
            <td className="px-4 py-3 w-[30%]">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onReject(lead)}
                        disabled={lead.rejectionRequested}
                        className={`px-3 h-8 rounded-lg border transition-all flex items-center gap-1.5 shadow-md ${lead.rejectionRequested
                            ? 'bg-slate-500/5 border-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-rose-500/5 hover:bg-rose-500 border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white active:scale-95'
                            }`}
                        title="Request Rejection"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Reject</span>
                    </button>

                    <button
                        onClick={() => onUpsell(lead)}
                        disabled={lead.rejectionRequested}
                        className={`px-4 h-8 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md ${lead.rejectionRequested
                            ? 'bg-slate-500/5 border-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500/10 hover:bg-emerald-500 border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white active:scale-95'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Upsell</span>
                    </button>
                </div>
            </td>

        </tr>
    );
};

export default LeadRow;