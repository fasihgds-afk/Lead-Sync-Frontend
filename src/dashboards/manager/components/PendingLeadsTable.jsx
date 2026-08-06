import React from 'react';
import LeadRow from './LeadRow';
import EmptyState from './EmptyState';

const PendingLeadsTable = ({
    leads,
    isMetaTab,
    onReject,
    onUpsell,
    onDetail,
    copiedId,
    onCopy,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    onPageChange,
}) => {
    if (leads.length === 0) {
        return <EmptyState type="pending" />;
    }

    return (
        <div className="space-y-3">
            {/* sub-header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    <h2
                        className="text-[11px] font-black uppercase tracking-[0.2em] italic"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Pending Review
                    </h2>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                        {leads.length} Active {leads.length === 1 ? 'Lead' : 'Leads'}
                    </span>
                </div>
            </div>

            {/* table card */}
            <div className="bg-[var(--bg-secondary)] border-2 border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="w-[25%] px-4 py-3 text-left">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                          style={{ color: 'var(--text-tertiary)' }}>
                                        Lead Entity
                                    </span>
                                </th>
                                <th className={`${isMetaTab ? 'w-[35%]' : 'w-[28%]'} px-4 py-3 text-left`}>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                          style={{ color: 'var(--text-tertiary)' }}>
                                        Contact
                                    </span>
                                </th>
                                {/* LQ Comment column — hidden for meta leads */}
                                {!isMetaTab && (
                                    <th className="w-[12%] px-4 py-3 text-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                              style={{ color: 'var(--text-tertiary)' }}>
                                            LQ Comment
                                        </span>
                                    </th>
                                )}
                                {/* View Detail column — only for meta leads */}
                                {isMetaTab && (
                                    <th className="w-[10%] px-4 py-3 text-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                              style={{ color: 'var(--text-tertiary)' }}>
                                            Detail
                                        </span>
                                    </th>
                                )}
                                <th className="w-[15%] px-4 py-3 text-left">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                          style={{ color: 'var(--text-tertiary)' }}>
                                        Assigned
                                    </span>
                                </th>
                                <th className="w-[25%] px-4 py-3 text-right">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                                          style={{ color: 'var(--text-tertiary)' }}>
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {leads.map((lead, index) => (
                                <LeadRow
                                    key={lead._id}
                                    lead={lead}
                                    count={index + 1 + (currentPage - 1) * itemsPerPage}
                                    isMetaTab={isMetaTab}
                                    onReject={onReject}
                                    onUpsell={onUpsell}
                                    onDetail={onDetail}
                                    copiedId={copiedId}
                                    onCopy={onCopy}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {total === 0 ? 'No entries' : (
                            <>
                                Showing{' '}
                                <span className="font-black" style={{ color: 'var(--text-secondary)' }}>
                                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, total)}
                                </span>{' '}
                                of{' '}
                                <span className="font-black" style={{ color: 'var(--text-secondary)' }}>
                                    {total}
                                </span>
                            </>
                        )}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center disabled:opacity-30 hover:border-white/20 transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-black">
                            {currentPage} / {Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center disabled:opacity-30 hover:border-white/20 transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingLeadsTable;
