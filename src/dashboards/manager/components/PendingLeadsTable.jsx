import React from 'react';
import LeadRow from './LeadRow';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const PendingLeadsTable = ({
    leads,
    onReject,
    onUpsell,
    onDetail,
    copiedId,
    onCopy,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    onPageChange
}) => {
    if (leads.length === 0) {
        return <EmptyState type="pending" />;
    }

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-primary)' }}>Pending Review</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-900/5">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {leads.length} Active {leads.length === 1 ? 'Lead' : 'Leads'}
                    </span>
                </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border-2 border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="w-[15%] px-4 py-3 text-left">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Lead Entity</span>
                                </th>
                                <th className="w-[25%] px-4 py-3 text-left">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Contact</span>
                                </th>
                                <th className="w-[15%] px-4 py-3 text-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>LQ Comment</span>
                                </th>
                                <th className="w-[15%] px-4 py-3 text-left">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Assigned</span>
                                </th>
                                <th className="w-[30%] px-4 py-3 text-right">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Operational</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {leads.map((lead, index) => (
                                <LeadRow
                                    key={lead._id}
                                    lead={lead}
                                    count={index + 1 + (currentPage - 1) * itemsPerPage}
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};

export default PendingLeadsTable;