import React from 'react';

const UpsellModal = ({ isOpen, lead, onClose, onConfirm, upsellData, setUpsellData }) => {
    if (!isOpen) return null;

    const isAlreadyPaid = lead?.status === 'PAID' || (lead?.upsales?.length > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-[2px]">
            <div className="relative w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
                <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header - Compact */}
                    <div className="p-3 border-b border-white/5 shrink-0 bg-[var(--bg-secondary)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isAlreadyPaid ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-tight">
                                        {isAlreadyPaid ? 'Record New Upsell' : 'Initial Payment Info'}
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{lead?.name}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Body - Dense & Scrollable */}
                    <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar bg-black/5">
                        {/* Target Selection */}
                        {!isAlreadyPaid && (
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Target Status</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        onClick={() => setUpsellData({ ...upsellData, type: 'paid' })}
                                        className={`p-2.5 rounded-xl border-2 transition-all group ${upsellData.type === 'paid'
                                            ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/5'
                                            : 'bg-[var(--bg-tertiary)]/20 border-white/5 hover:border-emerald-500/20'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${upsellData.type === 'paid' ? 'bg-emerald-500 shadow-md' : 'bg-emerald-500/10 group-hover:scale-105'
                                                }`}>
                                                <svg className={`w-4 h-4 ${upsellData.type === 'paid' ? 'text-white' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${upsellData.type === 'paid' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                Paid
                                            </span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setUpsellData({ ...upsellData, type: 'unpaid' })}
                                        className={`p-2.5 rounded-xl border-2 transition-all group ${upsellData.type === 'unpaid'
                                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5'
                                            : 'bg-[var(--bg-tertiary)]/20 border-white/5 hover:border-amber-500/20'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${upsellData.type === 'unpaid' ? 'bg-amber-500 shadow-md' : 'bg-amber-500/10 group-hover:scale-105'
                                                }`}>
                                                <svg className={`w-4 h-4 ${upsellData.type === 'unpaid' ? 'text-white' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${upsellData.type === 'unpaid' ? 'text-amber-400' : 'text-slate-500'}`}>
                                                Unpaid
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isAlreadyPaid && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-lg shadow-emerald-900/40">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Add New Upsell Entry</span>
                            </div>
                        )}

                        {/* Inputs */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-1.5 px-1">
                                    {upsellData.type === 'paid' ? 'Amount Received ($)' : 'Projected Value ($)'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-emerald-500 font-black text-[12px]">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={upsellData.price}
                                        onChange={(e) => setUpsellData({ ...upsellData, price: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-[var(--bg-tertiary)]/40 border-[1.5px] border-white/5 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-black placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-1.5 px-1">
                                    {upsellData.type === 'paid' ? 'Internal Note' : 'Upsell Plan'}
                                </label>
                                <textarea
                                    value={upsellData.comment}
                                    onChange={(e) => setUpsellData({ ...upsellData, comment: e.target.value })}
                                    placeholder={upsellData.type === 'paid' ? 'Add payment details...' : 'Add strategy...'}
                                    className="w-full bg-[var(--bg-tertiary)]/40 border-[1.5px] border-white/5 rounded-lg p-3 h-[70px] text-[10px] text-slate-200 font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer - Mini */}
                    <div className="p-3 bg-[var(--bg-secondary)] border-t border-white/5 flex gap-2 shrink-0">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)]/60 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-[1.5] py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg transition-all active:scale-[0.97] ${isAlreadyPaid
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/10'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/10'
                                }`}
                        >
                            {isAlreadyPaid ? 'Confirm Upsell' : (upsellData.type === 'paid' ? 'Confirm Pay' : 'Initialize')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UpsellModal;