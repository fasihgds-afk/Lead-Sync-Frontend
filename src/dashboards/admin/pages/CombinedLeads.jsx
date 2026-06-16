import React, { useState, useEffect } from 'react';
import { combinedAPI } from '../../../api/combined.api';
import SharedLoader from '../../../components/SharedLoader';
import { toast } from 'react-hot-toast';

const LeadDetailsView = ({ lead, formatPKT }) => {
  const [activeTab, setActiveTab] = useState('detail'); // 'detail', 'comments', 'sources'

  const tabItems = [
    { id: 'detail', label: 'Stage Detail', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-blue-500', activeBg: 'bg-blue-500/10' }
  ];

  if (lead.comments && lead.comments.length > 0) {
    tabItems.push({ id: 'comments', label: 'Comments', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'text-amber-500', activeBg: 'bg-amber-500/10' });
  }

  tabItems.push({ id: 'sources', label: 'Source Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', color: 'text-emerald-500', activeBg: 'bg-emerald-500/10' });

  if (lead.assignedTo?.role === 'Manager') {
    tabItems.push({ id: 'payment', label: 'Payment Details', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-purple-500', activeBg: 'bg-purple-500/10' });
  }

  return (
    <tr className="bg-[var(--bg-tertiary)]/30 border-b border-[var(--border-primary)]/50 border-x-8 border-x-amber-500/10">
      <td colSpan="6" className="p-0">
        <div className="p-5 animate-fadeIn">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4 p-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-xl w-fit">
            {tabItems.map((tab) => {
              const isActive = activeTab === tab.id;

              // Calculate accurate counts
              let itemCount = 0;
              if (tab.id === 'comments') {
                itemCount = lead.comments?.length || 0;
              } else if (tab.id === 'sources') {
                itemCount = (lead.sources || []).reduce((acc, curr) => {
                  const links = (curr.link || "").split(/(?=https?:\/\/)/).filter(l => l.trim().startsWith('http'));
                  const nameIsLink = (curr.name || "").trim().startsWith('http');
                  return acc + links.length + (nameIsLink ? 1 : 0);
                }, 0);
              } else if (tab.id === 'payment') {
                itemCount = lead.upsales?.length || 0;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${isActive
                    ? `${tab.color} ${tab.activeBg} shadow-sm ring-1 ring-current/20`
                    : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                  </svg>
                  {tab.label}
                  {itemCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${isActive ? 'bg-white/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px] animate-fadeIn">
            {activeTab === 'detail' && (
              <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-3">
                {(() => {
                  const items = [
                    {
                      label: '1. Data Miner Stage',
                      user: lead.createdBy?.name || 'N/A',
                      date: lead.createdAt,
                      color: 'text-emerald-500',
                      border: 'border-emerald-500/20',
                      bg: 'bg-emerald-500/5',
                      icon: 'M12 4v16m8-8H4'
                    },
                    {
                      label: '2. Verified Stage',
                      user: lead.verifiedCompletedAt 
                        ? 'Bulk Process' 
                        : (lead.emails?.some(e => e.verifiedAt) || (!lead.emails?.length && lead.phones?.length > 0 && ['Verifier', 'LQ', 'MANAGER', 'DONE'].includes(lead.stage))) 
                          ? 'Active' 
                          : 'Pending',
                      // Prioritize verifiedAt from emails as requested by user
                      date: lead.emails?.find(e => e.verifiedAt)?.verifiedAt || lead.verifiedCompletedAt || ((!lead.emails?.length && lead.phones?.length > 0 && ['Verifier', 'LQ', 'MANAGER', 'DONE'].includes(lead.stage)) ? lead.updatedAt : null),
                      color: 'text-blue-500',
                      border: 'border-blue-500/20',
                      bg: 'bg-blue-500/5',
                      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    },
                    {
                      label: '3. LQ (Qualifier) Stage',
                      user: lead.lqUpdatedBy?.name || (lead.assignedTo?.role === 'Lead Qualifiers' ? lead.assignedTo?.name : 'Pending'),
                      date: lead.lqUpdatedAt || (lead.assignedTo?.role === 'Lead Qualifiers' ? lead.assignedAt : null),
                      color: 'text-amber-500',
                      border: 'border-amber-500/20',
                      bg: 'bg-amber-500/5',
                      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    },
                    {
                      label: '4. Manager Stage',
                      user: (lead.stage === 'DONE' || lead.stage === 'MANAGER') ? (lead.assignedTo?.name || 'Manager') : 'Not Assigned',
                      date: (lead.stage === 'DONE' || lead.stage === 'MANAGER') ? lead.updatedAt : null,
                      color: 'text-rose-500',
                      border: 'border-rose-500/20',
                      bg: 'bg-rose-500/5',
                      icon: 'M13 7h8l-8 8-4-4-6 6'
                    }
                  ];

                  return items.map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl bg-[var(--bg-secondary)] border ${item.border} ${item.bg} shadow-sm space-y-3 relative overflow-hidden transition-all hover:shadow-md`}>
                      <div className="flex items-center justify-between border-b border-current/10 pb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${item.color} flex items-center gap-1.5`}>
                          <div className={`w-1 h-1 rounded-full bg-current ${item.date ? 'animate-pulse' : ''}`} />
                          {item.label}
                        </span>
                        <svg className={`w-3.5 h-3.5 ${item.color} opacity-40`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                        </svg>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-0.5">Assigned / Done By</span>
                          <span className={`text-[11px] font-black leading-none truncate ${item.user === 'Pending' || item.user === 'Not Assigned' ? 'text-[var(--text-tertiary)] italic opacity-50' : 'text-[var(--text-primary)]'}`}>
                            {item.user}
                          </span>
                        </div>

                        <div className="flex flex-col pt-2 border-t border-current/5">
                          <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-1">Timeline Detail</span>
                          {item.date ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)]">
                                <span className="opacity-50">📅</span>
                                {formatPKT(item.date, 'date')}
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)]">
                                <span className="opacity-50">🕒</span>
                                {formatPKT(item.date, 'time')} <span className="text-[7px] opacity-40">PKT</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-[var(--text-tertiary)] opacity-30 uppercase tracking-widest italic">Waiting...</span>
                              {i === 3 && lead.stage === 'LQ' && (
                                <span className="text-[7px] font-bold text-amber-500/60 uppercase">Currently with LQ</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="max-w-3xl space-y-3 pr-2 custom-scrollbar max-h-[400px] overflow-y-auto">
                {lead.comments?.length > 0 ? lead.comments.map((comment, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded-lg">{comment.createdByRole}</span>
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-70">{formatPKT(comment.createdAt, 'full')}</span>
                    </div>
                    <p className="text-[12px] font-medium text-[var(--text-primary)] italic leading-tight">"{comment.text}"</p>
                  </div>
                )) : (
                  <div className="py-10 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">No comments found</div>
                )}
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lead.sources?.length > 0 ? lead.sources.map((source, i) => {
                  const rawLink = source.link || "";
                  const nameIsLink = (source.name || "").trim().startsWith('http');

                  // Extract links from the link field
                  let links = rawLink
                    .split(/(?=https?:\/\/)/) // Split at every http/https start
                    .map(link => link.trim().replace(/[,/ \s]+$/, "")) // Remove trailing delimiters
                    .filter(link => link.startsWith('http')); // Ensure we only have valid starts

                  let displayName = source.name || "Source";

                  if (nameIsLink) {
                    links = [source.name.trim().replace(/[,/ \s]+$/, ""), ...links];
                    displayName = "Other Source";
                  }

                  const getDomainBadge = (url) => {
                    const lUrl = url.toLowerCase();
                    if (lUrl.includes('fastpeoplesearch')) return { label: 'FastPeople', color: 'bg-amber-500/10 text-amber-500' };
                    if (lUrl.includes('linkedin')) return { label: 'LinkedIn', color: 'bg-blue-500/10 text-blue-500' };
                    if (lUrl.includes('facebook')) return { label: 'Facebook', color: 'bg-blue-600/10 text-blue-600' };
                    if (lUrl.includes('wgu')) return { label: 'WGU', color: 'bg-emerald-500/10 text-emerald-500' };
                    if (lUrl.includes('capella')) return { label: 'Capella', color: 'bg-purple-500/10 text-purple-500' };
                    if (lUrl.includes('walden')) return { label: 'Walden', color: 'bg-cyan-500/10 text-cyan-500' };

                    // Auto-extract domain name for any other sources
                    try {
                      const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
                      const label = domain.charAt(0).toUpperCase() + domain.slice(1);

                      // Deterministic color based on label to keep it colorful but consistent
                      const colorPalette = [
                        'bg-indigo-500/10 text-indigo-500',
                        'bg-rose-500/10 text-rose-500',
                        'bg-sky-500/10 text-sky-500',
                        'bg-pink-500/10 text-pink-500',
                        'bg-teal-500/10 text-teal-500',
                        'bg-violet-500/10 text-violet-500'
                      ];
                      const hash = label.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
                      const color = colorPalette[Math.abs(hash) % colorPalette.length];

                      return { label: label, color: color };
                    } catch (e) {
                      return { label: 'Link', color: 'bg-slate-500/10 text-slate-500' };
                    }
                  };

                  return (
                    <div key={i} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--border-primary)]/20 pb-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {displayName}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {links.map((link, j) => {
                          const badge = getDomainBadge(link);
                          return (
                            <a key={j} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)]/50 hover:border-blue-500/30 transition-all group/link relative overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-end mb-0.5">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md shadow-sm border border-current/10 ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                </div>
                                <div className="text-[11px] font-bold text-[var(--text-primary)] break-all leading-tight underline decoration-blue-500/30 underline-offset-2">{link}</div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-10 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">No sources found</div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="max-w-3xl space-y-4 pr-2 custom-scrollbar max-h-[400px] overflow-y-auto">
                <div className="flex items-center gap-3 mb-2 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${lead.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                        {lead.status === 'PAID' ? 'PAID' : 'UNPAID'}
                    </span>
                    {lead.status === 'PAID' && lead.upsales && (
                        <span className="text-[12px] font-bold text-[var(--text-secondary)] ml-auto">Total Amount: <span className="text-emerald-500">${lead.upsales.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}</span></span>
                    )}
                </div>

                {lead.status === 'PAID' ? (
                  lead.upsales?.length > 0 ? lead.upsales.map((upsell, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-black text-emerald-500 tracking-tight">${upsell.amount}</span>
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-70">
                            {formatPKT(upsell.addedAt || upsell.createdAt, 'full')}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-[var(--text-primary)] italic leading-tight">"{upsell.comment || 'No comment'}"</p>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">Paid, but no payment details recorded.</div>
                  )
                ) : (
                  <div className="py-10 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">Lead is currently Unpaid</div>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

const CombinedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
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

  // No debounce — search only fires on Enter or button click

  useEffect(() => {
    fetchCombinedLeads();
  }, [filters, pagination.currentPage, debouncedSearchTerm]);

  const fetchCombinedLeads = async () => {
    try {
      setLoading(true);
      const skip = (pagination.currentPage - 1) * pagination.itemsPerPage;

      // Search mode — use the dedicated search endpoint
      if (isSearchMode && debouncedSearchTerm.trim().length >= 2) {
        const response = await combinedAPI.searchLeads(
          debouncedSearchTerm.trim(),
          pagination.itemsPerPage,
          skip
        );
        if (response.success) {
          setLeads(response.leads || []);
          const total = response.metadata?.total_records || 0;
          const totalPages = Math.ceil(total / pagination.itemsPerPage);
          setPagination(prev => ({
            ...prev,
            totalPages: totalPages || 1,
            totalLeads: total
          }));
        }
        return;
      }

      // Normal mode — existing filter-based fetch
      const filterParams = { ...filters };
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
      toast.error('Failed to fetch leads. Please try again.', {
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }
      });
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
    stages: ['DM', 'Verifier', 'LQ'],
    lqStatuses: ['PENDING', 'REACHED', 'DEAD', 'QUALIFIED']
  };

  const triggerSearch = () => {
    const q = searchTerm.trim();
    if (q.length < 2) return;
    setDebouncedSearchTerm(q);
    setIsSearchMode(true);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearchMode(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
    toast.success(`${text} copied!`, {
      duration: 2000,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)'
      }
    });
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

  const getPaginationRange = () => {
    const { currentPage, totalPages } = pagination;
    const delta = 1; // Number of pages to show on each side of the current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (isInitialLoading) return <SharedLoader />;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Header Stats Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="flex flex-col gap-5 relative z-10">
          {/* Top row: title, count, refresh, filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
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
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-60">
                    {isSearchMode ? 'Search Results' : 'Total Leads'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{pagination.totalLeads}</span>
                    <span className="text-[9px] font-bold text-[var(--accent-success)]/60 uppercase">Leads</span>
                  </div>
                </div>
              </div>
              {!isSearchMode && (
                <button
                  onClick={() => fetchCombinedLeads()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold hover:bg-[var(--accent-success)] hover:text-white transition-all shadow-sm disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
            </div>
            {/* Stage / LQ filters — hidden while searching */}
            {!isSearchMode && (
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
            )}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-3 flex-1 max-w-xl px-4 py-2.5 rounded-2xl border transition-all duration-200 ${isSearchMode ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)]/50 ring-2 ring-[var(--accent-primary)]/10' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] focus-within:border-[var(--accent-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--accent-primary)]/10'}`}>
              <svg className={`w-4 h-4 shrink-0 transition-colors ${isSearchMode ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  if (val === '') {
                    setDebouncedSearchTerm('');
                    setIsSearchMode(false);
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                placeholder="Search by name, email, phone or location..."
                className="flex-1 bg-transparent outline-none text-[12px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-normal"
              />
              {loading && isSearchMode && (
                <svg className="w-4 h-4 shrink-0 text-[var(--accent-primary)] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </div>
            {/* Search button */}
            <button
              onClick={triggerSearch}
              disabled={searchTerm.trim().length < 2 || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-40 hover:opacity-90 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            {/* Reset button — only visible when search is active or input has text */}
            {(isSearchMode || searchTerm) && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-rose-500 hover:text-white active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Name / Location</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Contact </th>
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
                          <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-tertiary)] font-bold mt-1">
                            <svg className="w-2.5 h-2.5 text-rose-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {lead.location || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[var(--bg-tertiary)]/50 px-2 py-1 rounded-lg border border-[var(--border-primary)]/40">
                          <svg className="w-3 h-3 text-blue-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-black text-[var(--text-secondary)] tabular-nums">{lead.emails?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[var(--bg-tertiary)]/50 px-2 py-1 rounded-lg border border-[var(--border-primary)]/40">
                          <svg className="w-3 h-3 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-[10px] font-black text-[var(--text-secondary)] tabular-nums">{lead.phones?.length || 0}</span>
                        </div>
                        {(lead.emails?.length > 0 || lead.phones?.length > 0) && (
                          <button onClick={() => openContactDetails(lead)} className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:!bg-[var(--accent-primary)] hover:!text-white transition-all flex items-center justify-center shadow-sm border border-[var(--accent-primary)]/20" title="View Intelligence Profile">
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
                        {lead.assignedTo && lead.assignedTo.role === 'Manager' && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-[8px] font-bold text-[var(--text-secondary)]">{lead.assignedTo.name} (Manager)</span></div>}
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
                    <LeadDetailsView lead={lead} formatPKT={formatPKT} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && <div className="text-center py-12 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">
          {isSearchMode ? `No results found for "${debouncedSearchTerm}"` : 'No Intelligence Threads Found'}
        </div>}

        <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between">
          <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Showing <span className="text-[var(--text-primary)]">{leads.length}</span> of <span className="text-[var(--text-primary)]">{pagination.totalLeads}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 text-[10px] font-black uppercase transition-all">Previous</button>
            <div className="flex items-center gap-1">
              {getPaginationRange().map((page, i) => (
                <React.Fragment key={i}>
                  {page === '...' ? (
                    <span className="w-7 h-7 flex items-center justify-center text-[10px] font-black text-[var(--text-tertiary)]">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${pagination.currentPage === page
                        ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 text-[10px] font-black uppercase transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] w-[95%] max-w-lg shadow-2xl overflow-hidden animate-slideUp p-0 relative">
            <div className="p-2.5 flex items-center justify-between border-b border-[var(--border-primary)]/50">
              <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em]">Contact </span>
              <button onClick={closeContactDetails} className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-rose-500 hover:text-white transition-all text-[var(--text-tertiary)] shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-h-[45vh] overflow-y-auto custom-scrollbar">
              <div className="p-3 space-y-3">
                {/* Email Intelligence */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/20 pb-1.5">
                    <div className="p-1 px-1.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">@</div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] opacity-70">Email </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedLead.emails?.map((email, idx) => {
                      const isSelected = selectedLead.responseSource?.emails?.some(re => re.value === email.value);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border transition-all relative overflow-hidden ${isSelected ? 'bg-blue-500/10 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:bg-blue-500 hover:border-blue-500 hover:text-white group/email'
                          }`}>
                          <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded ${email.status === 'DEAD' ? 'bg-rose-500/10 text-rose-500 group-hover/email:bg-white/20 group-hover/email:text-white' : 'bg-emerald-500/10 text-emerald-500 group-hover/email:bg-white/20 group-hover/email:text-white'
                                }`}>
                                {email.status || 'VERIFIED'}
                              </span>
                              {isSelected && (
                                <span className="bg-blue-600/10 text-blue-600 group-hover/email:bg-white/20 group-hover/email:text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-blue-600/20">
                                  Selected
                                </span>
                              )}
                            </div>
                            <span
                              onClick={() => handleCopy(email.value, `e-${idx}`)}
                              className="text-[11px] font-black break-all leading-tight cursor-pointer hover:text-blue-500 transition-colors"
                            >
                              {email.value}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(email.value, `e-${idx}`)}
                            className={`shrink-0 p-1.5 rounded-lg transition-all border ${copiedId === `e-${idx}` ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]/50 text-[var(--text-tertiary)] group-hover/email:bg-white/20 group-hover/email:text-white group-hover/email:border-white/30 shadow-sm'
                              }`}
                          >
                            {copiedId === `e-${idx}` ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-[var(--border-primary)]/20 pb-1">
                    <div className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase">#</div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-primary)] opacity-70">Phone Numbers</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedLead.phones?.map((phone, idx) => {
                      const isSelected = selectedLead.responseSource?.phones?.some(rp => rp.value === phone);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border transition-all relative overflow-hidden ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:bg-emerald-500 hover:border-emerald-500 hover:text-white group/phone'
                          }`}>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[6px] font-black text-emerald-500 uppercase tracking-widest px-1 py-0.5 bg-emerald-500/10 rounded group-hover/phone:bg-white/20 group-hover/phone:text-white">Line</span>
                              {isSelected && (
                                <span className="bg-emerald-600/10 text-emerald-600 group-hover/phone:bg-white/20 group-hover/phone:text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-emerald-600/20">
                                  Selected
                                </span>
                              )}
                            </div>
                            <span
                              onClick={() => handleCopy(phone, `p-${idx}`)}
                              className="text-[11px] font-black leading-tight cursor-pointer hover:text-emerald-500 transition-colors"
                            >
                              {phone}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(phone, `p-${idx}`)}
                            className={`shrink-0 p-1.5 rounded-lg transition-all border ${copiedId === `p-${idx}` ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]/50 text-[var(--text-tertiary)] group-hover/phone:bg-white/20 group-hover/phone:text-white group-hover/phone:border-white/30 shadow-sm'
                              }`}
                          >
                            {copiedId === `p-${idx}` ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

            <div className="p-2.5 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)]/50 flex items-center justify-end">
              <button onClick={closeContactDetails} className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">Close</button>
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
