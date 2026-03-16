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

export default function ManagerNewLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showUpsellModal, setShowUpsellModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form data states
    const [rejectData, setRejectData] = useState({ reason: '', comment: '' });
    const [upsellData, setUpsellData] = useState({
        type: 'paid',
        price: '',
        comment: ''
    });

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const response = await managerAPI.getMyLeads({ limit: ITEMS_PER_PAGE, skip });

            if (response.success) {
                setLeads(response.leads || []);
                setTotal(response.totalLeads || 0);
            }
        } catch (err) {
            console.error("Failed to fetch manager leads", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const pendingLeads = useMemo(() => {
        // Filter out leads that have a pending rejection request, are already paid,
        // or are specifically flagged to show in the Admin Rejected Banner
        const baseLeads = leads.filter(l =>
            l.rejectionRequested !== true &&
            l.status !== 'PAID' &&
            !l.superAdminReturnPriorityUntil
        );

        if (!searchTerm) return baseLeads;
        const term = searchTerm.toLowerCase();
        return baseLeads.filter(l =>
            (l.name || '').toLowerCase().includes(term) ||
            (l.responseSource?.emails?.some(e => (e.value || '').toLowerCase().includes(term))) ||
            (l.responseSource?.email?.value || '').toLowerCase().includes(term) ||
            (l.responseSource?.phones?.some(p => (p.value || '').toLowerCase().includes(term))) ||
            (l.responseSource?.phone?.value || '').toLowerCase().includes(term)
        );
    }, [leads, searchTerm]);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleRejectClick = (lead) => {
        setSelectedLead(lead);
        setShowRejectModal(true);
    };

    const handleUpsellClick = (lead) => {
        setSelectedLead(lead);
        setShowUpsellModal(true);
    };

    const handleDetailClick = (lead) => {
        setSelectedLead(lead);
        setShowDetailModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedLead) return;
        try {
            const comment = rejectData.comment || rejectData.reason;
            if (!comment.trim()) {
                alert("Please provide a reason or comment for rejection");
                return;
            }
            await managerAPI.requestRejection(selectedLead._id, comment);
            setShowRejectModal(false);
            setRejectData({ reason: '', comment: '' });
            fetchLeads();
        } catch (err) {
            console.error("Failed to request rejection", err);
            alert("Failed to send rejection request: " + (err.response?.data?.message || err.message));
        }
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
            fetchLeads();
        } catch (err) {
            console.error("Failed to record payment", err);
            alert("Failed to record payment: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6 lg:p-8 font-sans">
            <div className="space-y-6">
                <SearchHeader
                    title="New Leads"
                    subtitle=""
                    onRefresh={fetchLeads}
                    loading={loading}
                    stats={`${total} leads`}
                    statsColor="emerald"
                />

                <AdminApprovedBanner leads={leads} onUpsell={handleUpsellClick} />

                <PendingLeadsTable
                    leads={pendingLeads}
                    onReject={handleRejectClick}
                    onUpsell={handleUpsellClick}
                    onDetail={handleDetailClick}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={total}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>

            <RejectModal
                isOpen={showRejectModal}
                lead={selectedLead}
                onClose={() => {
                    setShowRejectModal(false);
                    setRejectData({ reason: '', comment: '' });
                }}
                onConfirm={handleRejectConfirm}
                rejectData={rejectData}
                setRejectData={setRejectData}
            />

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

            <LeadDetailModal
                isOpen={showDetailModal}
                lead={selectedLead}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
}