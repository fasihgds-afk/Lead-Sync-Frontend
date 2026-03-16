import React from 'react';

const LeadIdentity = ({ lead, size = 'md', className = '' }) => {
    if (!lead) return null;

    const sizes = {
        sm: {
            avatar: 'w-8 h-8 text-sm rounded-lg',
            name: 'text-xs',
            location: 'text-[8px]',
            gap: 'gap-3'
        },
        md: {
            avatar: 'w-10 h-10 rounded-2xl text-lg',
            name: 'text-sm',
            location: 'text-[9px]',
            gap: 'gap-4'
        },
        lg: {
            avatar: 'h-12 w-12 rounded-xl text-xl',
            name: 'text-lg',
            location: 'text-[9px]',
            gap: 'gap-4'
        }
    };

    const s = sizes[size] || sizes.md;

    return (
        <div className={`flex items-center ${s.gap} ${className}`}>
            <div className={`${s.avatar} bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary)]/60 flex items-center justify-center font-black text-white shadow-lg shadow-[var(--accent-primary)]/20 transition-transform group-hover:scale-105`}>
                {lead.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="space-y-1">
                <div className={`${s.name} text-[var(--text-white)] text-[var(--text-primary)] leading-none tracking-tight`}>
                    {lead.name}
                </div>
                <div className={`flex items-center gap-1 text-[var(--text-tertiary)] opacity-60 uppercase tracking-widest`}>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className={s.location}>{lead.location || 'Global Reach'}</span>
                </div>
            </div>
        </div>
    );
};

export default LeadIdentity;
