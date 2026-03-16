import React, { useState, useEffect, useRef } from 'react';
import { managerAPI } from '../../../api/manager.api';
import SearchHeader from '../components/SearchHeader';
import UpsellModal from '../components/UpsellModal';
import Pagination from '../components/Pagination';
import SharedLoader from '../../../components/SharedLoader';

const ITEMS_PER_PAGE = 12; // Slightly reduced for better spacing

export default function ManagerHistory() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [showUpsellModal, setShowUpsellModal] = useState(false);
    const [upsellData, setUpsellData] = useState({
        type: 'paid',
        price: '',
        comment: ''
    });

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const response = await managerAPI.getMyLeads({
                limit: ITEMS_PER_PAGE,
                skip,
                status: 'paid'
            });

            if (response.success) {
                const leadsWithUpsells = (response.leads || []).filter(l =>
                    l.upsales && l.upsales.length > 0
                );
                setLeads(leadsWithUpsells);
                setTotal(response.totalLeads || response.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch manager history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [currentPage]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAddMoreClick = (lead, e) => {
        e.stopPropagation();
        setSelectedLead(lead);
        setUpsellData({ type: 'paid', price: '', comment: '' });
        setShowUpsellModal(true);
    };

    const handleUpsellConfirm = async () => {
        if (!selectedLead) return;
        try {
            const amount = parseFloat(upsellData.price);
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }
            if (!upsellData.comment.trim()) {
                alert("Please add a comment");
                return;
            }

            await managerAPI.markAsPaid(selectedLead._id, amount, upsellData.comment);
            setShowUpsellModal(false);
            setUpsellData({ type: 'paid', price: '', comment: '' });
            await fetchLeads();
            setExpandedId(null);
        } catch (err) {
            console.error("Failed to record payment", err);
            alert("Failed to record payment: " + (err.response?.data?.message || err.message));
        }
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
            (l.responseSource?.phone?.value || '').toLowerCase().includes(searchLower) ||
            (l.upsales?.some(u => (u.comment || '').toLowerCase().includes(searchLower)));
    });

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const totalRevenue = leads.reduce((sum, lead) =>
        sum + (lead.upsales || []).reduce((s, u) => s + (u.amount || 0), 0), 0
    );

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="space-y-5 max-w-[1400px] mx-auto px-4 py-5 min-h-screen bg-[var(--bg-primary)]">
            <SearchHeader
                title="Payment History"
                subtitle="Track all upsell transactions"
                onRefresh={fetchLeads}
                loading={loading}
                icon={(
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            />

            {/* Enhanced Table with Better Row Height */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-[var(--bg-tertiary)]/80 to-[var(--bg-tertiary)]/60 border-b border-[var(--border-primary)]">
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Lead</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Upsells</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Upsell Date</span>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-3">
                                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">No payment records found</p>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1">Leads with upsells will appear here</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map(lead => {
                                    const totalUpsellPrice = (lead.upsales || []).reduce((sum, item) => sum + (item.amount || 0), 0);
                                    const isExpanded = expandedId === lead._id;

                                    return (
                                        <React.Fragment key={lead._id}>
                                            {/* Main Row - Increased height with better padding */}
                                            <tr
                                                className={`group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-tertiary)]/30 ${isExpanded ? 'bg-[var(--bg-tertiary)]/20 border-b-0' : ''}`}
                                                onClick={() => handleRowClick(lead._id)}
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold shadow-sm">
                                                            {filteredLeads.indexOf(lead) + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{lead.name}</span>
                                                            {lead.upsales && (
                                                                <span className="ml-2 text-[9px] font-bold text-emerald-500/70 bg-emerald-500/5 px-1.5 py-0.5 rounded-full">
                                                                    {lead.upsales.length} {lead.upsales.length === 1 ? 'payment' : 'payments'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-base font-bold text-emerald-500">${totalUpsellPrice.toFixed(2)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                                                            {lead.upsales?.length || 0}
                                                        </span>
                                                        <span className="text-[10px] text-[var(--text-tertiary)]">transactions</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight">
                                                                {(() => {
                                                                    const lastUpsell = lead.upsales?.[lead.upsales.length - 1];
                                                                    const date = lastUpsell ? new Date(lastUpsell.addedAt) : new Date(lead.assignedAt || lead.createdAt);
                                                                    return date.toLocaleDateString('en-US', {
                                                                        timeZone: 'Asia/Karachi',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    });
                                                                })()}
                                                            </span>
                                                            <span className="text-[9px] font-medium text-[var(--text-tertiary)] opacity-80">
                                                                {(() => {
                                                                    const lastUpsell = lead.upsales?.[lead.upsales.length - 1];
                                                                    const date = lastUpsell ? new Date(lastUpsell.addedAt) : new Date(lead.assignedAt || lead.createdAt);
                                                                    return date.toLocaleTimeString('en-US', {
                                                                        timeZone: 'Asia/Karachi',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    });
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => handleAddMoreClick(lead, e)}
                                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-emerald-500/20"
                                                            title="Add payment"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className={`p-2 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-[var(--bg-tertiary)] rotate-180' : 'hover:bg-[var(--bg-tertiary)]/50'}`}
                                                        >
                                                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Enhanced Expanded Details Row */}
                                            {isExpanded && (
                                                <tr className="bg-[var(--bg-tertiary)]/5">
                                                    <td colSpan="5" className="px-4 py-4 border-t border-[var(--border-primary)]">
                                                        <div className="grid grid-cols-12 gap-6">
                                                            {/* Contact Info */}
                                                            <div className="col-span-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Contact Information</span>
                                                                </div>
                                                                {lead.assignedAt && (
                                                                    <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                        <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-tight leading-none">
                                                                            Received: {new Date(lead.assignedAt).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })} • {new Date(lead.assignedAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="space-y-2">
                                                                    {(lead.responseSource?.emails || []).map((emailObj, idx) => (
                                                                        <div
                                                                            key={`rs-email-${idx}`}
                                                                            onClick={() => handleCopy(emailObj.value, `e-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1 truncate">{emailObj.value}</span>
                                                                            {copiedId === `e-${lead._id}-${idx}` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {(lead.responseSource?.emails || []).length === 0 && lead.responseSource?.email?.value && (
                                                                        <div
                                                                            onClick={() => handleCopy(lead.responseSource.email.value, `e-${lead._id}-single`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1 truncate">{lead.responseSource.email.value}</span>
                                                                            {copiedId === `e-${lead._id}-single` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {(lead.responseSource?.phones || []).map((phoneObj, idx) => (
                                                                        <div
                                                                            key={`rs-phone-${idx}`}
                                                                            onClick={() => handleCopy(phoneObj.value, `p-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
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
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer group/contact text-xs relative"
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

                                                            {/* Payment History */}
                                                            <div className="col-span-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Payments</span>
                                                                </div>
                                                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                                                                    {lead.upsales && lead.upsales.length > 0 ? (
                                                                        lead.upsales.map((upsell, idx) => {
                                                                            const addedDate = new Date(upsell.addedAt);
                                                                            return (
                                                                                <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/30 transition-all group/payment">
                                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                                        <span className="text-xs font-black text-emerald-500 tracking-tight">${upsell.amount}</span>
                                                                                        <span className="text-[7px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-1.5 py-0.5 rounded border border-[var(--border-primary)] shadow-sm">
                                                                                            {addedDate.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })} • {addedDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-[9px] text-[var(--text-secondary)] italic leading-tight group-hover/payment:text-[var(--text-primary)] transition-colors line-clamp-2">
                                                                                        "{upsell.comment || 'No comment'}"
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div className="py-6 text-center bg-[var(--bg-tertiary)]/30 rounded-xl border border-dashed border-[var(--border-primary)]">
                                                                            <p className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">No Records</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Discussion History */}
                                                            <div className="col-span-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">All Comments</span>
                                                                </div>
                                                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                                                                    {lead.comments && lead.comments.length > 0 ? (
                                                                        lead.comments
                                                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                                            .map((comment, idx) => {
                                                                                const roleColors = {
                                                                                    'Manager': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                                                                                    'Lead Qualifiers': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                                                                                    'Admin': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                                                                                    'Super Admin': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                                                                                    'Data Minors': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                                                                                };
                                                                                const colorClass = roleColors[comment.createdByRole] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
                                                                                const createdDate = new Date(comment.createdAt);
                                                                                return (
                                                                                    <div key={idx} className="p-2.5 rounded-xl bg-black/10 border border-[var(--border-primary)]/40 hover:border-emerald-500/20 transition-all">
                                                                                        <div className="flex items-center justify-between mb-1">
                                                                                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
                                                                                                {comment.createdByRole || 'Unknown'}
                                                                                            </span>
                                                                                            <span className="text-[7px] font-bold text-[var(--text-tertiary)] opacity-60">
                                                                                                {createdDate.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })} • {createdDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className="text-[10px] font-medium text-[var(--text-secondary)] italic leading-tight">
                                                                                            "{comment.text}"
                                                                                        </p>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                    ) : (
                                                                        <div className="py-6 text-center bg-[var(--bg-tertiary)]/30 rounded-xl border border-dashed border-[var(--border-primary)]">
                                                                            <p className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">No Comments</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
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

                        {/* Page Numbers */}
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
                                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
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

            {/* Modal */}
            <UpsellModal
                isOpen={showUpsellModal}
                lead={selectedLead}
                onClose={() => {
                    setShowUpsellModal(false);
                    setUpsellData({ type: 'paid', price: '', comment: '' });
                }}
                onConfirm={handleUpsellConfirm}
                upsellData={upsellData}
                setUpsellData={setUpsellData}
            />

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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