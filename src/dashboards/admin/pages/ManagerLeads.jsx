import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';

export default function ManagerLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFetching = React.useRef(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterMonth, setFilterMonth] = useState('ALL');
    const [stageFilter, setStageFilter] = useState('ALL'); // ALL, MANAGER, DONE, REJECTED

    // New states for expandable rows and modal
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedLead, setSelectedLead] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const fetchAllLeads = async () => {
        if (isFetching.current) return;
        try {
            isFetching.current = true;
            setLoading(true);
            console.log('🎯 ManagerLeads: Fetching all relevant leads');

            // Fetch all leads in one call instead of 5 separate calls for each stage
            const response = await adminAPI.getAllLeads(2000, 0);

            if (response.success) {
                const managerStages = ['MANAGER', 'DONE', 'COMPLETED', 'REJECTED', 'MANAGER_APPROVED'];
                const allManagerLeads = (response.leads || []).filter(lead =>
                    managerStages.includes(lead.stage)
                );
                setLeads(allManagerLeads);
            }
        } catch (error) {
            console.error('❌ ManagerLeads: Error fetching leads:', error);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    };

    // Fetch leads on mount
    useEffect(() => {
        fetchAllLeads();
    }, []);

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            // Stage Filter
            if (stageFilter !== 'ALL' && l.stage !== stageFilter) return false;

            if (filterDate) {
                const d = new Date(l.assignedAt || l.createdAt);
                if (!isNaN(d.getTime())) {
                    const rowDate = d.toISOString().split('T')[0];
                    if (rowDate !== filterDate) return false;
                }
            }
            if (filterMonth !== 'ALL') {
                const d = new Date(l.assignedAt || l.createdAt);
                if (!isNaN(d.getTime())) {
                    const rowMonth = d.getMonth().toString();
                    if (rowMonth !== filterMonth) return false;
                }
            }
            return true;
        });
    }, [leads, filterDate, filterMonth, stageFilter]);

    const toggleRowExpansion = (leadId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(leadId)) {
            newExpanded.delete(leadId);
        } else {
            newExpanded.add(leadId);
        }
        setExpandedRows(newExpanded);
    };

    const openContactModal = (lead) => {
        setSelectedLead(lead);
        setShowContactModal(true);
    };

    if (loading && leads.length === 0) return <SharedLoader />;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500 opacity-5 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:opacity-10" />

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
                                All Manager <span className="text-[var(--accent-primary)]">Leads</span>
                            </h1>
                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-4">

                        <select
                            value={stageFilter}
                            onChange={e => setStageFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs font-black text-[var(--text-primary)] outline-none ring-[var(--accent-primary)]/20 focus:ring-2 cursor-pointer"
                        >
                            <option value="ALL">All Stages</option>
                            <option value="MANAGER">Active Deals</option>
                            <option value="DONE">Completed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-primary)] outline-none ring-[var(--accent-primary)]/20 focus:ring-2"
                        />
                    </div>
                </div>
            </div>

            {/* EXCEL-LIKE TABLE VIEW */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">#</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Deal / Prospect</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Status</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Contact Info</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Industry</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Manager</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Assigned</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]/50">
                            {filteredLeads.map((lead, index) => {
                                const isExpanded = expandedRows.has(lead._id);
                                return (
                                    <React.Fragment key={lead._id}>
                                        <tr className="hover:bg-[var(--bg-tertiary)]/50 transition-colors group cursor-default">
                                            <td className="px-4 py-2 align-middle text-xs font-bold text-[var(--text-tertiary)]">{index + 1}</td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-600 font-black text-xs border border-orange-500/10">
                                                        {lead.name?.[0] || 'D'}
                                                    </div>
                                                    <div className="max-w-[160px]">
                                                        <div className="font-bold text-[var(--text-primary)] text-sm break-words">{lead.name || 'Anonymous'}</div>
                                                        <div className="text-[9px] text-[var(--text-tertiary)] font-medium">📍 {lead.location || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-md border w-fit ${lead.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : lead.status === 'UNPAID' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                        {lead.status || 'PENDING'}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase border w-fit ${lead.stage === 'MANAGER' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : lead.stage === 'DONE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                                        {lead.stage === 'MANAGER' ? 'ACTIVE' : lead.stage}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-[var(--text-secondary)]">📧 {lead.emails?.length || 0}</span></div>
                                                    <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-[var(--text-secondary)]">📞 {lead.phones?.length || 0}</span></div>
                                                    <button onClick={() => openContactModal(lead)} className="ml-2 px-2 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded text-[8px] font-black uppercase hover:bg-[var(--accent-primary)]/20 transition-all">View All</button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[8px] font-black uppercase border border-[var(--border-primary)]">{lead.industry || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)] flex items-center justify-center text-[9px] font-black text-[var(--text-primary)] border border-[var(--border-primary)]">{lead.assignedTo?.name?.[0] || 'M'}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-primary)]">{lead.assignedTo?.name || 'Unassigned'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex flex-col"><span className="text-[10px] font-black text-[var(--text-primary)]">{lead.assignedAt ? `Assigned: ${new Date(lead.assignedAt).toLocaleDateString('en-GB')}` : 'Not Assigned'}</span></div>
                                            </td>
                                            <td className="px-4 py-2 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => toggleRowExpansion(lead._id)} className="p-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 transition-all">
                                                        <svg className={`w-3 h-3 text-[var(--text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </button>
                                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{lead.comments?.length || 0} logs</span>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-[var(--bg-tertiary)]/30">
                                                <td colSpan="8" className="px-4 py-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="space-y-2">
                                                            <h4 className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">Timeline</h4>
                                                            <div className="text-[9px] space-y-1">
                                                                <div>Assigned: {lead.assignedAt ? new Date(lead.assignedAt).toLocaleDateString() : 'N/A'}</div>
                                                                <div>LQ Status: {lead.lqStatus || 'N/A'}</div>
                                                                <div>Source: {lead.responseSource?.type || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h4 className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">Primary Contact</h4>
                                                            {lead.responseSource?.value && (
                                                                <div className="flex items-center gap-2 p-2 bg-[var(--accent-primary)]/10 rounded border border-[var(--accent-primary)]/20 w-fit">
                                                                    <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full"></div>
                                                                    <span className="font-bold text-[var(--accent-primary)] text-[9px]">{lead.responseSource.value} ({lead.responseSource.type})</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {lead.lqUpdatedBy && (
                                                            <div className="space-y-2">
                                                                <h4 className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-wider">Qualified By</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-[8px] font-black text-purple-600 border border-purple-500/20">{lead.lqUpdatedBy.name?.[0]}</div>
                                                                    <span className="text-[9px] font-medium text-[var(--text-secondary)]">{lead.lqUpdatedBy.name}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <div className="py-24 text-center">
                            <p className="text-[var(--text-secondary)] font-black text-xl tracking-tight">No Active Deals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Details Modal */}
            {showContactModal && selectedLead && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slideUp">
                        <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)]">Contact Intelligence</h3>
                            <button onClick={() => setShowContactModal(false)} className="p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all text-[var(--text-tertiary)]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-[var(--text-tertiary)] border-b border-[var(--border-primary)] pb-2 flex items-center gap-2">📧 Emails</h4>
                                    <div className="space-y-2">
                                        {selectedLead.emails?.map((email, i) => (
                                            <div key={i} className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px] font-bold text-[var(--text-primary)] flex justify-between items-center">
                                                <span>{typeof email === 'object' ? email.value : email}</span>
                                                <button onClick={() => navigator.clipboard.writeText(typeof email === 'object' ? email.value : email)} className="text-[var(--accent-primary)] hover:underline">Copy</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-[var(--text-tertiary)] border-b border-[var(--border-primary)] pb-2 flex items-center gap-2">📞 Phones</h4>
                                    <div className="space-y-2">
                                        {selectedLead.phones?.map((phone, i) => (
                                            <div key={i} className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px] font-bold text-[var(--text-primary)] flex justify-between items-center">
                                                <span>{typeof phone === 'object' ? phone.value : phone}</span>
                                                <button onClick={() => navigator.clipboard.writeText(typeof phone === 'object' ? phone.value : phone)} className="text-[var(--accent-primary)] hover:underline">Copy</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
