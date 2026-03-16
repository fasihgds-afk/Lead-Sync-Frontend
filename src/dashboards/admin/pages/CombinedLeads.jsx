import React, { useState, useEffect } from 'react';
import { combinedAPI } from '../../../api/combined.api';
import SharedLoader from '../../../components/SharedLoader';

const CombinedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    stage: '',
    lqStatus: ''
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    itemsPerPage: 20
  });

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCombinedLeads();
  }, [filters, pagination.currentPage, debouncedSearchTerm]);

  const fetchCombinedLeads = async () => {
    try {
      setLoading(true);
      const skip = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const filterParams = { ...filters, search: debouncedSearchTerm };
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === '' || filterParams[key] === null) {
          delete filterParams[key];
        }
      });

      const response = await combinedAPI.getAllLeadsCombined(
        pagination.itemsPerPage,
        skip,
        filterParams
      );

      if (response.success) {
        setLeads(response.leads || []);
        let totalLeads = response.total || 0;
        if (filters.stage) {
          const s = filters.stage.trim().toUpperCase();
          if (s === 'DM' && response.counts?.dm !== undefined) totalLeads = response.counts.dm;
          else if (s === 'VERIFIER' && response.counts?.verifier !== undefined) totalLeads = response.counts.verifier;
          else if (s === 'LQ' && response.counts?.lq !== undefined) totalLeads = response.counts.lq;
        }
        if (totalLeads < (response.leads?.length || 0)) totalLeads = response.leads.length;
        const totalPages = Math.ceil(totalLeads / pagination.itemsPerPage);
        setPagination(prev => ({
          ...prev,
          totalPages: totalPages || 1,
          totalLeads: totalLeads
        }));
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const filterOptions = {
    stages: ['DM', 'Verifier', 'LQ', 'DONE'],
    lqStatuses: ['PENDING', 'IN_CONVERSATION', 'DEAD', 'QUALIFIED']
  };

  const openContactDetails = (lead) => setSelectedLead(lead);
  const closeContactDetails = () => {
    setSelectedLead(null);
    setCopiedId(null);
  };

  const getLeadExtendedStatus = (lead) => {
    if (lead.status === 'PAID') return { label: 'PAID SELL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (lead.upsales?.length > 0) return { label: 'UPSELL', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    if (lead.stage === 'REJECTED' || lead.status === 'REJECTED') return { label: 'REJECTED', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    if (lead.rejectionRequested) return { label: 'UNPAID REJECT', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (lead.stage === 'DONE' || lead.stage === 'MANAGER') return { label: lead.status || 'UNPAID', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    return { label: lead.status || 'PENDING', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPKT = (dateString, type) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      if (type === 'date') {
        return date.toLocaleDateString('en-PK', {
          timeZone: 'Asia/Karachi',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      if (type === 'full') {
        return date.toLocaleString('en-PK', {
          timeZone: 'Asia/Karachi',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }
      return date.toLocaleTimeString('en-PK', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isInitialLoading) return <SharedLoader />;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Header Stats Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[var(--accent-success)]/10 rounded-2xl text-[var(--accent-success)] shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase">All <span className="text-[var(--accent-success)]">Leads</span></h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-60">Total Leads</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{pagination.totalLeads}</span>
                  <span className="text-[9px] font-bold text-[var(--accent-success)]/60 uppercase">Leads</span>
                </div>
              </div>
            </div>
            <div className="flex items-center bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)]/40 rounded-full px-3 py-1 gap-3">
              <button onClick={() => fetchCombinedLeads()} className="w-7 h-7 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full border border-[var(--border-primary)] hover:bg-[var(--accent-success)] hover:text-white transition-all shadow-sm">
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[var(--accent-success)] animate-pulse" /><span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)]"></span></div>
                <span className="text-[9px] font-black text-[var(--text-primary)] mt-0.5">Refresh</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select value={filters.stage} onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))} className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-xs font-black text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 uppercase tracking-widest cursor-pointer transition-all">
              <option value="">ALL STAGES</option>
              {filterOptions.stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
            </select>
            {(!filters.stage || filters.stage === 'LQ') && (
              <select value={filters.lqStatus} onChange={(e) => setFilters(prev => ({ ...prev, lqStatus: e.target.value }))} className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-xs font-black text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-success)]/20 uppercase tracking-widest cursor-pointer transition-all">
                <option value="">LQ STATUS</option>
                {filterOptions.lqStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] shadow-xl overflow-hidden animate-slideUp relative">
        {loading && !isInitialLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent-success)]/30 overflow-hidden z-[50]">
            <div className="w-1/2 h-full bg-[var(--accent-success)] animate-[shimmer_1.5s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-success), transparent)' }}></div>
          </div>
        )}
        <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Lead Intelligence</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Contact Cluster</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Active Stage</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Assignment</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]/50">
              {leads.map((lead) => (
                <React.Fragment key={lead._id}>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50 transition-colors group">
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${lead.lqUpdatedBy ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{lead.name?.[0] || 'L'}</div>
                        <div className="max-w-[160px]">
                          <div className="font-bold text-[var(--text-primary)] text-sm break-words">{lead.name || 'Anonymous'}</div>
                          <div className="text-[9px] text-[var(--text-tertiary)] font-medium">📍 {lead.location || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-[var(--text-secondary)]">📧 {lead.emails?.length || 0}</span></div>
                        <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-[var(--text-secondary)]">📞 {lead.phones?.length || 0}</span></div>
                        {(lead.emails?.length > 0 || lead.phones?.length > 0) && (
                          <button onClick={() => openContactDetails(lead)} className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all flex items-center justify-center shadow-sm border border-[var(--accent-primary)]/20" title="View Intelligence Profile">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      {(() => {
                        const status = getLeadExtendedStatus(lead);
                        return <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${status.color}`}>{status.label}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">{lead.stage || 'DM'}</span>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="flex flex-col gap-1">
                        {lead.createdBy && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-[var(--text-secondary)]">{lead.createdBy.name} (DM)</span></div>}
                        {lead.lqUpdatedBy && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[8px] font-bold text-[var(--text-secondary)]">{lead.lqUpdatedBy.name} (LQ)</span></div>}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] text-[var(--text-tertiary)] font-bold">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => toggleRowExpansion(lead._id)} className={`p-1.5 rounded-lg border transition-all ${expandedRows[lead._id] ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 rotate-180' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:text-amber-500'}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[lead._id] && (
                    <tr className="bg-[var(--bg-tertiary)]/20 border-b border-[var(--border-primary)]/50 border-x-8 border-x-amber-500/10">
                      <td colSpan="6" className="p-0">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/30 pb-2"><span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Comments</span></div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              {lead.comments?.length > 0 ? lead.comments.map((comment, i) => (
                                <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] space-y-1 hover:border-amber-500/30 transition-colors">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">{comment.createdByRole}</span>
                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-80 tabular-nums">{formatPKT(comment.createdAt, 'full')}</span>
                                  </div>
                                  <p className="text-[11px] font-medium text-[var(--text-primary)] leading-relaxed italic">"{comment.text}"</p>
                                </div>
                              )) : <div className="text-center py-6 text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">No threads found</div>}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/30 pb-2"><span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Detail</span></div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              {[
                                { label: 'Data Minor', user: lead.createdBy?.name, date: lead.createdAt, color: 'text-blue-500' },
                                { label: 'Verifier', user: lead.lqUpdatedBy?.name, date: lead.lqUpdatedAt, color: 'text-emerald-500' },
                                { label: 'Manager', user: lead.assignedTo?.name, date: lead.assignedAt, color: 'text-purple-500' },
                                { label: 'Status', user: lead.status || 'UNPAID', date: lead.submittedDate ? `${lead.submittedDate} ${lead.submittedTime}` : null, color: 'text-rose-500' }
                              ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm space-y-2">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${item.color} opacity-80`}>{item.label}</span>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-sm font-black text-[var(--text-primary)] leading-tight">{item.user || 'PENDING'}</span>
                                    {item.date ? (
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 opacity-70">
                                          <span className="text-[10px] grayscale">📅</span>
                                          <span className="text-[10px] font-bold text-[var(--text-secondary)]">{formatPKT(item.date, 'date')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-70">
                                          <span className="text-[10px] grayscale">🕒</span>
                                          <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-tight">{formatPKT(item.date, 'time')} <span className="text-[8px] opacity-50 font-black">PKT</span></span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] font-black text-[var(--text-tertiary)] opacity-30 uppercase tracking-widest italic">--- PENDING ---</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && <div className="text-center py-12 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">No Intelligence Threads Found</div>}

        <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between">
          <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Showing <span className="text-[var(--text-primary)]">{leads.length}</span> of <span className="text-[var(--text-primary)]">{pagination.totalLeads}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 text-[10px] font-black uppercase transition-all">Previous</button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${pagination.currentPage === pageNum ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>{pageNum}</button>
                );
              })}
            </div>
            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 text-[10px] font-black uppercase transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp p-0 relative">
            <div className="p-4 flex items-center justify-between border-b border-[var(--border-primary)]/50">
              <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em]">Contact </span>
              <button onClick={closeContactDetails} className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-rose-500 hover:text-white transition-all text-[var(--text-tertiary)] shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-4">
                {/* Email Intelligence */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/20 pb-1.5">
                    <div className="p-1 px-1.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">@</div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] opacity-70">Email Intelligence</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedLead.emails?.map((email, idx) => {
                      const isSelected = selectedLead.responseSource?.emails?.some(re => re.value === email.value);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all relative overflow-hidden ${isSelected ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-blue-500/30'
                          }`}>
                          {isSelected && <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-md border-l border-b border-white/20">Selected Source</div>}

                          <div className="flex flex-col gap-1.5 pr-10">
                            <span className={`w-fit text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${email.status === 'DEAD' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                              }`}>
                              {email.status || 'VERIFIED'}
                            </span>
                            <span className="text-sm font-black text-[var(--text-primary)] break-all leading-tight">{email.value}</span>
                          </div>

                          <button
                            onClick={() => handleCopy(email.value, `e-${idx}`)}
                            className={`shrink-0 p-2 rounded-lg transition-all border ${copiedId === `e-${idx}` ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]/50 text-[var(--text-tertiary)] hover:border-blue-500/50 hover:text-blue-500 shadow-sm'
                              }`}
                          >
                            {copiedId === `e-${idx}` ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/20 pb-1.5">
                    <div className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">#</div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] opacity-70">Phone Numbers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedLead.phones?.map((phone, idx) => {
                      const isSelected = selectedLead.responseSource?.phones?.some(rp => rp.value === phone);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all relative overflow-hidden ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-emerald-500/30'
                          }`}>
                          {isSelected && <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-md border-l border-b border-white/20">Selected Source</div>}

                          <div className="flex flex-col pr-10">
                            <span className="text-sm font-black text-[var(--text-primary)]">{phone}</span>
                            <span className="text-[8px] font-bold text-[var(--text-tertiary)] opacity-60">Verified Line</span>
                          </div>

                          <button
                            onClick={() => handleCopy(phone, `p-${idx}`)}
                            className={`shrink-0 p-2 rounded-lg transition-all border ${copiedId === `p-${idx}` ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]/50 text-[var(--text-tertiary)] hover:border-emerald-500/50 hover:text-emerald-500 shadow-sm'
                              }`}
                          >
                            {copiedId === `p-${idx}` ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)]/50 flex items-center justify-end">
              <button onClick={closeContactDetails} className="px-6 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-secondary); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default CombinedLeads;
