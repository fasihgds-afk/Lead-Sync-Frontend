import React from 'react';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

/**
 * Confirm-done modal.
 *
 * Props:
 *   lead       — lead object (or null to close)
 *   onConfirm  — fn() — called when user clicks Confirm
 *   onCancel   — fn()
 *   isLoading  — boolean
 */
export default function WriterConfirmDoneModal({ lead, onConfirm, onCancel, isLoading }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center animate-fadeIn">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <FiCheckCircle className="w-6 h-6 text-emerald-500" />
        </div>

        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
          Mark lead as done?
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-1 font-semibold">
          {lead.name}
        </p>
        <p className="text-[10px] text-gray-400 mb-6">
          This will move the lead back to the Admin Review queue.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-black/5 text-[var(--text-secondary)] font-bold text-xs hover:bg-black/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                <span>Marking...</span>
              </>
            ) : (
              <span>Confirm</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
