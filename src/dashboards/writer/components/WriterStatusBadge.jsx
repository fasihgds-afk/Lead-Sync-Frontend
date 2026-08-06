import React from 'react';

const CONFIG = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  DONE: {
    label: 'Done',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
};

export default function WriterStatusBadge({ status }) {
  const cfg = CONFIG[status] ?? {
    label: status || '—',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
