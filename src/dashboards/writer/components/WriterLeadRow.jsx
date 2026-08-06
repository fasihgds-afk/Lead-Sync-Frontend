import React from 'react';
import { FiEye, FiCheck, FiLoader } from 'react-icons/fi';
import WriterStatusBadge from './WriterStatusBadge';

/**
 * A single row in the leads table.
 *
 * Props:
 *   lead       — normalized lead object from the API
 *   onView     — fn(lead) — open detail modal
 *   onDone     — fn(lead) — open confirm-done modal
 *   isMarking  — boolean, disables actions while PATCH is in-flight
 */
export default function WriterLeadRow({ lead, onView, onDone, isMarking }) {
  const assignedDate = lead.adminAssignedDate
    ? new Date(lead.adminAssignedDate).toLocaleDateString()
    : lead.writerVisibleAt
    ? new Date(lead.writerVisibleAt).toLocaleDateString()
    : '—';

  const isAlreadyDone = lead.writerStatus === 'DONE';

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/30 transition-colors">
      {/* Lead Info */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="font-bold text-[var(--text-primary)] max-w-[200px] truncate" title={lead.name || lead.fullName}>
          {lead.name || lead.fullName || '—'}
        </div>
        <div className="text-[10px] font-mono text-blue-500 mt-0.5">
          {lead.isMetaLead ? 'META' : 'LEAD'} · {String(lead._id).slice(-8).toUpperCase()}
        </div>
      </td>

      {/* Contact */}
      <td className="px-5 py-4">
        <div className="text-xs text-[var(--text-secondary)] truncate max-w-[160px]">
          {lead.email || '—'}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          {lead.number || '—'}
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

      {/* Lead Type */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          lead.leadType === 'RECURRING'
            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        }`}>
          {lead.leadType || '—'}
        </span>
      </td>

      {/* Writer Status */}
      <td className="px-5 py-4 whitespace-nowrap">
        <WriterStatusBadge status={lead.writerStatus} />
      </td>

      {/* Assigned Date */}
      <td className="px-5 py-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
        {assignedDate}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => onView(lead)}
            className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5 text-[var(--text-secondary)]"
          >
            <FiEye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          <button
            onClick={() => onDone(lead)}
            disabled={isAlreadyDone || isMarking}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-600"
          >
            {isMarking ? (
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FiCheck className="w-3.5 h-3.5" />
            )}
            <span>Done</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
