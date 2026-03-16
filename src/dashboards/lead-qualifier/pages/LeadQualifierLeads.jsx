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
    const itemsPerPage = 20;

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
        updateLeadStatus,
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

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Client-side search filtering (respecting API order)
    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;

        return leads.filter(lead => {
            const matchesSearch = (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.emails?.some(e => (e.value || '').toLowerCase().includes(searchTerm.toLowerCase()))) ||
                (lead.phones?.some(p => (p || '').toLowerCase().includes(searchTerm.toLowerCase())));

            return matchesSearch;
        });
    }, [leads, searchTerm]);

    // Reset to page 1 when filters change
    const handleFilterChange = (callback) => {
        setCurrentPage(1);
        callback();
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
            notification.className = `fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${type === 'warning' ? 'bg-rose-500 border border-rose-600' : 'bg-blue-500 border border-blue-600'} text-white`;
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

                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full xl:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-[var(--accent-primary)]/10 rounded-2xl text-[var(--accent-primary)] shadow-inner">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">Lead Qualifier Pipeline</h1>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        refreshLeads();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)] rounded-xl text-[var(--accent-primary)] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm group cursor-pointer relative z-10"
                                    title="Refresh leads"
                                >
                                    <svg className="w-5 h-5 text-[var(--accent-primary)] group-hover:text-white transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] group-hover:text-white transition-all pointer-events-none select-none">
                                        Refresh
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
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
                <div className="overflow-x-auto">
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
                            {filteredLeads.map((lead) => (
                                <LeadTableRow
                                    key={lead._id}
                                    lead={lead}
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
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Pipeline Empty</h3>
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
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 md:p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-[9px] md:text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                onClose={() => setIsAssignModalOpen(false)}
                selectedLead={activeLead}
                onAssign={async (data) => {
                    const success = await assignLeadManager(
                        data.leadId,
                        data.selectedEmails,
                        data.selectedPhones
                    );
                    if (success) setIsAssignModalOpen(false);
                }}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `
            }} />
        </div>
    );
}