import React, { memo } from 'react';

const ContactDetailsModal = memo(({
    isOpen,
    onClose,
    selectedLead,
    onCopy,
    copiedId
}) => {
    if (!isOpen || !selectedLead) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[80vh] shadow-[0_32px_128px_rgba(0,0,0,0.6)] overflow-hidden animate-slideUp flex flex-col my-auto md:my-10">
                <div className="p-4 pb-3 border-b border-white/5 relative bg-[var(--bg-tertiary)]/20 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-[var(--text-tertiary)]"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary)]/60 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-[var(--accent-primary)]/30">
                            {selectedLead.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="pr-10">
                            <h3 className="text-lg font-black text-[var(--text-primary)] leading-tight truncate">{selectedLead.name}</h3>
                            <div className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase mt-1">📍 {selectedLead.location || 'GLOBAL REACH'}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Emails */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <button
                                onClick={() => {
                                    const allEmails = (selectedLead.emails || []).map(e => e.value).join(', ');
                                    if (allEmails) onCopy(allEmails, 'modal-all-emails');
                                }}
                                className="flex items-center gap-2 group/header hover:opacity-80 transition-all"
                            >
                                <div className="p-1 rounded bg-blue-500/10 text-blue-500 group-hover/header:bg-blue-500 group-hover/header:text-white transition-all">
                                    {copiedId === 'modal-all-emails' ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                    {copiedId === 'modal-all-emails' ? 'Emails Copied!' : 'Emails'}
                                </span>
                            </button>
                            <span className="text-[8px] font-black text-blue-400 opacity-60">{selectedLead.emails?.length || 0} TOTAL</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {selectedLead.emails?.map((email, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)]/50 group/item hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${email.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} />
                                        <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">{email.value}</span>
                                    </div>
                                    <button onClick={() => onCopy(email.value, `email-${idx}`)} className="p-1 rounded hover:bg-blue-500/10 text-[var(--text-tertiary)] hover:text-blue-500 transition-all">
                                        {copiedId === `email-${idx}` ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phones */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <button
                                onClick={() => {
                                    const allPhones = (selectedLead.phones || []).join(', ');
                                    if (allPhones) onCopy(allPhones, 'modal-all-phones');
                                }}
                                className="flex items-center gap-2 group/header hover:opacity-80 transition-all"
                            >
                                <div className="p-1 rounded bg-emerald-500/10 text-emerald-500 group-hover/header:bg-emerald-500 group-hover/header:text-white transition-all">
                                    {copiedId === 'modal-all-phones' ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                    {copiedId === 'modal-all-phones' ? 'Phones Copied!' : 'Numbers'}
                                </span>
                            </button>
                            <span className="text-[8px] font-black text-emerald-400 opacity-60">{selectedLead.phones?.length || 0} TOTAL</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {selectedLead.phones?.map((phone, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)]/50 group/item hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[11px] font-bold text-[var(--text-primary)]">{phone}</span>
                                    </div>
                                    <button onClick={() => onCopy(phone, `phone-${idx}`)} className="p-1 rounded hover:bg-emerald-500/10 text-[var(--text-tertiary)] hover:text-emerald-500 transition-all">
                                        {copiedId === `phone-${idx}` ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-tertiary)]/20 border-t border-white/5 flex items-center justify-between flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ContactDetailsModal;
