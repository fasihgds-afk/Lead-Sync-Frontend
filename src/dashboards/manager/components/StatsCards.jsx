import React from 'react';

const StatsCards = ({ total, pendingCount, rejectedCount }) => {
    const stats = [
        {
            label: 'Total',
            value: total,
            icon: (
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-400'
        },
        {
            label: 'Pending',
            value: pendingCount,
            icon: (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: 'bg-amber-500/10',
            textColor: 'text-amber-400'
        },
        {
            label: 'Rejected',
            value: rejectedCount,
            icon: (
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
            bgColor: 'bg-rose-500/10',
            textColor: 'text-rose-400'
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
                <div key={index} className="bg-[var(--bg-secondary)] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">{stat.label}</p>
                            <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;