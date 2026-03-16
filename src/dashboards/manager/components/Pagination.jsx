import React from 'react';

const Pagination = ({ currentPage, totalPages, total, itemsPerPage, onPageChange }) => {
    if (totalPages === 0) return null;

    return (
        <div className="px-4 py-3 bg-[var(--bg-tertiary)]/20 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-7 h-7 rounded bg-[var(--bg-tertiary)]/30 border border-white/5 flex items-center justify-center text-slate-400 disabled:opacity-30"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-xs text-slate-400 px-2">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 rounded bg-[var(--bg-tertiary)]/30 border border-white/5 flex items-center justify-center text-slate-400 disabled:opacity-30"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;