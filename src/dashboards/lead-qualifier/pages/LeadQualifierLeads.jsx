import React, { useState, useMemo, useEffect } from 'react';
import { useLeadManager } from '../hooks/useLeadManager';
import { useLeadFilters } from '../hooks/useLeadFilters';
import SharedLoader from '../../../components/SharedLoader';

// Components
import LeadFilters from '../components/LeadFilters';
import LeadTableRow from '../components/LeadTableRow';
import ContactDetailsModal from '../components/ContactDetailsModal';
import LeadTimelineModal from '../components/LeadTimelineModal';
import AssignManagerModal from '../components/AssignManagerModal';

export default function LeadQualifierLeads() {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Filter states
    const {
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        dateFilter,
        setDateFilter,
        customFromDate,
        setCustomFromDate,
        customToDate,
        setCustomToDate,
        showToDatePicker,
        setShowToDatePicker,
        searchReady,
        setSearchReady,
        apiFilters
    } = useLeadFilters();

    // Lead management with filters and pagination
    const {
        leads,
        loading,
        error,
        total,
        filtersApplied,
        refreshing,
        updateLeadStatus,
        updateBulkLeadStatus,
        addLeadComment,
        assignLeadManager,
        refreshLeads
    } = useLeadManager(apiFilters, currentPage, itemsPerPage);

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [transferError, setTransferError] = useState(null);

    // Bulk action states
    const [isBulkMarkModalOpen, setIsBulkMarkModalOpen] = useState(false);
    const [pendingLeadIdsToMark, setPendingLeadIdsToMark] = useState([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCopyAllEmails = () => {
        const activeEmails = filteredLeads.flatMap(lead =>
            lead.emails?.filter(e => e.status === 'ACTIVE').map(e => e.value) || []
        ).filter(Boolean);

        if (activeEmails.length > 0) {
            navigator.clipboard.writeText(activeEmails.join('\n'));
            window.showCustomNotification({
                type: 'success',
                title: 'Active Emails Copied',
                message: `Successfully copied ${activeEmails.length} ACTIVE emails from the active page.`,
                duration: 3000
            });
        } else {
            window.showCustomNotification({
                type: 'warning',
                title: 'No Active Emails',
                message: 'No ACTIVE emails found on the current page to copy.',
                duration: 3000
            });
        }
    };

    const handleCopyPrimaryNumbers = () => {
        const allNumbers = filteredLeads
            .map(lead => {
                const firstPhone = lead.phones?.[0];
                return typeof firstPhone === 'object'
                    ? (firstPhone?.value || firstPhone?.number)
                    : firstPhone;
            })
            .filter(Boolean);
        if (allNumbers.length > 0) {
            navigator.clipboard.writeText(allNumbers.join('\n'));
            window.showCustomNotification({
                type: 'success',
                title: 'Numbers Copied',
                message: `Successfully copied ${allNumbers.length} phone numbers from the active page.`,
                duration: 3000
            });
        } else {
            window.showCustomNotification({
                type: 'warning',
                title: 'No Numbers',
                message: 'No phone numbers found on the current page to copy.',
                duration: 3000
            });
        }
    };
    const handleCopySecondaryNumbers = () => {
        const allNumbers = filteredLeads
            .flatMap(lead =>
                lead.phones?.slice(1).map(p =>
                    typeof p === 'object' ? (p.value || p.number) : p
                ) || []
            )
            .filter(Boolean);

        if (allNumbers.length > 0) {
            navigator.clipboard.writeText(allNumbers.join('\n'));
            window.showCustomNotification({
                type: 'success',
                title: 'Numbers Copied',
                message: `Successfully copied ${allNumbers.length} secondary phone numbers.`,
                duration: 3000
            });
        } else {
            window.showCustomNotification({
                type: 'warning',
                title: 'No Numbers',
                message: 'No secondary phone numbers found.',
                duration: 3000
            });
        }
    };
    const handleOpenBulkMark = () => {
        // filter out leads that are strictly PENDING. Adjust the condition if status text differs.
        const pendingIds = filteredLeads.filter(l => l.lqStatus === "PENDING").map(l => l._id);
        if (pendingIds.length === 0) {
            window.showCustomNotification({
                type: 'warning',
                title: 'No Pending Leads',
                message: 'No pending leads found on this page to mark as REACHED.',
                duration: 3000
            });
            return;
        }
        setPendingLeadIdsToMark(pendingIds);
        setIsBulkMarkModalOpen(true);
    };

    const handleConfirmBulkMark = async () => {
        setIsBulkUpdating(true);
        const success = await updateBulkLeadStatus(pendingLeadIdsToMark, "REACHED");
        setIsBulkUpdating(false);

        if (success) {
            window.showCustomNotification({
                type: 'success',
                title: 'Bulk Update Successful',
                message: `Successfully marked ${pendingLeadIdsToMark.length} lead(s) as REACHED.`,
                duration: 3000
            });
            setIsBulkMarkModalOpen(false);
        } else {
            window.showCustomNotification({
                type: 'warning',
                title: 'Update Failed',
                message: 'Could not bulk update leads. Please try again.',
                duration: 3000
            });
        }
    };

    // Client-side search filtering (respecting API order)
    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;

        const searchLower = searchTerm.toLowerCase();
        return leads.filter(lead => {
            const matchesSearch = (lead.name || '').toLowerCase().includes(searchLower) ||
                (lead.emails?.some(e => (e.value || '').toLowerCase().includes(searchLower))) ||
                (lead.phones?.some(p => {
                    const phoneVal = typeof p === 'object' ? (p.value || p.number || '') : (p || '');
                    return phoneVal.toString().toLowerCase().includes(searchLower);
                }));

            return matchesSearch;
        });
    }, [leads, searchTerm]);

    // Reset to page 1 when filters change
    const handleFilterChange = (callback) => {
        setCurrentPage(1);
        callback();
    };

    const handlePageChange = (newPage) => {
        if (newPage === currentPage) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(newPage);
    };

    // Sync selected lead with fresh data from leads array
    const activeLead = useMemo(() => {
        if (!selectedLead) return null;
        return leads.find(l => l._id === selectedLead._id) || selectedLead;
    }, [leads, selectedLead]);

    const totalPages = Math.ceil(total / itemsPerPage);

    // Global notification function
    useEffect(() => {
        window.showCustomNotification = ({ type, title, message, duration = 3000 }) => {
            const notification = document.createElement('div');
            notification.className = `fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${type === 'warning' ? 'bg-rose-500 border border-rose-600' : type === 'success' ? 'bg-[var(--accent-primary)] border border-[var(--accent-primary)]' : 'bg-blue-500 border border-blue-600'} text-white`;
            notification.style.transform = 'translateX(100%)';
            notification.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-white">${title}</h4>
                        <p class="text-sm text-white/90 mt-1">${message}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-sm text-white/80 hover:text-white">✕</button>
                </div>
            `;
            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Auto-remove
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, duration);
        };
    }, []);

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-fadeIn min-h-screen">
            {/* Error Notification */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold animate-fadeIn">
                    ⚠ {error}
                </div>
            )}

            {/* Header Section */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-4 md:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-[var(--accent-primary)]/10 rounded-2xl text-[var(--accent-primary)] shadow-inner border border-[var(--accent-primary)]/20">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black leading-none uppercase mb-0.5 opacity-60 tracking-tighter">AL</span>
                                    <span className="text-base font-black leading-none">{total || 0}</span>
                                </div>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight whitespace-nowrap">All Leads</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    console.log('Leads refresh button clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    refreshLeads();
                                }}
                                disabled={refreshing}
                                className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl transition-all shadow-sm group cursor-pointer relative z-10 ${refreshing
                                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] opacity-75 cursor-not-allowed'
                                    : 'bg-[var(--bg-tertiary)]/40 border-[var(--border-primary)] text-[var(--accent-primary)] hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                    }`}
                                title={refreshing ? "Refreshing..." : "Refresh leads"}
                            >
                                <svg className={`w-5 h-5 transition-colors pointer-events-none ${refreshing ? 'animate-spin text-white' : 'text-[var(--accent-primary)] group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className={`text-[10px] font-black uppercase tracking-wider transition-all pointer-events-none select-none ${refreshing ? 'text-white' : 'text-[var(--accent-primary)] group-hover:text-white'
                                    }`}>
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyAllEmails}
                                className="flex items-center gap-2 px-3 py-2.5 border rounded-xl transition-all shadow-sm group cursor-pointer relative z-10 bg-[var(--bg-tertiary)]/40 border-[var(--border-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:!text-white hover:border-[var(--accent-primary)]"
                                title="Copy all ACTIVE emails on this page"
                            >
                                <svg className="w-5 h-5 transition-colors pointer-events-none group-hover:!text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider transition-all pointer-events-none select-none group-hover:!text-white">
                                    Copy Active Emails
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyPrimaryNumbers}
                                className="flex items-center gap-2 px-3 py-2.5 border rounded-xl transition-all shadow-sm group cursor-pointer relative z-10 bg-[var(--bg-tertiary)]/40 border-[var(--border-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:!text-white hover:border-[var(--accent-primary)]"
                                title="Copy all phone numbers on this page"
                            >
                                <svg className="w-5 h-5 transition-colors pointer-events-none group-hover:!text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider transition-all pointer-events-none select-none group-hover:!text-white">
                                    Copy Primary
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCopySecondaryNumbers}
                                className="flex items-center gap-2 px-3 py-2.5 border rounded-xl transition-all shadow-sm group cursor-pointer relative z-10 bg-[var(--bg-tertiary)]/40 border-[var(--border-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:!text-white hover:border-[var(--accent-primary)]"
                                title="Copy all phone numbers on this page"
                            >
                                <svg className="w-5 h-5 transition-colors pointer-events-none group-hover:!text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider transition-all pointer-events-none select-none group-hover:!text-white">
                                    Copy Secondary
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenBulkMark}
                                className="flex items-center gap-2 px-3 py-2.5 border rounded-xl transition-all shadow-sm group cursor-pointer relative z-10 bg-[var(--bg-tertiary)]/40 border-[var(--border-primary)] text-orange-500 hover:bg-orange-500 hover:!text-white hover:border-orange-500"
                                title="Mark all pending leads on this page as REACHED"
                            >
                                <svg className="w-5 h-5 transition-colors pointer-events-none group-hover:!text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider transition-all pointer-events-none select-none group-hover:!text-white">
                                    Mark All REACHED
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <LeadFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            dateFilter={dateFilter}
                            setDateFilter={(value) => handleFilterChange(() => setDateFilter(value))}
                            activeTab={activeTab}
                            setActiveTab={(value) => handleFilterChange(() => setActiveTab(value))}
                            customFromDate={customFromDate}
                            setCustomFromDate={setCustomFromDate}
                            customToDate={customToDate}
                            setCustomToDate={setCustomToDate}
                            showToPicker={showToDatePicker}
                            setShowToPicker={setShowToDatePicker}
                            searchReady={searchReady}
                            setSearchReady={setSearchReady}
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] shadow-xl overflow-hidden relative animate-slideUp">
                {loading && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/30 overflow-hidden z-[50]">
                        <div className="w-1/2 h-full bg-blue-500 animate-[shimmer_1.5s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }}></div>
                    </div>
                )}
                <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-[900px]">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Lead / Prospect</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Contact Details</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">LQ Status</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Assign Date</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] text-right">Comments / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]/30">
                            {filteredLeads.map((lead, index) => (
                                <LeadTableRow
                                    key={lead._id}
                                    lead={lead}
                                    index={(currentPage - 1) * itemsPerPage + index + 1}
                                    onViewInfo={(l) => { setSelectedLead(l); setIsContactModalOpen(true); }}
                                    handleUpdateStatus={updateLeadStatus}
                                    onOpenComments={(l) => { setSelectedLead(l); setIsTimelineModalOpen(true); }}
                                    onOpenAssign={(l) => { setSelectedLead(l); setIsAssignModalOpen(true); }}
                                    handleCopy={handleCopy}
                                    copiedId={copiedId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLeads.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="inline-flex p-6 rounded-3xl bg-[var(--bg-tertiary)]/30 border border-dashed border-[var(--border-primary)] text-[var(--text-tertiary)] mb-4">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">No Leads</h3>
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-2 tracking-widest">No matching leads found for current criteria</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-4 md:px-6 py-3 md:py-4 bg-[var(--bg-tertiary)]/20 border-t border-[var(--border-primary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-[9px] md:text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">
                        Displaying <span className="text-[var(--text-primary)]">{filteredLeads.length}</span> of <span className="text-[var(--text-primary)]">{total}</span> Records
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 md:p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-[9px] md:text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 md:p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ContactDetailsModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                selectedLead={activeLead}
                onCopy={handleCopy}
                copiedId={copiedId}
            />

            <LeadTimelineModal
                isOpen={isTimelineModalOpen}
                onClose={() => setIsTimelineModalOpen(false)}
                selectedLead={activeLead}
                onAddComment={async (text) => {
                    const success = await addLeadComment(activeLead._id, text);
                    return success;
                }}
            />

            <AssignManagerModal
                isOpen={isAssignModalOpen}
                onClose={() => { setIsAssignModalOpen(false); setTransferError(null); }}
                selectedLead={activeLead}
                onAssign={async (data) => {
                    const result = await assignLeadManager(
                        data.leadId,
                        data.selectedEmails,
                        data.selectedPhones
                    );
                    if (result.success) {
                        setIsAssignModalOpen(false);
                        setTransferError(null);
                    } else {
                        setTransferError(result.message);
                    }
                }}
                error={transferError}
            />

            {/* Bulk Mark Confirmation Modal */}
            {isBulkMarkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isBulkUpdating && setIsBulkMarkModalOpen(false)}></div>
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-orange-500/10 text-orange-500 rounded-full mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M9 16h.01m12-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>

                        <h3 className="text-xl font-black text-[var(--text-primary)] text-center mb-2 tracking-tight">
                            Confirm Bulk Update
                        </h3>
                        <p className="text-sm font-medium text-[var(--text-tertiary)] text-center mb-8">
                            Are you sure you want to mark <span className="text-[var(--accent-primary)] font-bold">{pendingLeadIdsToMark.length}</span> pending leads as <span className="text-orange-500 font-bold">REACHED</span>? Only leads currently matching these criteria on this page will be updated.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsBulkMarkModalOpen(false)}
                                disabled={isBulkUpdating}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/80 transition-all border border-[var(--border-primary)] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBulkMark}
                                disabled={isBulkUpdating}
                                className="flex-[2] py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isBulkUpdating ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    'Yes, Mark as Reached'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                `
            }} />
        </div>
    );
}