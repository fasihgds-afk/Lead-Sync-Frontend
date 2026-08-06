import React, { useCallback, useEffect, useState } from 'react';
import {
  FiClock,
  FiSearch,
  FiFileText,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiAlertCircle,
  FiRefreshCw,
  FiInbox,
  FiLoader,
} from 'react-icons/fi';
import { metaLeadAPI } from '../../../api/metaLeadAPI';

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PendingLeads() {
  const [activeTab, setActiveTab] = useState('normal'); // 'normal' | 'recurring'
  const [searchTerm, setSearchTerm] = useState('');
  const [contactModalData, setContactModalData] = useState(null);

  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [skip, setSkip] = useState(0);

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));

  const fetchLeads = useCallback(
    async (currentSkip) => {
      setLoading(true);
      setFetchError('');
      try {
        const fetcher =
          activeTab === 'normal'
            ? metaLeadAPI.getNormalLeads
            : metaLeadAPI.getRecurringLeads;
        const data = await fetcher({ limit: PAGE_SIZE, skip: currentSkip });
        setLeads(Array.isArray(data.leads) ? data.leads : []);
        setTotalLeads(typeof data.totalLeads === 'number' ? data.totalLeads : 0);
      } catch (err) {
        setFetchError(err.message || 'Failed to load leads.');
        setLeads([]);
        setTotalLeads(0);
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  // Refetch when tab or skip changes
  useEffect(() => {
    setSkip(0);
  }, [activeTab]);

  useEffect(() => {
    fetchLeads(skip);
  }, [skip, fetchLeads]);

  const goPrev = () => setSkip((s) => Math.max(0, s - PAGE_SIZE));
  const goNext = () => setSkip((s) => (s + PAGE_SIZE < totalLeads ? s + PAGE_SIZE : s));

  // Client-side search on the current page
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (lead.fullName || '').toLowerCase().includes(term) ||
      (lead.email || '').toLowerCase().includes(term) ||
      (lead.number || '').toLowerCase().includes(term) ||
      (lead.program || '').toLowerCase().includes(term) ||
      (lead.school || '').toLowerCase().includes(term) ||
      (lead.assignedTo?.name || '').toLowerCase().includes(term)
    );
  });

  const getWriterStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DONE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Pending Leads
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Monitor leads currently active with writers across Normal and Recurring queues
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchLeads(skip)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls row: Tabs + Search */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('normal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'normal'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-black/5 text-[var(--text-secondary)] hover:bg-black/10'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            Normal Leads
          </button>

          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recurring'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-black/5 text-[var(--text-secondary)] hover:bg-black/10'
            }`}
          >
            <FiLayers className="w-4 h-4" />
            Recurring Leads
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name, email, program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full text-[var(--text-primary)]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fetch error */}
      {fetchError && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{fetchError}</span>
          </div>
          <button
            onClick={() => fetchLeads(skip)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/10 text-[10px] font-bold text-white uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead Info</th>
                <th className="px-5 py-3.5">Program / School</th>
                <th className="px-5 py-3.5 text-center">Contact</th>
                <th className="px-5 py-3.5">Lead Type</th>
                <th className="px-5 py-3.5">Writer Status</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Assigned Date</th>
                <th className="px-5 py-3.5">Visible Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {/* Loading skeletons */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 rounded bg-[var(--bg-tertiary)]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Empty state */}
              {!loading && !fetchError && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FiInbox className="w-8 h-8" />
                      <span className="text-sm font-medium">
                        No {activeTab === 'normal' ? 'normal' : 'recurring'} leads pending.
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading &&
                filteredLeads.map((lead) => {
                  const leadId = lead._id;
                  return (
                    <tr key={leadId} className="hover:bg-blue-50/20 dark:hover:bg-gray-800/30 transition-colors">
                      {/* Name + short ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-[var(--text-primary)]">{lead.fullName || '—'}</div>
                        <div className="text-[10px] font-mono text-emerald-500 mt-0.5">
                          {String(leadId).slice(-8).toUpperCase()}
                        </div>
                      </td>

                      {/* Program / School */}
                      <td className="px-5 py-4 max-w-[180px]">
                        <div className="text-[var(--text-secondary)] truncate" title={lead.program}>
                          {lead.program || '—'}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={lead.school}>
                          {lead.school || '—'}
                        </div>
                      </td>

                      {/* Contact modal trigger */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setContactModalData(lead)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5"
                          title="View Contact Info"
                        >
                          <FiMail className="w-3.5 h-3.5" />
                          <FiPhone className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Lead Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block bg-violet-500/10 text-violet-600 border-violet-500/20">
                          {lead.leadType || '—'}
                        </span>
                      </td>

                      {/* Writer Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getWriterStatusBadge(
                            lead.writerStatus,
                          )}`}
                        >
                          {lead.writerStatus || '—'}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                        {lead.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                      </td>

                      {/* Admin Assigned Date */}
                      <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                        {formatDate(lead.adminAssignedDate)}
                      </td>

                      {/* Writer Visible Since */}
                      <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                        {formatDate(lead.writerVisibleAt)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {page} of {totalPages} · {totalLeads} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={loading || skip === 0}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={goNext}
                disabled={loading || skip + PAGE_SIZE >= totalLeads}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
                  <FiUser className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] leading-none">
                    Contact Details
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-500 mt-1 block font-bold">
                    {String(contactModalData._id).slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setContactModalData(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-gray-500">
                  Customer:
                </span>
                <span className="font-bold text-xs text-[var(--text-primary)]">
                  {contactModalData.fullName}
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <FiMail className="w-3 h-3 text-blue-500" />
                  Email:
                </span>
                <span
                  className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[200px]"
                  title={contactModalData.email}
                >
                  {contactModalData.email || '—'}
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <FiPhone className="w-3 h-3 text-emerald-500" />
                  Phone:
                </span>
                <span className="font-semibold text-xs text-[var(--text-primary)] font-mono">
                  {contactModalData.number || '—'}
                </span>
              </div>

              {contactModalData.website && (
                <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                    <FiGlobe className="w-3 h-3 text-purple-500" />
                    Website:
                  </span>
                  <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[180px]">
                    {contactModalData.website}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setContactModalData(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
