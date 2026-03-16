import React, { useState, useEffect, useCallback } from 'react';
import { managerAPI } from '../../../api/manager.api';
import SearchHeader from '../components/SearchHeader';
import SharedLoader from '../../../components/SharedLoader';

const ITEMS_PER_PAGE = 20;

const CommentsModal = ({ isOpen, onClose, comments, leadName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-[101] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] w-full max-w-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-tertiary)]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">All Comments </h2>
                            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Lead: {leadName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                    {comments && comments.length > 0 ? (
                        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, i) => (
                            <div key={i} className="bg-[var(--bg-tertiary)]/5 rounded-lg border border-[var(--border-primary)] p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${comment.createdByRole === 'Manager'
                                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                            {comment.createdByRole}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-tertiary)]">
                                            {comment.createdBy?.name || 'User'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-[var(--text-tertiary)]">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{comment.text}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">No comments</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        Close History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ManagerRejectedLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const fetchRejectedLeads = useCallback(async () => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const response = await managerAPI.getApprovedRejections({
                limit: ITEMS_PER_PAGE,
                skip
            });

            if (response.success) {
                setLeads(response.leads || []);
                setTotal(response.totalLeads || response.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch rejected leads", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchRejectedLeads();
    }, [fetchRejectedLeads]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openComments = (lead, e) => {
        e.stopPropagation();
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleRowClick = (leadId) => {
        setExpandedId(prevId => prevId === leadId ? null : leadId);
    };

    const filteredLeads = leads.filter(l => {
        const searchLower = searchTerm.toLowerCase();
        return (l.name || '').toLowerCase().includes(searchLower) ||
            (l.responseSource?.emails?.some(e => (e.value || '').toLowerCase().includes(searchLower))) ||
            (l.responseSource?.email?.value || '').toLowerCase().includes(searchLower) ||
            (l.responseSource?.phones?.some(p => (p.value || '').toLowerCase().includes(searchLower))) ||
            (l.responseSource?.phone?.value || '').toLowerCase().includes(searchLower);
    });

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="space-y-5 max-w-[1400px] mx-auto px-4 py-5 min-h-screen bg-[var(--bg-primary)]">
            <SearchHeader
                title="Rejected Leads"
                subtitle=""
                onRefresh={fetchRejectedLeads}
                loading={loading}
                icon={(
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            />

            {/* Enhanced Table */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-[var(--bg-tertiary)]/80 to-[var(--bg-tertiary)]/60 border-b border-[var(--border-primary)]">
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rejected Profile</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email / Numbers</span>
                                </th>
                                <th className="px-4 py-3 text-center">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Comments</span>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-3">
                                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">Clean Investigation Records</p>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1">No matching rejection records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead, idx) => {
                                    const isFinal = lead.stage === 'REJECTED';
                                    const date = isFinal ? lead.rejectionApprovedAt : lead.rejectionRequestedAt;
                                    const isExpanded = expandedId === lead._id;

                                    return (
                                        <React.Fragment key={lead._id}>
                                            {/* Main Row */}
                                            <tr
                                                className={`group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-tertiary)]/30 ${isExpanded ? 'bg-[var(--bg-tertiary)]/20 border-b-0' : ''}`}
                                                onClick={() => handleRowClick(lead._id)}
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold shadow-sm">
                                                            {idx + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{lead.name}</span>

                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
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
                                                                        <div key={`${contact.type}-${i}`} className="flex items-center gap-2">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${contact.type === 'email' ? 'bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}></div>
                                                                            <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[150px]">{contact.value}</span>
                                                                        </div>
                                                                    ))}
                                                                    {remainingCount > 0 && (
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-tighter">
                                                                                +{remainingCount} more
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={(e) => openComments(lead, e)}
                                                        className="inline-flex items-center gap-2 group/comment transition-all"
                                                        title="View communications timeline"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm group-hover/comment:bg-rose-500 group-hover/comment:text-white group-hover/comment:border-rose-500 transition-all shrink-0">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex flex-col items-start gap-0.5">
                                                            <span className="text-[9px] font-black text-rose-500/70 group-hover/comment:text-rose-500 uppercase tracking-tighter transition-colors">View Comments</span>
                                                            <span className="text-[8px] text-[var(--text-tertiary)]">{lead.comments?.length || 0} messages</span>
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className={`p-2 rounded-lg transition-all duration-200 ${isExpanded
                                                                ? 'bg-[var(--bg-tertiary)] rotate-180'
                                                                : 'hover:bg-[var(--bg-tertiary)]/50'
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Details Row */}
                                            {isExpanded && (
                                                <tr className="bg-[var(--bg-tertiary)]/5">
                                                    <td colSpan="4" className="px-4 py-4 border-t border-[var(--border-primary)]">
                                                        <div className="grid grid-cols-12 gap-6">
                                                            {/* Contact Info */}
                                                            <div className="col-span-5">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-rose-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Contact Information</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {(lead.responseSource?.emails || []).map((emailObj, idx) => (
                                                                        <div
                                                                            key={`rs-email-${idx}`}
                                                                            onClick={() => handleCopy(emailObj.value, `e-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-rose-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1">{emailObj.value}</span>
                                                                            {copiedId === `e-${lead._id}-${idx}` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {(lead.responseSource?.emails || []).length === 0 && lead.responseSource?.email?.value && (
                                                                        <div
                                                                            onClick={() => handleCopy(lead.responseSource.email.value, `e-${lead._id}-single`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-rose-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1">{lead.responseSource.email.value}</span>
                                                                            {copiedId === `e-${lead._id}-single` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {(lead.responseSource?.phones || []).map((phoneObj, idx) => (
                                                                        <div
                                                                            key={`rs-phone-${idx}`}
                                                                            onClick={() => handleCopy(phoneObj.value, `p-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-rose-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)]">{phoneObj.value}</span>
                                                                            {copiedId === `p-${lead._id}-${idx}` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {(lead.responseSource?.phones || []).length === 0 && lead.responseSource?.phone?.value && (
                                                                        <div
                                                                            onClick={() => handleCopy(lead.responseSource.phone.value, `p-${lead._id}-single`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-rose-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)]">{lead.responseSource.phone.value}</span>
                                                                            {copiedId === `p-${lead._id}-single` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Timeline History */}
                                                            <div className="col-span-7">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-rose-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Recent Comments</span>
                                                                    <span className="ml-auto text-[9px] text-[var(--text-tertiary)]">
                                                                        Total: {lead.comments?.length || 0} comments
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                                    {lead.comments && lead.comments.length > 0 ? (
                                                                        lead.comments.slice(0, 3).map((comment, idx) => (
                                                                            <div key={idx} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-rose-500/30 transition-all group/comment">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${comment.createdByRole === 'Manager'
                                                                                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                                                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                                                        }`}>
                                                                                        {comment.createdByRole}
                                                                                    </span>
                                                                                    <span className="text-[8px] text-[var(--text-tertiary)]">
                                                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2">
                                                                                    {comment.text}
                                                                                </p>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="py-6 text-center">
                                                                            <p className="text-[10px] text-[var(--text-tertiary)]">No comments</p>
                                                                        </div>
                                                                    )}
                                                                    {(lead.comments?.length || 0) > 3 && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openComments(lead, e);
                                                                            }}
                                                                            className="w-full py-2 text-[9px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/20 rounded-lg hover:bg-rose-500/10 transition-colors"
                                                                        >
                                                                            View all {lead.comments.length} comments
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Timestamp Footer */}
                                                        <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex items-center justify-end gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] text-[var(--text-tertiary)]">Requested:</span>
                                                                <span className="text-[10px] font-bold text-[var(--text-primary)]">
                                                                    {new Date(lead.rejectionRequestedAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {lead.rejectionApprovedAt && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] text-[var(--text-tertiary)]">Verified:</span>
                                                                    <span className="text-[10px] font-bold text-emerald-500">
                                                                        {new Date(lead.rejectionApprovedAt).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-[var(--bg-secondary)] px-4 py-3 rounded-lg border border-[var(--border-primary)]">
                    <div className="text-xs text-[var(--text-tertiary)]">
                        Showing <span className="font-semibold text-[var(--text-secondary)]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                        <span className="font-semibold text-[var(--text-secondary)]">{Math.min(currentPage * ITEMS_PER_PAGE, total)}</span> of{' '}
                        <span className="font-semibold text-[var(--text-secondary)]">{total}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 3 + i;
                                }
                                if (pageNum <= totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                                                : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <CommentsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                comments={selectedLead?.comments}
                leadName={selectedLead?.name}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border-secondary);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-tertiary);
                }
            `}</style>
        </div>
    );
}