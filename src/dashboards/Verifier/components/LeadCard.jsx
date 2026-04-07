import React from 'react';
import LeadEmailTable from './LeadEmailTable';

const LeadCard = React.memo(({
    lead, index, globalIndex, isExpanded, onToggle,
    pendingChanges, processingLeads, copiedEmail,
    onCopy, onChangeStatus, onMarkAllActive, onDone, searchTerm,
}) => {
    const emails = lead.emails ?? [];
    const isVerified = (lead.stage || 'DM').toUpperCase() === 'VERIFIER';

    const pendingCount = emails.filter((e) => {
        const norm = e.normalized || e.value;
        if (!norm) return false;
        const s = (pendingChanges[lead._id]?.[norm] || e.status || 'PENDING').toUpperCase();
        return s === 'PENDING';
    }).length;

    return (
        <div
            className={`group rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-2xl
        ${isVerified ? 'ring-1 ring-emerald-500/30' : ''}`}
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: isVerified ? '#10b98144' : (isExpanded ? 'var(--accent-primary)' : 'var(--border-primary)'),
                boxShadow: isExpanded ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none',
            }}
        >
            <div
                onClick={() => onToggle(lead._id)}
                className="px-6 py-5 flex items-center justify-between cursor-pointer transition-colors"
                style={{ backgroundColor: isExpanded ? 'var(--bg-tertiary)' : 'transparent' }}
            >
                <div className="flex items-center gap-5 flex-1">
                    <div className="relative shrink-0">
                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] text-[10px] font-black flex items-center justify-center shadow-lg z-10 border-2 border-[var(--bg-secondary)]">
                            {globalIndex}
                        </div>
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white' }}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <h3 className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Lead #{globalIndex}
                            </h3>
                            {isVerified && (
                                <span className="text-[9px] uppercase font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    Ready for LQ
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            <span>{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
                            <span className="opacity-30">·</span>
                            <span className={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                                {pendingCount > 0 ? `${pendingCount} pending` : 'All resolved'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
          ${isExpanded ? 'rotate-180 bg-[var(--bg-primary)]' : 'bg-[var(--bg-tertiary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white'}`}
                    style={{ color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isExpanded && (
                <LeadEmailTable
                    lead={lead}
                    pendingChanges={pendingChanges[lead._id] ?? {}}
                    processingLeads={processingLeads}
                    copiedEmail={copiedEmail}
                    onCopy={onCopy}
                    onChangeStatus={onChangeStatus}
                    onMarkAllActive={onMarkAllActive}
                    onDone={onDone}
                    searchTerm={searchTerm}
                />
            )}
        </div>
    );
});

export default LeadCard;
