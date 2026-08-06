import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiEdit3, FiSearch, FiLayers, FiRefreshCw, FiAlertCircle, FiInbox } from 'react-icons/fi';

import writerAPI from '../../../api/writer.api';
import WriterLeadRow from '../components/WriterLeadRow';
import WriterLeadDetailModal from '../components/WriterLeadDetailModal';
import WriterConfirmDoneModal from '../components/WriterConfirmDoneModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'NORMAL',    label: 'Normal' },
  { id: 'RECURRING', label: 'Recurring' },
];

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value, color = 'emerald' }) {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    purple:  'from-purple-500 to-violet-600 shadow-purple-500/20',
    amber:   'from-amber-500 to-orange-500 shadow-amber-500/20',
    blue:    'from-blue-500 to-sky-600 shadow-blue-500/20',
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center`}>
        <span className="text-white text-sm font-black">{String(value ?? 0)}</span>
      </div>
      <div>
        <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        <p className="text-xl font-black text-[var(--text-primary)]">{value ?? 0}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function WriterDashboard() {
  // ── State ───────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState('NORMAL');
  const [searchTerm,  setSearchTerm]  = useState('');
  const [skip,        setSkip]        = useState(0);

  const [leads,       setLeads]       = useState([]);
  const [totalLeads,  setTotalLeads]  = useState(0);
  const [counts,      setCounts]      = useState({ normalLeadModel: 0, metaLeadModel: 0 });

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const [viewLead,    setViewLead]    = useState(null);
  const [confirmLead, setConfirmLead] = useState(null);
  const [markingId,   setMarkingId]   = useState(null); // leadId currently being marked done

  // ── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (tab, currentSkip) => {
    setLoading(true);
    setError(null);
    try {
      const data = await writerAPI.getAllLeads({
        leadType: tab,
        limit: PAGE_SIZE,
        skip: currentSkip,
      });
      setLeads(data.leads ?? []);
      setTotalLeads(data.totalLeads ?? 0);
      setCounts(data.counts ?? { normalLeadModel: 0, metaLeadModel: 0 });
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever tab or page changes
  useEffect(() => {
    fetchLeads(activeTab, skip);
  }, [activeTab, skip, fetchLeads]);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSkip(0);
    setSearchTerm('');
  };

  // ── Client-side search filter ────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const q = searchTerm.toLowerCase();
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.number?.toLowerCase().includes(q) ||
        String(l._id).toLowerCase().includes(q)
    );
  }, [leads, searchTerm]);

  // ── Mark Done ────────────────────────────────────────────────────────────
  const handleMarkDone = async () => {
    if (!confirmLead) return;
    setMarkingId(String(confirmLead._id));
    try {
      await writerAPI.markDone(confirmLead.source, String(confirmLead._id));
      // Remove from local list immediately (lead no longer belongs to writer)
      setLeads((prev) => prev.filter((l) => String(l._id) !== String(confirmLead._id)));
      setTotalLeads((n) => Math.max(0, n - 1));
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to mark lead as done.');
    } finally {
      setMarkingId(null);
      setConfirmLead(null);
    }
  };

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(totalLeads / PAGE_SIZE) || 1;
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  const goToPage = (page) => {
    const newSkip = (page - 1) * PAGE_SIZE;
    setSkip(newSkip);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">

      {/* ── Header Banner ───────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
              <FiEdit3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  Writer Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  Writer Portal
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manage active writing leads assigned to you and mark them completed.
              </p>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchLeads(activeTab, skip)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-bold text-[var(--text-secondary)] transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Active"   value={totalLeads}                      color="emerald" />
        <StatCard label="This Page"      value={filteredLeads.length}             color="blue"    />
        <StatCard label="From Lead DB"   value={counts.normalLeadModel}           color="amber"   />
        <StatCard label="From Meta Leads" value={counts.metaLeadModel}            color="purple"  />
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Controls row: Tabs + Search ───────────────────────────────────── */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-black/5 text-[var(--text-secondary)] hover:bg-black/10'
              }`}
            >
              {tab.id === 'RECURRING' ? <FiLayers className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
              {tab.label} Leads
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name, email, phone, ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-[var(--text-primary)]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Table Card ─────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/10 text-[10px] font-bold text-white uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead Info</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Program / School</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Writer Status</th>
                <th className="px-5 py-3.5">Assigned Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FiRefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-sm font-medium">Loading leads…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FiInbox className="w-8 h-8" />
                      <span className="text-sm font-medium">
                        {searchTerm ? 'No leads match your search.' : `No ${activeTab.toLowerCase()} leads assigned.`}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <WriterLeadRow
                    key={String(lead._id)}
                    lead={lead}
                    onView={setViewLead}
                    onDone={setConfirmLead}
                    isMarking={markingId === String(lead._id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Page {currentPage} of {totalPages} · {totalLeads} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <WriterLeadDetailModal
        lead={viewLead}
        onClose={() => setViewLead(null)}
      />

      <WriterConfirmDoneModal
        lead={confirmLead}
        onConfirm={handleMarkDone}
        onCancel={() => setConfirmLead(null)}
        isLoading={!!markingId}
      />
    </div>
  );
}
