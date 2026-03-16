export const getStatusStyle = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
        case 'QUALIFIED':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]';
        case 'REACHED':
        case 'IN_CONVERSATION':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]';
        case 'DEAD':
            return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]';
        case 'PENDING':
            return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        default:
            return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

export const getStatusLabel = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    return `● ${s.replace('_', ' ')}`;
};
