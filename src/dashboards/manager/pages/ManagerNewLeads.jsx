import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { managerAPI } from '../../../api/manager.api';
import SharedLoader from '../../../components/SharedLoader';

// Import components
import SearchHeader from '../components/SearchHeader';
import AdminApprovedBanner from '../components/AdminApprovedBanner';
import PendingLeadsTable from '../components/PendingLeadsTable';
import RejectModal from '../components/RejectModal';
import UpsellModal from '../components/UpsellModal';
import LeadDetailModal from '../components/LeadDetailModal';

const ITEMS_PER_PAGE = 20;

// A "high enough" ceiling for a single fetch so tabs/search/pagination can be
// computed consistently on the client. If the backend ever exposes
// tab/search-aware pagination, swap this file back to server-driven paging
// (see the note at the bottom of fetchLeads).
const FETCH_LIMIT = 2000;

const TABS = [
    {
        id: 'normal',
        label: 'Normal Leads',
        activeClasses: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
        badgeActiveClasses: 'bg-white/20 text-white',
        badgeInactiveClasses: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        ),
    },
    {
        id: 'meta',
        label: 'Meta Leads',
        activeClasses: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
        badgeActiveClasses: 'bg-white/20 text-white',
        badgeInactiveClasses: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        ),
    },
];

function TabButton({ tab, count, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`relative flex items-center gap-2.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                isActive
                    ? tab.activeClasses
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
        >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {tab.icon}
            </svg>
            {tab.label}
            {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                    isActive ? tab.badgeActiveClasses : tab.badgeInactiveClasses
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

export default function ManagerNewLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);      // true only for the very first load
    const [refreshing, setRefreshing] = useState(false); // background refetches after that
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [activeTab, setActiveTab] = useState('normal'); // 'normal' | 'meta'

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showUpsellModal, setShowUpsellModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form data states
    const [rejectData, setRejectData] = useState({ reason: '', comment: '' });
    const [upsellData, setUpsellData] = useState({ type: 'paid', price: '', comment: '' });

    // Guards against out-of-order responses (e.g. rapid refresh clicks) clobbering
    // fresher state, and lets us clean up the copy-to-clipboard timeout on unmount.
    const requestIdRef = useRef(0);
    const copyTimeoutRef = useRef(null);

    const fetchLeads = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        try {
            setError(null);
            if (leads.length === 0) setLoading(true);
            else setRefreshing(true);

            // NOTE: fetched once at a high limit so that tab split, search, and
            // pagination all operate on the same complete dataset (see FETCH_LIMIT).
            // If the API adds server-side tab/search filters, prefer passing
            // { tab: activeTab, search: searchTerm, limit: ITEMS_PER_PAGE, skip }
            // here instead and drop the client-side slicing below.
            const response = await managerAPI.getMyLeads({ limit: FETCH_LIMIT, skip: 0 });

            // Ignore this result if a newer request has since been kicked off.
            if (requestId !== requestIdRef.current) return;

            if (response.success) {
                setLeads(response.leads || []);
            } else {
                setError('Could not load leads. Please try again.');
            }
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error('Failed to fetch manager leads', err);
            setError(err.response?.data?.message || 'Failed to load leads. Please try again.');
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Reset to page 1 whenever the tab or search changes, since the result set changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const handleCopy = useCallback((text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
    }, []);

    // Single pass: drop paid / rejection-pending / priority-banner leads, then split by source.
    const { normalLeads, metaLeads } = useMemo(() => {
        const normal = [];
        const meta = [];
        for (const l of leads) {
            if (l.rejectionRequested === true || l.status === 'PAID' || l.superAdminReturnPriorityUntil) {
                continue;
            }
            (l.source === 'META_LEAD' ? meta : normal).push(l);
        }
        return { normalLeads: normal, metaLeads: meta };
    }, [leads]);

    const matchesSearch = useCallback((lead, term, isMeta) => {
        if (isMeta) {
            return (
                (lead.name || lead.fullName || '').toLowerCase().includes(term) ||
                (lead.email || '').toLowerCase().includes(term) ||
                (lead.number || '').toLowerCase().includes(term) ||
                (lead.program || '').toLowerCase().includes(term) ||
                (lead.school || '').toLowerCase().includes(term)
            );
        }
        return (
            (lead.name || '').toLowerCase().includes(term) ||
            (lead.responseSource?.emails?.some(e => (e.value || '').toLowerCase().includes(term))) ||
            (lead.responseSource?.email?.value || '').toLowerCase().includes(term) ||
            (lead.responseSource?.phones?.some(p => (p.value || '').toLowerCase().includes(term))) ||
            (lead.responseSource?.phone?.value || '').toLowerCase().includes(term)
        );
    }, []);

    // Full filtered set for the active tab (search applied), independent of pagination.
    const filteredLeads = useMemo(() => {
        const pool = activeTab === 'meta' ? metaLeads : normalLeads;
        if (!searchTerm.trim()) return pool;
        const term = searchTerm.trim().toLowerCase();
        const isMeta = activeTab === 'meta';
        return pool.filter(l => matchesSearch(l, term, isMeta));
    }, [activeTab, normalLeads, metaLeads, searchTerm, matchesSearch]);

    const totalFiltered = filteredLeads.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

    // Keep currentPage in range if the filtered set shrinks (e.g. a lead gets resolved).
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    // The actual page of rows the table renders.
    const pageLeads = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLeads, currentPage]);

    const handleRejectClick = useCallback((lead) => { setSelectedLead(lead); setShowRejectModal(true); }, []);
    const handleUpsellClick = useCallback((lead) => { setSelectedLead(lead); setShowUpsellModal(true); }, []);
    const handleDetailClick = useCallback((lead) => { setSelectedLead(lead); setShowDetailModal(true); }, []);

    const handleRejectConfirm = useCallback(async () => {
        if (!selectedLead) return;
        const comment = (rejectData.comment || rejectData.reason || '').trim();
        if (!comment) { alert('Please provide a reason or comment for rejection'); return; }
        try {
            await managerAPI.requestRejection(selectedLead._id, comment);
            setShowRejectModal(false);
            setRejectData({ reason: '', comment: '' });
            fetchLeads();
        } catch (err) {
            console.error('Failed to request rejection', err);
            alert('Failed to send rejection request: ' + (err.response?.data?.message || err.message));
        }
    }, [selectedLead, rejectData, fetchLeads]);

    const handleUpsellConfirm = useCallback(async () => {
        if (!selectedLead) return;
        const amount = parseFloat(upsellData.price);
        if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount'); return; }
        if (!upsellData.comment.trim()) { alert('Please add a comment'); return; }
        try {
            await managerAPI.markAsPaid(selectedLead._id, amount, upsellData.comment);
            setShowUpsellModal(false);
            setUpsellData({ type: 'paid', price: '', comment: '' });
            fetchLeads();
        } catch (err) {
            console.error('Failed to record payment', err);
            alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
        }
    }, [selectedLead, upsellData, fetchLeads]);

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6 lg:p-8 font-sans">
            <div className="space-y-6">
                <SearchHeader
                    title="New Leads"
                    subtitle=""
                    onRefresh={fetchLeads}
                    loading={refreshing}
                    stats={`${leads.length} leads`}
                    statsColor="emerald"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-4">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={fetchLeads}
                            className="shrink-0 text-[10px] font-black uppercase tracking-wide text-red-300 hover:text-white transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <AdminApprovedBanner leads={leads} onUpsell={handleUpsellClick} />

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)] border border-white/5 rounded-2xl w-fit shadow-lg">
                    {TABS.map(tab => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            count={tab.id === 'meta' ? metaLeads.length : normalLeads.length}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>

                <PendingLeadsTable
                    leads={pageLeads}
                    isMetaTab={activeTab === 'meta'}
                    onReject={handleRejectClick}
                    onUpsell={handleUpsellClick}
                    onDetail={handleDetailClick}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={totalFiltered}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>

            <RejectModal
                isOpen={showRejectModal}
                lead={selectedLead}
                onClose={() => { setShowRejectModal(false); setRejectData({ reason: '', comment: '' }); }}
                onConfirm={handleRejectConfirm}
                rejectData={rejectData}
                setRejectData={setRejectData}
            />

            <UpsellModal
                isOpen={showUpsellModal}
                lead={selectedLead}
                onClose={() => { setShowUpsellModal(false); setUpsellData({ type: 'paid', price: '', comment: '' }); }}
                onConfirm={handleUpsellConfirm}
                upsellData={upsellData}
                setUpsellData={setUpsellData}
            />

            <LeadDetailModal
                isOpen={showDetailModal}
                lead={selectedLead}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
}