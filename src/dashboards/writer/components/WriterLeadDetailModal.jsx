import React from 'react';
import WriterStatusBadge from './WriterStatusBadge';

/**
 * Modal that shows full lead details.
 *
 * Props:
 *   lead    — lead object (or null to close)
 *   onClose — fn()
 */
export default function WriterLeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  const rows = [
    { label: 'Source', value: lead.isMetaLead ? 'Meta Lead' : 'Lead' },
    { label: 'Lead Type', value: lead.leadType || '—' },
    { label: 'Email', value: lead.email || '—' },
    { label: 'Phone', value: lead.number || '—' },
    { label: 'Location', value: lead.location || '—' },
    { label: 'Website', value: lead.website || '—' },
    { label: 'Program', value: lead.program || '—' },
    { label: 'School', value: lead.school || '—' },
    {
      label: 'Assigned Date',
      value: lead.adminAssignedDate
        ? new Date(lead.adminAssignedDate).toLocaleString()
        : '—',
    },
    {
      label: 'Writer Visible Since',
      value: lead.writerVisibleAt
        ? new Date(lead.writerVisibleAt).toLocaleString()
        : '—',
    },
    {
      label: 'Assigned To',
      value: lead.assignedTo?.name || '—',
    },
  ];

  const comments = lead.comments ?? [];
  const upsales = lead.upsales ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
              {lead.isMetaLead ? 'META_LEAD' : 'LEAD'} · {String(lead._id).slice(-8).toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
              {lead.name || 'Unknown Lead'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Status + Type row */}
        <div className="flex items-center gap-3 mb-4">
          <WriterStatusBadge status={lead.writerStatus} />
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            lead.leadType === 'RECURRING'
              ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
              : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
          }`}>
            {lead.leadType}
          </span>
        </div>

        {/* Detail rows */}
        <div className="space-y-2 text-xs">
          {rows.map(({ label, value }) => (
            value && value !== '—' ? (
              <div key={label} className="flex justify-between py-1 border-b border-black/5 gap-4">
                <span className="text-gray-500 shrink-0">{label}:</span>
                <span className="font-semibold text-[var(--text-primary)] text-right break-all">{value}</span>
              </div>
            ) : null
          ))}
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Comments</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {comments.map((c, i) => (
                <div key={i} className="p-2.5 bg-black/5 rounded-xl text-xs text-gray-700 border border-black/5">
                  <span className="font-semibold text-emerald-600">{c.addedBy?.name ?? 'System'}:</span>{' '}
                  {c.text ?? c.comment ?? c.message ?? JSON.stringify(c)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upsales */}
        {upsales.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Upsales</p>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {upsales.map((u, i) => (
                <div key={i} className="p-2 bg-purple-500/5 rounded-lg text-xs text-gray-700 border border-purple-500/10">
                  {u.description ?? JSON.stringify(u)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
