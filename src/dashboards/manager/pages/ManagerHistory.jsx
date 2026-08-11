import React, { useState, useEffect, useMemo } from 'react';
import { managerAPI } from '../../../api/manager.api';
import SearchHeader from '../components/SearchHeader';
import UpsellModal from '../components/UpsellModal';
import SharedLoader from '../../../components/SharedLoader';

const ITEMS_PER_PAGE = 12;
// Upper bound for a single "fetch everything" call. Bump if a manager can
// realistically have more paid leads than this.
const FETCH_ALL_LIMIT = 5000;

const SOURCE_FILTERS = [
    { value: 'all', label: 'All Leads' },
    { value: 'normal', label: 'Normal Leads' },
    { value: 'meta', label: 'Meta Leads' },
];

const ROLE_COLORS = {
    'Manager': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    'Lead Qualifiers': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'Admin': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    'Super Admin': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    'Data Minors': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });

export default function ManagerHistory() {
    // allLeads holds EVERY paid lead for this manager — fetched once.
    // All searching/filtering/pagination below runs against this in memory,
    // so results are always accurate no matter which page you're on.
    const [allLeads, setAllLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [showUpsellModal, setShowUpsellModal] = useState(false);
    const [upsellData, setUpsellData] = useState({ type: 'paid', price: '', comment: '' });

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await managerAPI.getMyLeads({
                limit: FETCH_ALL_LIMIT,
                skip: 0,
                status: 'paid',
            });

            if (response.success) {
                setAllLeads(response.leads || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payment history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Tab badge counts — always computed from the FULL dataset, not a page.
    const counts = useMemo(() => ({
        all: allLeads.length,
        normal: allLeads.filter(l => !l.isMetaLead).length,
        meta: allLeads.filter(l => l.isMetaLead).length,
    }), [allLeads]);

    // Search + source filter, run once per change (not once per render).
    const filteredLeads = useMemo(() => {
        const searchLower = searchTerm.trim().toLowerCase();

        return allLeads.filter(l => {
            if (sourceFilter === 'meta' && !l.isMetaLead) return false;
            if (sourceFilter === 'normal' && l.isMetaLead) return false;

            if (!searchLower) return true;

            const name = (l.name || l.fullName || '').toLowerCase();
            const email = (l.email || l.emailNormalized || '').toLowerCase();
            const phone = (l.number || l.numberNormalized || '').toLowerCase();
            const location = (l.location || '').toLowerCase();
            const program = (l.program || '').toLowerCase();
            const school = (l.school || '').toLowerCase();
            const rsEmails = (l.responseSource?.emails || []).some(e => (e.value || '').toLowerCase().includes(searchLower));
            const rsPhones = (l.responseSource?.phones || []).some(p => (p.value || '').toLowerCase().includes(searchLower));
            const upsaleComments = (l.upsales || []).some(u => (u.comment || '').toLowerCase().includes(searchLower));

            return (
                name.includes(searchLower) ||
                email.includes(searchLower) ||
                phone.includes(searchLower) ||
                location.includes(searchLower) ||
                program.includes(searchLower) ||
                school.includes(searchLower) ||
                rsEmails ||
                rsPhones ||
                upsaleComments
            );
        });
    }, [allLeads, sourceFilter, searchTerm]);

    // Reset to page 1 whenever the *result set* changes shape, not just the tab.
    useEffect(() => {
        setCurrentPage(1);
    }, [sourceFilter, searchTerm]);

    const totalFiltered = filteredLeads.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

    // Paginate the already-filtered list — this is what actually renders.
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLeads, currentPage]);

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

    if (loading && allLeads.length === 0) return <SharedLoader />;

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">Failed to load payment history</p>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs">{error}</p>
            </div>
            <button
                onClick={fetchLeads}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-5 max-w-[1400px] mx-auto px-4 py-5 min-h-screen bg-[var(--bg-primary)]">
            <SearchHeader
                title="Payment History"
                subtitle="Track all upsell transactions"
                onRefresh={fetchLeads}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                icon={(
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            />

            {/* Source Filter Tabs — counts always reflect the full dataset */}
            <div className="flex items-center gap-2">
                {SOURCE_FILTERS.map(f => {
                    const isActive = sourceFilter === f.value;
                    const count = f.value === 'all' ? counts.all : f.value === 'normal' ? counts.normal : counts.meta;
                    return (
                        <button
                            key={f.value}
                            onClick={() => setSourceFilter(f.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                                isActive
                                    ? f.value === 'meta'
                                        ? 'bg-purple-500 border-purple-500 text-white shadow-sm shadow-purple-500/20'
                                        : f.value === 'normal'
                                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                                            : 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                    : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                            }`}
                        >
                            {f.label}
                            {count > 0 && (
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-[var(--bg-tertiary)]/80 to-[var(--bg-tertiary)]/60 border-b border-[var(--border-primary)]">
                                <th className="px-4 py-3 text-left"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Lead</span></th>
                                <th className="px-4 py-3 text-left"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Source</span></th>
                                <th className="px-4 py-3 text-left"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total</span></th>
                                <th className="px-4 py-3 text-left"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Upsells</span></th>
                                <th className="px-4 py-3 text-left"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Upsell Date</span></th>
                                <th className="px-4 py-3 text-right"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-3">
                                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">No payment records found</p>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                                {searchTerm || sourceFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Leads with upsells will appear here'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead, idx) => {
                                    const totalUpsellPrice = (lead.upsales || []).reduce((sum, item) => sum + (item.amount || 0), 0);
                                    const isExpanded = expandedId === lead._id;
                                    const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                                    const lastUpsell = lead.upsales?.[lead.upsales.length - 1];
                                    const lastDate = lastUpsell ? new Date(lastUpsell.addedAt) : new Date(lead.assignedAt || lead.createdAt);

                                    return (
                                        <React.Fragment key={lead._id}>
                                            <tr
                                                className={`group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-tertiary)]/30 ${isExpanded ? 'bg-[var(--bg-tertiary)]/20 border-b-0' : ''}`}
                                                onClick={() => handleRowClick(lead._id)}
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold shadow-sm">
                                                            {rowNumber}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{lead.name || lead.fullName}</span>
                                                            {lead.isMetaLead && (lead.program || lead.school) && (
                                                                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                                                                    {[lead.program, lead.school].filter(Boolean).join(' · ')}
                                                                </div>
                                                            )}
                                                            {!lead.isMetaLead && lead.location && (
                                                                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{lead.location}</div>
                                                            )}
                                                            {lead.upsales && lead.upsales.length > 0 && (
                                                                <span className="ml-2 text-[9px] font-bold text-emerald-500/70 bg-emerald-500/5 px-1.5 py-0.5 rounded-full">
                                                                    {lead.upsales.length} {lead.upsales.length === 1 ? 'payment' : 'payments'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {lead.isMetaLead ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                            </svg>
                                                            Meta
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Normal
                                                        </span>
                                                    )}
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
                                                            <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{formatDate(lastDate)}</span>
                                                            <span className="text-[9px] font-medium text-[var(--text-tertiary)] opacity-80">{formatTime(lastDate)}</span>
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
                                                        <button className={`p-2 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-[var(--bg-tertiary)] rotate-180' : 'hover:bg-[var(--bg-tertiary)]/50'}`}>
                                                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr className="bg-[var(--bg-tertiary)]/5">
                                                    <td colSpan="6" className="px-4 py-4 border-t border-[var(--border-primary)]">
                                                        <div className="grid grid-cols-12 gap-6">
                                                            {/* Contact / lead-type-specific info */}
                                                            <div className="col-span-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                                                                        {lead.isMetaLead ? 'Lead Details' : 'Contact & Research'}
                                                                    </span>
                                                                </div>

                                                                {lead.assignedAt && (
                                                                    <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                        <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-tight leading-none">
                                                                            Received: {formatDate(lead.assignedAt)} • {formatTime(lead.assignedAt)}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Meta-only fields */}
                                                                {lead.isMetaLead && (
                                                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                                                        {lead.program && (
                                                                            <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                                                                                Program: {lead.program}
                                                                            </span>
                                                                        )}
                                                                        {lead.school && (
                                                                            <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                                                                                School: {lead.school}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Normal-only fields */}
                                                                {!lead.isMetaLead && (
                                                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                                                        {lead.location && (
                                                                            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                                                                                📍 {lead.location}
                                                                            </span>
                                                                        )}
                                                                        {lead.stage && (
                                                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] px-2 py-1 rounded-lg">
                                                                                {lead.stage}
                                                                            </span>
                                                                        )}
                                                                        {lead.lqStatus && (
                                                                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                                                                {lead.lqStatus}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="space-y-2">
                                                                    {/* Meta lead direct contact fields */}
                                                                    {lead.isMetaLead && lead.email && (
                                                                        <div
                                                                            onClick={() => handleCopy(lead.email, `meta-e-${lead._id}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1 truncate">{lead.email}</span>
                                                                            {copiedId === `meta-e-${lead._id}` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {lead.isMetaLead && lead.number && (
                                                                        <div
                                                                            onClick={() => handleCopy(lead.number, `meta-p-${lead._id}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer text-xs relative"
                                                                        >
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)]">{lead.number}</span>
                                                                            {copiedId === `meta-p-${lead._id}` && (
                                                                                <span className="absolute right-3 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Copied!</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {lead.isMetaLead && lead.website && (
                                                                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs">
                                                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                                                                                <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" />
                                                                                </svg>
                                                                            </div>
                                                                            <span className="text-[var(--text-secondary)] flex-1 truncate">{lead.website}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Normal lead responseSource fields */}
                                                                    {(lead.responseSource?.emails || []).map((emailObj, idx) => (
                                                                        <div
                                                                            key={`rs-email-${idx}`}
                                                                            onClick={() => handleCopy(emailObj.value, `e-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer text-xs relative"
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
                                                                    {(lead.responseSource?.phones || []).map((phoneObj, idx) => (
                                                                        <div
                                                                            key={`rs-phone-${idx}`}
                                                                            onClick={() => handleCopy(phoneObj.value, `p-${lead._id}-${idx}`)}
                                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer text-xs relative"
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

                                                                    {/* Normal lead research sources */}
                                                                    {!lead.isMetaLead && (lead.sources || []).length > 0 && (
                                                                        <div className="pt-1 space-y-1.5">
                                                                            <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Research Sources</span>
                                                                            {lead.sources.map((s, idx) => (
                                                                                <div key={`src-${idx}`} className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs">
                                                                                    <span className="font-semibold text-[var(--text-primary)]">{s.name}: </span>
                                                                                    <span className="text-[var(--text-tertiary)] break-all">{s.link}</span>
                                                                                </div>
                                                                            ))}
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
                                                                                            {formatDate(addedDate)} • {formatTime(addedDate)}
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
                                                                        [...lead.comments]
                                                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                                            .map((comment, idx) => {
                                                                                const colorClass = ROLE_COLORS[comment.createdByRole] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
                                                                                const createdDate = new Date(comment.createdAt);
                                                                                return (
                                                                                    <div key={idx} className="p-2.5 rounded-xl bg-black/10 border border-[var(--border-primary)]/40 hover:border-emerald-500/20 transition-all">
                                                                                        <div className="flex items-center justify-between mb-1">
                                                                                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
                                                                                                {comment.createdByRole || 'Unknown'}
                                                                                            </span>
                                                                                            <span className="text-[7px] font-bold text-[var(--text-tertiary)] opacity-60">
                                                                                                {formatDate(createdDate)} • {formatTime(createdDate)}
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

            {/* Pagination — now driven by filtered results, not server total */}
            {totalFiltered > 0 && (
                <div className="flex items-center justify-between bg-[var(--bg-secondary)] px-4 py-3 rounded-lg border border-[var(--border-primary)]">
                    <div className="text-xs text-[var(--text-tertiary)]">
                        Showing <span className="font-semibold text-[var(--text-secondary)]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                        <span className="font-semibold text-[var(--text-secondary)]">{Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)}</span> of{' '}
                        <span className="font-semibold text-[var(--text-secondary)]">{totalFiltered}</span> results
                    </div>
                    {totalPages > 1 && (
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
                                        pageNum = Math.min(currentPage - 3 + i, totalPages);
                                    }
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
                    )}
                </div>
            )}

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

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-tertiary); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-secondary); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
            `}</style>
        </div>
    );
}