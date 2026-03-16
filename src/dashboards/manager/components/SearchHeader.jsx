import React from 'react';

const SearchHeader = ({
    title = "New Leads",
    subtitle = "",
    searchTerm,
    onSearchChange,
    onRefresh,
    loading,
    stats,
    statsColor = "blue", // blue, rose, emerald
    icon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    )
}) => {
    const colorClasses = {
        rose: "from-rose-500/20 to-rose-600/20 border-rose-500/30 text-rose-500 stats-rose",
        emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-500 stats-emerald",
        blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-500 stats-blue"
    };

    const statsBadgeClasses = {
        rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-500",
        emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-500",
        blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-500"
    };

    const activeColor = colorClasses[statsColor] || colorClasses.blue;
    const activeStatsBadge = statsBadgeClasses[statsColor] || statsBadgeClasses.blue;

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center shadow-inner ${activeColor}`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
                        {stats && (
                            <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r border text-[10px] font-bold ${activeStatsBadge}`}>
                                {stats}
                            </div>
                        )}
                    </div>
                    {subtitle && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                {onSearchChange && (
                    <div className="relative flex-1 md:w-72">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search records..."
                            className="w-full h-10 pl-10 pr-10 text-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all"
                        />
                        <svg className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-3 p-0.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3.5 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-all shadow-sm group"
                        title="Refresh"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchHeader;
