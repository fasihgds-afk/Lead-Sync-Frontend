import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiDollarSign,
  FiCalendar,
  FiCheck,
  FiLayers,
  FiMail,
  FiPhone,
  FiUser,
  FiGlobe,
  FiX,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader,
  FiInbox
} from 'react-icons/fi';
import { metaLeadAPI } from '../../../api/metaLeadAPI';

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  UNPAID: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const STAGE_BADGE = {
  MANAGER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  WRITER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  ADMIN_REVIEW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaidLeads() {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [skip, setSkip] = useState(0);

  const [pendingLeadType, setPendingLeadType] = useState({}); // { [leadId]: 'NORMAL' | 'RECURRING' }
  const [activePreview, setActivePreview] = useState(null); // { leadId, type }
  const [assignedDateInput, setAssignedDateInput] = useState(todayISO());
  const [processingId, setProcessingId] = useState(null);
  const [processError, setProcessError] = useState({}); // { [leadId]: message }
  const [toast, setToast] = useState('');

  const [contactModalData, setContactModalData] = useState(null);

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));

  const fetchLeads = useCallback(async (currentSkip) => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await metaLeadAPI.getPaidLeads({ limit: PAGE_SIZE, skip: currentSkip });
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setTotalLeads(typeof data.totalLeads === 'number' ? data.totalLeads : 0);
    } catch (err) {
      setFetchError(err.message || 'Failed to load paid leads.');
      setLeads([]);
      setTotalLeads(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(skip);
  }, [skip, fetchLeads]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const goPrev = () => setSkip((s) => Math.max(0, s - PAGE_SIZE));
  const goNext = () => setSkip((s) => (s + PAGE_SIZE < totalLeads ? s + PAGE_SIZE : s));

  const handleLeadTypeChange = (leadId, value) => {
    setPendingLeadType((prev) => ({ ...prev, [leadId]: value }));
    setProcessError((prev) => ({ ...prev, [leadId]: '' }));

    if (value === 'NORMAL' || value === 'RECURRING') {
      setAssignedDateInput(todayISO());
      setActivePreview({ leadId, type: value });
    } else {
      setActivePreview(null);
    }
  };

  const closePreview = (leadId) => {
    setActivePreview(null);
    setPendingLeadType((prev) => ({ ...prev, [leadId]: 'NONE' }));
  };

  const confirmProcess = async (leadId) => {
    const leadType = pendingLeadType[leadId];
    if (leadType !== 'NORMAL' && leadType !== 'RECURRING') return;

    if (leadType === 'NORMAL' && !assignedDateInput) {
      setProcessError((prev) => ({ ...prev, [leadId]: 'Please pick an assigned date.' }));
      return;
    }

    // source comes from the lead object — 'LEAD' or 'META_LEAD'
    const lead = rows.find((l) => l._id === leadId);
    const source = lead?.source || 'META_LEAD';

    setProcessingId(leadId);
    setProcessError((prev) => ({ ...prev, [leadId]: '' }));

    try {
      await metaLeadAPI.processPaidLead(source, leadId, {
        leadType,
        adminAssignedDate: leadType === 'NORMAL' ? assignedDateInput : undefined,
      });

      setToast(
        leadType === 'RECURRING'
          ? 'Lead re-processed as Recurring and sent to writers.'
          : 'Lead re-processed as Normal and sent to writers.'
      );
      setActivePreview(null);
      setPendingLeadType((prev) => ({ ...prev, [leadId]: 'NONE' }));
      await fetchLeads(skip);
    } catch (err) {
      setProcessError((prev) => ({
        ...prev,
        [leadId]: err.message || 'Failed to process this lead.',
      }));
    } finally {
      setProcessingId(null);
    }
  };

  const rows = useMemo(() => leads, [leads]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Paid Leads
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Paid Meta leads awaiting processing, active with writers, or returned for review
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

      {/* Toast */}
      {toast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
          <button onClick={() => setToast('')} className="hover:opacity-75" aria-label="Dismiss">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Main Table */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/10 text-[10px] font-bold text-white uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead Info</th>
                <th className="px-5 py-3.5">Program / School</th>
                <th className="px-5 py-3.5 text-center">Contact</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Stage</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Updated</th>
                <th className="px-5 py-3.5">Lead Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 rounded bg-[var(--bg-tertiary)]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && !fetchError && rows.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FiInbox className="w-8 h-8" />
                      <span className="text-sm font-medium">No paid leads found.</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((lead) => {
                  const leadId = lead._id;
                  const selectValue = pendingLeadType[leadId] || 'NONE';
                  const isPreviewActive = activePreview?.leadId === leadId;
                  const isProcessing = processingId === leadId;
                  const rowError = processError[leadId];

                  return (
                    <React.Fragment key={leadId}>
                      <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/30 transition-colors">
                        {/* Lead ID + Name */}
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
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={lead.school}>{lead.school || '—'}</div>
                        </td>

                        {/* Contact */}
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

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              STATUS_BADGE[lead.status] ||
                              'bg-gray-500/10 text-gray-500 border-gray-500/20'
                            }`}
                          >
                            <FiCheckCircle className="w-3 h-3" />
                            {lead.status}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                              STAGE_BADGE[lead.stage] ||
                              'bg-gray-500/10 text-gray-500 border-gray-500/20'
                            }`}
                          >
                            {lead.stage}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                          {lead.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                        </td>

                        {/* Updated */}
                        <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                          {formatDate(lead.updatedAt)}
                        </td>

                        {/* Lead Type Dropdown */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <select
                            value={selectValue}
                            onChange={(e) => handleLeadTypeChange(leadId, e.target.value)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-black/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          >
                            <option value="NONE">
                              {lead.leadType && lead.leadType !== 'NONE' ? `Current: ${lead.leadType}` : 'Select…'}
                            </option>
                            <option value="RECURRING">Recurring</option>
                            <option value="NORMAL">Normal</option>
                          </select>
                        </td>
                      </tr>

                      {/* Inline process preview */}
                      {isPreviewActive && (
                        <tr className="bg-black/5 border-b border-black/10">
                          <td colSpan="8" className="px-6 py-4">
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-black/10 shadow-xl animate-fadeIn max-w-md">
                              <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                                  <FiLayers className="w-4 h-4" />
                                  Send to Writers ({activePreview.type})
                                </span>
                                <button
                                  onClick={() => closePreview(leadId)}
                                  disabled={isProcessing}
                                  className="text-gray-400 hover:text-gray-600 font-bold text-sm leading-none"
                                >
                                  ✕
                                </button>
                              </div>

                              {activePreview.type === 'RECURRING' && (
                                <p className="text-xs text-[var(--text-secondary)] mb-3">
                                  This lead will be marked <strong>Recurring</strong> and made
                                  immediately visible to writers.
                                </p>
                              )}

                              {activePreview.type === 'NORMAL' && (
                                <div className="space-y-2 mb-3">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                    <FiCalendar className="w-3 h-3" />
                                    Assigned Date <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={assignedDateInput}
                                    onChange={(e) => setAssignedDateInput(e.target.value)}
                                    disabled={isProcessing}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                  />
                                </div>
                              )}

                              {rowError && (
                                <div className="mb-3 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
                                  <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                  {rowError}
                                </div>
                              )}

                              <div className="pt-2 flex justify-end gap-2">
                                <button
                                  onClick={() => closePreview(leadId)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 rounded-xl bg-black/5 text-[var(--text-secondary)] font-bold text-xs hover:bg-black/10 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => confirmProcess(leadId)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                  {isProcessing ? (
                                    <FiLoader className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <FiCheck className="w-3.5 h-3.5" />
                                  )}
                                  {isProcessing ? 'Processing…' : 'Confirm'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Contact Details Modal */}
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

              <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-black/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <FiGlobe className="w-3 h-3 text-purple-500" />
                  Website:
                </span>
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[180px]">
                  {contactModalData.website || '—'}
                </span>
              </div>
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