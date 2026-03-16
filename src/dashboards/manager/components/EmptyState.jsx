import React from 'react';

const EmptyState = ({ type }) => {
    const config = {
        pending: {
            title: 'No Pending Leads',
            message: 'All leads have been processed',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            )
        },
        rejected: {
            title: 'No Rejected Leads',
            message: 'No leads have been rejected yet',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            )
        }
    };

    const currentConfig = config[type];

    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[var(--bg-tertiary)]/30 border border-dashed border-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {currentConfig.icon}
                </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{currentConfig.title}</h3>
            <p className="text-xs text-slate-400">{currentConfig.message}</p>
        </div>
    );
};

export default EmptyState;