import React from 'react';

const LeadDetailModal = ({ isOpen, lead, onClose }) => {
    if (!isOpen || !lead) return null;

    const lqComments = lead.comments?.filter(c => c.createdByRole === 'Lead Qualifiers')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                {/* Header */}
                <div className="relative p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                            <span className="text-lg font-black text-emerald-500">
                                {lead.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{lead.name}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                LQ Feedback History
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar relative">
                    <div className="space-y-3">
                        {lqComments.length > 0 ? (
                            lqComments.map((comment, idx) => (
                                <div key={idx} className="p-4 rounded-3xl bg-black/40 border border-white/5 relative overflow-hidden group/feedback">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-[10px] text-blue-500 font-bold">
                                                {comment.createdBy?.name?.charAt(0) || 'L'}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">
                                                {comment.createdBy?.name || 'Lead Qualifier'}
                                            </span>
                                        </div>
                                        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                            {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-300 leading-relaxed italic">
                                        "{comment.text}"
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No feedback records found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-black/20 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all outline-none"
                    >
                        Close Feedback
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default LeadDetailModal;
