import React from 'react';

const ConfirmModal = ({ show, onConfirm, onCancel, isMoving }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="p-8 text-center bg-gradient-to-b from-emerald-500/10 to-transparent">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Distribute Leads?</h3>
                    <p className="mt-2 text-sm opacity-60 px-4" style={{ color: 'var(--text-secondary)' }}>
                        Move all verified leads to Lead Qualifiers. This cannot be undone.
                    </p>
                </div>
                <div className="p-6 flex flex-col gap-3">
                    <button onClick={onConfirm} disabled={isMoving}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {isMoving ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        Confirm Distribution
                    </button>
                    <button onClick={onCancel}
                        className="w-full py-4 rounded-2xl border font-bold text-sm hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all"
                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
