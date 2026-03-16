import React from 'react';

const RejectModal = ({ isOpen, lead, onClose, onConfirm, rejectData, setRejectData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-[2px]">
            <div className="relative w-full max-w-xs overflow-hidden flex flex-col">
                <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header - Compact */}
                    <div className="p-3 border-b border-white/5 bg-[var(--bg-secondary)] shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-inner shrink-0">
                                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs font-black text-rose-500 uppercase tracking-tight truncate">Reject Lead</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{lead?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Body - Dense */}
                    <div className="p-3.5 space-y-3 bg-black/5">
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-1.5 px-0.5">Reason for Rejection</label>
                            <textarea
                                value={rejectData.comment}
                                onChange={(e) => setRejectData({ ...rejectData, comment: e.target.value })}
                                placeholder="State clearly why you are rejecting this lead..."
                                className="w-full bg-[var(--bg-tertiary)]/40 border-[1.5px] border-white/5 rounded-lg p-2.5 h-20 text-[10px] text-slate-200 font-bold placeholder:text-slate-700 focus:outline-none focus:border-rose-500/40 transition-all resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Footer - Mini */}
                    <div className="p-3 bg-[var(--bg-secondary)] border-t border-white/5 flex gap-2 shrink-0">
                        <button
                            onClick={onClose}
                            className="flex-1 py-1.5 bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)]/60 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 transition-all outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-[1.5] py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-rose-900/10 transition-all active:scale-[0.97]"
                        >
                            Confirm Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;