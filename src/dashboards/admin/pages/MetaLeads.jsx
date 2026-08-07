import React, { useState, useEffect, useCallback } from 'react';
import {
  FiDatabase, FiRefreshCw, FiAlertCircle,
  FiInbox, FiUserCheck, FiLoader, FiChevronDown,
  FiCheckCircle, FiCopy, FiCheck, FiDollarSign,
  FiMessageSquare, FiUser, FiClock,
} from 'react-icons/fi';
import { metaLeadAPI } from '../../../api/metaLeadAPI';

// ─── constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

// ─── CopyableText ────────────────────────────────────────────────────────────
// Click-to-copy for email / phone. Shows a checkmark briefly after copying.
function CopyableText({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!text) return <span className="text-gray-400 italic">—</span>;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — fail silently
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy: ${text}`}
      className={`group inline-flex items-center gap-1.5 text-left hover:text-emerald-600 transition-colors ${className}`}
    >
      <span className="truncate">{text}</span>
      {copied
        ? <FiCheck className="w-3 h-3 text-emerald-500 shrink-0" />
        : <FiCopy className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />}
    </button>
  );
}

// ─── StageBadge ──────────────────────────────────────────────────────────────
function StageBadge({ stage }) {
  const map = {
    ADMIN_REVIEW: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    MANAGER: 'bg-emerald-500/10  text-emerald-600  border-emerald-500/20',
    WRITER: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[stage] ?? 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
      {stage || '—'}
    </span>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    UNPAID: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[status] ?? 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
      {status || '—'}
    </span>
  );
}

// ─── WriterStatusBadge ───────────────────────────────────────────────────────
function WriterStatusBadge({ status }) {
  const map = {
    PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    DONE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[status] ?? 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
      {status || '—'}
    </span>
  );
}

// ─── AssignModal ─────────────────────────────────────────────────────────────
function AssignModal({ lead, managers, onConfirm, onCancel, isLoading }) {
  const [managerId, setManagerId] = useState('');
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeIn max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-mono text-emerald-500 font-bold">ASSIGN MANAGER</p>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{lead.fullName}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none">✕</button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiUserCheck className="w-4 h-4" />
            </div>
            <select
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-black/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">— Select Manager —</option>
              {managers.map(m => (
                <option key={m._id || m.id} value={m._id || m.id}>
                  {m.name}{m.email ? ` (${m.email})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
              <FiChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-black/5 text-[var(--text-secondary)] font-bold text-xs hover:bg-black/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => managerId && onConfirm(managerId)} disabled={!managerId || isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            {isLoading ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DetailModal ─────────────────────────────────────────────────────────────
// Shows sections progressively based on the lead's actual lifecycle state:
//  - Lead Info: always shown
//  - Assignment: only if the lead has been assigned to a manager
//  - Admin Processing: only if an admin has processed it
//  - Writer: only if it has reached the writer stage
//  - Payments: only if there are upsales recorded
//  - Comments: only if there are comments
function DetailModal({ lead, onClose }) {
  if (!lead) return null;

  const fmt = (d) => d ? new Date(d).toLocaleString() : '—';
  const createdBy = lead.createdBy?.name ?? lead.raw?.createdBy?.name;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 text-emerald-500" />
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-1.5 text-xs bg-black/[0.02] rounded-xl p-3">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-0.5 gap-4">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="font-semibold text-[var(--text-primary)] text-right min-w-0">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5 border-b border-black/10 pb-4">
          <div>
            <p className="text-[10px] font-mono text-emerald-500 font-bold uppercase">Meta Lead</p>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{lead.fullName}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <StageBadge stage={lead.stage} />
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none">✕</button>
        </div>

        {/* ── Lead Info — always shown ── */}
        <Section icon={FiUser} title="Lead Info">
          <Row label="Full Name" value={lead.fullName || '—'} />
          <Row label="Email" value={<CopyableText text={lead.email} className="justify-end" />} />
          <Row label="Phone" value={<CopyableText text={lead.number} className="justify-end" />} />
          <Row label="Location" value={lead.location || '—'} />
          <Row label="Website" value={lead.website || '—'} />
          <Row label="Program" value={lead.program || '—'} />
          <Row label="School" value={lead.school || '—'} />
          <Row label="Lead Type" value={lead.leadType || '—'} />
        </Section>

        {/* ── Assignment — only once assigned ── */}
        {lead.assignedTo && (
          <Section icon={FiUserCheck} title="Assignment">
            <Row label="Assigned To" value={lead.assignedTo.name || '—'} />
            <Row label="Manager Email" value={<CopyableText text={lead.assignedTo.email} className="justify-end" />} />
            <Row label="Role" value={lead.assignedToRole || lead.assignedTo.role || '—'} />
            <Row label="Assigned At" value={fmt(lead.assignedAt)} />
          </Section>
        )}

        {/* ── Admin Processing — only once an admin has processed it ── */}
        {lead.adminProcessedBy && (
          <Section icon={FiUser} title="Admin Processing">
            <Row label="Processed By" value={lead.adminProcessedBy.name || '—'} />
            <Row label="Processed At" value={fmt(lead.adminProcessedAt)} />
            {lead.adminAssignedDate && <Row label="Admin Assigned Date" value={fmt(lead.adminAssignedDate)} />}
          </Section>
        )}

        {/* ── Writer — only once visible to a writer ── */}
        {lead.writerVisible && (
          <Section icon={FiClock} title="Writer">
            <Row label="Writer Status" value={<WriterStatusBadge status={lead.writerStatus} />} />
            <Row label="Visible Since" value={fmt(lead.writerVisibleAt)} />
            {lead.writerDoneBy && <Row label="Done By" value={lead.writerDoneBy?.name || lead.writerDoneBy} />}
            {lead.writerDoneAt && <Row label="Done At" value={fmt(lead.writerDoneAt)} />}
          </Section>
        )}

        {/* ── Payments — only if upsales recorded ── */}
        {Array.isArray(lead.upsales) && lead.upsales.length > 0 && (
          <Section icon={FiDollarSign} title={`Payments (${lead.upsales.length})`}>
            {lead.upsales.map((u, i) => (
              <div key={u._id || i} className={i > 0 ? 'pt-2 mt-2 border-t border-black/10' : ''}>
                <Row label="Amount" value={`$${u.amount}`} />
                {u.comment && <Row label="Comment" value={u.comment} />}
                <Row label="Added At" value={fmt(u.addedAt)} />
              </div>
            ))}
          </Section>
        )}

        {/* ── Comments — only if any exist ── */}
        {Array.isArray(lead.comments) && lead.comments.length > 0 && (
          <Section icon={FiMessageSquare} title={`Comments (${lead.comments.length})`}>
            {lead.comments.map((c, i) => (
              <div key={i} className={i > 0 ? 'pt-2 mt-2 border-t border-black/10' : ''}>
                <p className="text-[var(--text-primary)]">{c.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.createdByRole || '—'} · {fmt(c.createdAt)}</p>
              </div>
            ))}
          </Section>
        )}

        {/* ── Meta — always shown at the bottom ── */}
        <Section icon={FiClock} title="Meta">
          {createdBy && <Row label="Created By" value={createdBy} />}
          <Row label="Created At" value={fmt(lead.createdAt)} />
          <Row label="Updated At" value={fmt(lead.updatedAt)} />
        </Section>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MetaLeads() {
  // ── leads state
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── managers
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // ── modals
  const [viewLead, setViewLead] = useState(null);
  const [assignLead, setAssignLead] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // ── tab filter
  const [activeTab, setActiveTab] = useState('ALL');

  // ── fetch leads ─────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (overrideSkip) => {
    setLoading(true);
    setError(null);
    try {
      const data = await metaLeadAPI.getMetaLeads({
        limit: PAGE_SIZE, skip: overrideSkip ?? skip,
      });
      setLeads(data.leads ?? []);
      setTotal(data.totalLeads ?? 0);
    } catch (err) {
      setError(err?.message ?? 'Failed to load meta leads.');
    } finally {
      setLoading(false);
    }
  }, [skip]);

  // ── fetch managers (once) ───────────────────────────────────────────────────
  const fetchManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const data = await metaLeadAPI.getApprovedManagers();
      setManagers(data.managers ?? []);
    } catch {
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [skip]);
  useEffect(() => { fetchManagers(); }, []);

  // ── assign manager ──────────────────────────────────────────────────────────
  const handleAssign = async (managerId) => {
    if (!assignLead) return;
    setAssigning(true);
    try {
      await metaLeadAPI.assignMetaLeadToManager(String(assignLead._id), managerId);
      showToast('success', `Assigned successfully to manager.`);
      setAssignLead(null);
      fetchLeads();
    } catch (err) {
      showToast('error', err?.message ?? 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  // ── tab filter (applied to the currently loaded page of leads) ──────────────
  const isUnassigned = (l) => !l.assignedTo;
  const isAssignedUnpaid = (l) => !!l.assignedTo && l.status === 'UNPAID';
  const isPaid = (l) => l.status === 'PAID';

  const tabs = [
    { key: 'ALL', label: 'All', count: leads.length },
    { key: 'UNASSIGNED', label: 'Unassigned', count: leads.filter(isUnassigned).length },
    { key: 'ASSIGNED_UNPAID', label: 'Assigned & Unpaid', count: leads.filter(isAssignedUnpaid).length },
    { key: 'PAID', label: 'Paid', count: leads.filter(isPaid).length },
  ];

  const filteredLeads = leads.filter(l => {
    if (activeTab === 'UNASSIGNED') return isUnassigned(l);
    if (activeTab === 'ASSIGNED_UNPAID') return isAssignedUnpaid(l);
    if (activeTab === 'PAID') return isPaid(l);
    return true; // ALL
  });



  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">

      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
              <FiDatabase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Meta Leads</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">View, filter, and assign meta leads to managers</p>
            </div>
          </div>
          <button onClick={() => { setSkip(0); fetchLeads(0); }} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm animate-fadeIn ${toast.type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
          : 'bg-red-500/10 border-red-500/20 text-red-600'
          }`}>
          {toast.type === 'success' ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <FiAlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto font-bold text-lg leading-none opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-bold text-lg leading-none opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === tab.key
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-black/10 hover:bg-black/5'
              }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/20' : 'bg-black/10'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/10 text-[10px] font-bold text-white uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead Info</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Program / School</th>
                <th className="px-5 py-3.5">Stage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <FiRefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-medium">Loading meta leads…</span>
                  </div>
                </td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <FiInbox className="w-8 h-8" />
                    <span className="text-sm font-medium">
                      {activeTab === 'ALL' ? 'No meta leads found.' : 'No leads match this filter.'}
                    </span>
                  </div>
                </td></tr>
              ) : filteredLeads.map(lead => (
                <tr key={String(lead._id)} className="hover:bg-blue-50/20 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-[var(--text-primary)] max-w-[160px] truncate">{lead.fullName || '—'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[var(--text-secondary)] max-w-[160px]">
                      <CopyableText text={lead.email} />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      <CopyableText text={lead.number} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[var(--text-secondary)] truncate max-w-[140px]">{lead.program || '—'}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[140px]">{lead.school || '—'}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap"><StageBadge stage={lead.stage} /></td>
                  <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={lead.status} /></td>
                  <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {lead.assignedTo?.name ?? <span className="text-gray-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => setViewLead(lead)}
                        className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold text-[var(--text-secondary)]">
                        View
                      </button>
                      {lead.status === 'UNPAID' && !lead.assignedTo && (
                        <button onClick={() => setAssignLead(lead)}
                          disabled={loadingManagers}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold disabled:opacity-40 inline-flex items-center gap-1.5">
                          <FiUserCheck className="w-3.5 h-3.5" />
                          Assign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {currentPage} of {totalPages} · {total} total
              {activeTab !== 'ALL' && ` · ${filteredLeads.length} shown on this page`}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSkip(s => Math.max(0, s - PAGE_SIZE))} disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              <button onClick={() => setSkip(s => s + PAGE_SIZE)} disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DetailModal lead={viewLead} onClose={() => setViewLead(null)} />
      <AssignModal
        lead={assignLead}
        managers={managers}
        onConfirm={handleAssign}
        onCancel={() => setAssignLead(null)}
        isLoading={assigning}
      />
    </div>
  );
}