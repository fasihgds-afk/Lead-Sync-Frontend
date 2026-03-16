import React from 'react';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const RejectedLeadsTable = ({
    rejectedLeads,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    onPageChange
}) => {
    if (rejectedLeads.length === 0) {
        return <EmptyState type="rejected" />;
    }

    return (
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                {/* ... table content remains same ... */}
                <table className="w-full min-w-[900px] table-fixed">
                    <thead>
                        <tr className="bg-[var(--bg-tertiary)]/30 border-b border-white/5">
                            <th className="w-[20%] px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lead</span>
                            </th>
                            <th className="w-[25%] px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</span>
                            </th>
                            <th className="w-[20%] px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</span>
                            </th>
                            <th className="w-[20%] px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejection Reason</span>
                            </th>
                            <th className="w-[15%] px-4 py-3 text-center">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected At</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rejectedLeads.map((lead) => {
                            const isFinal = lead.stage === 'REJECTED';
                            const date = isFinal ? lead.rejectionApprovedAt : lead.rejectionRequestedAt;
                            const reason = lead.comments?.filter(c => c.createdByRole === 'Manager').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.text || 'No reason';

                            return (
                                <tr key={lead._id} className={`hover:bg-[var(--bg-tertiary)]/5 transition-colors ${isFinal ? 'opacity-75' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-md ${isFinal ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-500'} border border-white/5 flex items-center justify-center font-bold text-sm shrink-0`}>
                                                {lead.name?.[0] || 'L'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white flex items-center gap-2">
                                                    {lead.name}
                                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${isFinal ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                                        {isFinal ? 'Finalized' : 'Pending Admin'}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="space-y-1.5">
                                            {lead.emails?.map((email, idx) => (
                                                <div key={`email-${idx}`} className="flex items-center gap-1.5 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 shrink-0"></div>
                                                    <span className="text-[11px] text-slate-400 truncate">{email.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="text-[11px] text-slate-400 font-medium">
                                            {lead.industry || lead.location || 'Technology'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                                            <p className="text-[11px] text-slate-400 leading-relaxed italic">"{reason}"</p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[11px] font-bold text-white">
                                                {date ? new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-medium tracking-tight">
                                                {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
    );
};

export default RejectedLeadsTable;