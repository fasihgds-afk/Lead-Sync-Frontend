import React, { memo } from 'react';

const LeadFilters = memo(({
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    activeTab,
    setActiveTab,
    customFromDate,
    setCustomFromDate,
    customToDate,
    setCustomToDate,
    showToPicker,
    setShowToPicker,
    searchReady,
    setSearchReady
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Search Bar */}
            <div className="relative group flex-shrink-0 w-64 sm:w-72">
                <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-sm group-hover:border-[var(--accent-primary)]/40"
                />
                <svg className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Status Tabs */}
            <div className="flex bg-[var(--bg-secondary)]/50 rounded-xl p-1 border border-[var(--border-primary)] overflow-x-auto flex-shrink-0">
                {['ALL', 'PENDING', 'REACHED', 'QUALIFIED', 'DEAD'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-[var(--accent-primary)] text-white shadow-md'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden lg:block px-2 text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Filter:</div>
                
                {/* From Date Picker */}
                <div className="relative group">
                    <input
                        type="date"
                        value={customFromDate}
                        onChange={(e) => {
                            setCustomFromDate(e.target.value);
                            setShowToPicker(true);
                            setSearchReady(false);
                        }}
                        className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)] text-[var(--text-primary)] text-[9px] font-bold uppercase rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-primary)] transition-all cursor-pointer w-28 sm:w-32"
                        placeholder="From date"
                    />
                    {customFromDate && (
                        <button
                            onClick={() => {
                                setCustomFromDate('');
                                setShowToPicker(false);
                                setSearchReady(false);
                            }}
                            className="absolute right-7 top-1/2 -translate-y-1/2 text-[var(--accent-error)]"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* Show To Date Picker or Add To Button */}
                {showToPicker ? (
                    <>
                        <div className="text-[9px] text-[var(--text-tertiary)] font-black">TO</div>
                        <div className="relative group">
                            <input
                                type="date"
                                value={customToDate}
                                onChange={(e) => {
                                    setCustomToDate(e.target.value);
                                    setSearchReady(false);
                                }}
                                className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-primary)] text-[var(--text-primary)] text-[9px] font-bold uppercase rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-primary)] transition-all cursor-pointer w-28 sm:w-32"
                                placeholder="To date"
                            />
                            {customToDate && (
                                <button
                                    onClick={() => {
                                        setCustomToDate('');
                                        setShowToPicker(false);
                                        setSearchReady(false);
                                    }}
                                    className="absolute right-7 top-1/2 -translate-y-1/2 text-[var(--accent-error)]"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => setShowToPicker(true)}
                        className="px-3 py-1.5 bg-[var(--accent-primary)]/10 border border-[var(--border-primary)] text-[var(--accent-primary)] text-[9px] font-bold uppercase rounded-xl transition-all hover:bg-[var(--accent-primary)]/20 whitespace-nowrap"
                    >
                        Add To Date
                    </button>
                )}

                {/* Search Button */}
                {customFromDate && (
                    <button
                        onClick={() => setSearchReady(true)}
                        className="px-3 py-1.5 bg-[var(--accent-primary)] text-white text-[9px] font-bold uppercase rounded-xl transition-all hover:bg-[var(--accent-primary)]/90 shadow-md"
                    >
                        Search
                    </button>
                )}
            </div>
        </div>
    );
});

export default LeadFilters;
