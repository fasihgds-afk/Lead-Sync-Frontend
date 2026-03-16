import React, { useState } from 'react';

export default function LeadTimelineModal({
    isOpen,
    onClose,
    selectedLead,
    onAddComment
}) {
    const [commentText, setCommentText] = useState('');

    const handleAdd = async () => {
        if (!commentText.trim()) return;
        const success = await onAddComment(commentText);
        if (success) {
            setCommentText('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-fadeIn">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] w-full max-w-md overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                <div className="p-5 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-tertiary)]/30">
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">Lead Comments</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--accent-error)] hover:text-white flex items-center justify-center transition-all">
                        <svg className="h-4 w-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {(selectedLead?.comments || []).length === 0 ? (
                            <div className="text-center py-8 opacity-30 italic text-sm font-medium">No Comments.</div>
                        ) : (
                            selectedLead.comments.map((c, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-primary)]/50 hover:border-[var(--accent-primary)]/20 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">{c.createdByRole || 'Admin'}</span>
                                        <span className="text-[10px] font-black text-[var(--text-tertiary)] opacity-60">{c.createdDate || c.createdAt?.split('T')[0]}</span>
                                    </div>
                                    <p className="text-base text-[var(--text-primary)] leading-relaxed font-medium">{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="space-y-3">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add note for reminder or for manager..."
                            className="w-full bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-[var(--accent-primary)] font-medium transition-all shadow-inner resize-none"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!commentText.trim()}
                            className="w-full h-10 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            Add notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
