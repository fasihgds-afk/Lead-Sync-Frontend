import React from 'react';
import { managerAPI } from '../../../api/manager.api';

const ApprovedLeadCard = ({ lead, onUpsell }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [copiedField, setCopiedField] = React.useState(null);

    const handleCopy = (text, field, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            className="bg-[var(--bg-tertiary)]/40 backdrop-blur-md rounded-xl p-3 border-2 transition-all group relative overflow-hidden shadow-sm hover:-translate-y-1 cursor-pointer animate-blink-red"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center shrink-0 border border-red-500/10 group-hover:border-red-500/30 transition-colors">
                    <span className="text-red-500 font-black text-lg">{lead.name?.[0]?.toUpperCase() || 'L'}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-[13px] font-black truncate group-hover:text-red-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{lead.name}</h3>
                        <div className={`p-1 rounded-md transition-all ${expanded ? 'rotate-180' : ''}`} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                            <svg className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest bg-rose-500/20 px-2 py-1 rounded-md border border-rose-500/20 w-fit" style={{ color: 'var(--text-primary)' }}>
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Returned By Admin: {new Date(lead.superAdminReturnPriorityUntil).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })} • {new Date(lead.superAdminReturnPriorityUntil).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {expanded && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-white/10 animate-slideDown overflow-hidden">
                            <div className="grid grid-cols-12 gap-5">
                                {/* Left Column: Info & Contacts (5 columns) */}
                                <div className="col-span-12 sm:col-span-5 space-y-3">
                                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-3 bg-blue-500/50 rounded-full" />
                                        Contact Details
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Show emails from responseSource.emails[] */}
                                        {(lead.responseSource?.emails || []).map((emailObj, idx) => (
                                            <div
                                                key={`rs-email-${idx}`}
                                                onClick={(e) => handleCopy(emailObj.value, `rs-email-${idx}`, e)}
                                                className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white/5 border border-white/5 group/copy hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all w-fit cursor-pointer relative"
                                            >
                                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all group-hover/copy:bg-blue-500 group-hover/copy:text-white group-hover/copy:border-blue-500" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'rgb(59, 130, 246)' }}>
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold transition-colors tracking-tight leading-none" style={{ color: 'var(--text-secondary)' }}>{emailObj.value}</span>

                                                <div className={`flex items-center gap-1 transition-all duration-300 ${copiedField === `rs-email-${idx}` ? 'opacity-100 translate-x-1' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
                                                    <div className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Copied</div>
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Fallback: single responseSource.email if no emails array */}
                                        {(lead.responseSource?.emails || []).length === 0 && lead.responseSource?.email?.value && (
                                            <div
                                                onClick={(e) => handleCopy(lead.responseSource.email.value, `rs-email-single`, e)}
                                                className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white/5 border border-white/5 group/copy hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all w-fit cursor-pointer relative"
                                            >
                                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all group-hover/copy:bg-blue-500 group-hover/copy:text-white group-hover/copy:border-blue-500" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'rgb(59, 130, 246)' }}>
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold transition-colors tracking-tight leading-none" style={{ color: 'var(--text-secondary)' }}>{lead.responseSource.email.value}</span>

                                                <div className={`flex items-center gap-1 transition-all duration-300 ${copiedField === `rs-email-single` ? 'opacity-100 translate-x-1' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
                                                    <div className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Copied</div>
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show phones from responseSource.phones[] */}
                                        {(lead.responseSource?.phones || []).map((phoneObj, idx) => (
                                            <div
                                                key={`rs-phone-${idx}`}
                                                onClick={(e) => handleCopy(phoneObj.value, `rs-phone-${idx}`, e)}
                                                className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white/5 border border-white/5 group/copy hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all w-fit cursor-pointer relative"
                                            >
                                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all group-hover/copy:bg-orange-500 group-hover/copy:text-white group-hover/copy:border-orange-500" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', color: 'rgb(249, 115, 22)' }}>
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold transition-colors tracking-tight leading-none" style={{ color: 'var(--text-secondary)' }}>{phoneObj.value}</span>

                                                <div className={`flex items-center gap-1 transition-all duration-300 ${copiedField === `rs-phone-${idx}` ? 'opacity-100 translate-x-1' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
                                                    <div className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Copied</div>
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Fallback: single responseSource.phone if no phones array */}
                                        {(lead.responseSource?.phones || []).length === 0 && lead.responseSource?.phone?.value && (
                                            <div
                                                onClick={(e) => handleCopy(lead.responseSource.phone.value, `rs-phone-single`, e)}
                                                className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white/5 border border-white/5 group/copy hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all w-fit cursor-pointer relative"
                                            >
                                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all group-hover/copy:bg-orange-500 group-hover/copy:text-white group-hover/copy:border-orange-500" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', color: 'rgb(249, 115, 22)' }}>
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold transition-colors tracking-tight leading-none" style={{ color: 'var(--text-secondary)' }}>{lead.responseSource.phone.value}</span>

                                                <div className={`flex items-center gap-1 transition-all duration-300 ${copiedField === `rs-phone-single` ? 'opacity-100 translate-x-1' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}>
                                                    <div className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Copied</div>
                                                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Comments (7 columns) */}
                                <div className="col-span-12 sm:col-span-7 space-y-3">
                                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-3 bg-emerald-500/50 rounded-full" />
                                        All Comments
                                    </h4>
                                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10">
                                        {(lead.comments || []).map((comment, idx) => (
                                            <div key={idx} className="p-2.5 rounded-xl border transition-all" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-extrabold text-blue-400 uppercase tracking-tighter text-[8px]">{comment.createdByRole}</span>
                                                    <span className="text-[8px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })}
                                                        {' • '}
                                                        {new Date(comment.createdAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="font-medium italic leading-relaxed text-[11px]" style={{ color: 'var(--text-secondary)' }}>"{comment.text}"</p>
                                            </div>
                                        ))}
                                        {(lead.comments || []).length === 0 && (
                                            <div className="text-[9px] text-slate-600 italic text-center py-4 uppercase font-black tracking-widest bg-white/5 rounded-xl">No Discussion Found</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-500">
                                        {lead.rejectionRejectedBy?.name?.[0] || 'A'}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Verified by <span className="text-emerald-500">{lead.rejectionRejectedBy?.name || 'Admin'}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                        {new Date(lead.superAdminReturnPriorityUntil).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', month: 'short', day: 'numeric' })} • {new Date(lead.superAdminReturnPriorityUntil).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpsell(lead); }}
                                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Upsell
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!expanded && (
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1 flex items-center gap-1">
                            Click to review details
                            <svg className="w-2 h-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminApprovedBanner = ({ leads = [], onUpsell }) => {
    const displayLeads = React.useMemo(() =>
        leads.filter(l => Boolean(l.superAdminReturnPriorityUntil) && l.status !== 'PAID'),
        [leads]
    );

    if (displayLeads.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-emerald-500/10 via-[var(--bg-secondary)] to-transparent border-2 border-emerald-500/20 rounded-[24px] p-5 shadow-xl relative overflow-hidden animate-fadeIn mb-6 animate-blink-green">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-md font-black tracking-tight uppercase italic tracking-widest" style={{ color: 'var(--text-primary)' }}>Admin Rejected Leads</h2>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-500/10 border-2 border-emerald-500/40 px-4 py-1.5 rounded-full animate-blink-green shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    <span className="text-[12px] font-black text-emerald-400 uppercase tracking-wider">
                        {displayLeads.length}  {displayLeads.length === 1 ? 'Lead' : 'Leads'} returned
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 relative z-10">
                {displayLeads.map((lead) => (
                    <ApprovedLeadCard key={lead._id} lead={lead} onUpsell={onUpsell} />
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes blink-red {
                    0% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 5px rgba(239, 68, 68, 0.1); }
                    50% { border-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
                    100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 5px rgba(239, 68, 68, 0.1); }
                }
                @keyframes blink-green {
                    0% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 5px rgba(16, 185, 129, 0.1); }
                    50% { border-color: rgba(16, 185, 129, 0.6); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
                    100% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 5px rgba(16, 185, 129, 0.1); }
                }
                .animate-blink-red {
                    animation: blink-red 3s infinite;
                }
                .animate-blink-green {
                    animation: blink-green 3s infinite;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                `
            }} />
        </div >
    );
};

export default AdminApprovedBanner;


