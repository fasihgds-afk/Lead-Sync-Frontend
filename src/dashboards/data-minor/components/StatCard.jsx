import React from 'react';

const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div className="relative overflow-hidden bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-primary)] group hover:border-[var(--accent-primary)]/50 transition-all duration-500 shadow-xl">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-[var(--accent-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent-primary)]/10 transition-colors" />

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2.5 rounded-xl ${color} shadow-lg shadow-black/20`}>
                    {React.cloneElement(icon, { className: "h-5 w-5" })}
                </div>
            </div>
            <div className="space-y-0.5">
                <h3 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest truncate">{title}</h3>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[var(--text-primary)]">{value}</span>
                    {subtitle && <span className="text-[9px] text-[var(--text-tertiary)] font-bold truncate">{subtitle}</span>}
                </div>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
);

export default StatCard;
