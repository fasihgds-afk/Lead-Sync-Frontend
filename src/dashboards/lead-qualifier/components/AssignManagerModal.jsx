import React, { useState, useEffect } from 'react';

export default function AssignManagerModal({
    isOpen,
    onClose,
    selectedLead,
    onAssign,
    error
}) {
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [selectedPhones, setSelectedPhones] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (selectedLead && isOpen) {
            // Reset states when opening
            if (!showSuccess) {
                const emails = selectedLead.emails || [];
                const phones = selectedLead.phones || [];
                setSelectedEmails(emails.length > 0 ? [emails[0].normalized] : []);
                setSelectedPhones(phones.length > 0 ? [phones[0]] : []);
            }
        }
        if (!isOpen) {
            setShowSuccess(false);
            setIsAssigning(false);
        }
    }, [selectedLead, isOpen]);

    const toggleEmail = (emailNorm) => {
        setSelectedEmails(prev =>
            prev.includes(emailNorm)
                ? prev.filter(e => e !== emailNorm)
                : [...prev, emailNorm]
        );
    };

    const togglePhone = (phone) => {
        setSelectedPhones(prev =>
            prev.includes(phone)
                ? prev.filter(p => p !== phone)
                : [...prev, phone]
        );
    };

    const handleAssign = async () => {
        if (!selectedLead) return;
        if (selectedEmails.length === 0 && selectedPhones.length === 0) {
            alert("Please select at least one contact method.");
            return;
        }
        
        setIsAssigning(true);
        const result = await onAssign({
            leadId: selectedLead._id,
            selectedEmails,
            selectedPhones
        });
        
        setIsAssigning(false);
        if (result && (result.success || result === true)) {
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        }
    };

    if (!isOpen) return null;

    const emails = selectedLead?.emails || [];
    const phones = selectedLead?.phones || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-fadeIn" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] w-full max-w-sm overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]">
                <div className={`p-4 md:p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-gradient-to-r from-transparent to-[var(--accent-primary)]/5 ${error && error.includes("No manager assigned") ? 'py-4' : ''}`}>
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">Assign Lead to Manager</h3>
                        {!error || !error.includes("No manager assigned") && (
                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Select contact methods for transfer</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--accent-error)] hover:text-white flex items-center justify-center transition-all active:scale-95"
                    >
                        <svg className="h-4 w-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className={`p-4 overflow-y-auto ${error && error.includes("No manager assigned") || showSuccess ? 'h-auto' : 'flex-1 space-y-4'}`}>
                    {/* Success View */}
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                                <svg className="w-10 h-10 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-black mb-2 tracking-tight text-emerald-500">Lead Distributed!</h4>
                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest leading-loose max-w-[200px]">
                                This lead has been successfully assigned to your manager.
                            </p>
                        </div>
                    ) : error && error.includes("No manager assigned") ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/30 relative shadow-2xl shadow-rose-500/10">
                                <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
                                <svg className="w-8 h-8 text-rose-500 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h4 className="text-lg font-black mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Assignment Missing
                            </h4>

                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest leading-loose max-w-[200px]">
                                No manager assigned to you yet. Ask Super Admin to assign a manager.
                            </p>

                            <button
                                onClick={onClose}
                                className="mt-6 px-8 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                Noted
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Emails Section */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-1">
                                    Verified Emails
                                </label>
                                {emails.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-1 max-h-[130px] overflow-y-auto pr-1 scrollbar-thin">
                                        {emails.map((em, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => toggleEmail(em.normalized)}
                                                className={`flex items-center justify-between py-1.5 px-3 rounded-lg border transition-all ${selectedEmails.includes(em.normalized)
                                                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                                    : 'bg-[var(--bg-tertiary)]/30 border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold truncate max-w-[200px]">{em.value}</span>
                                                <div className={`w-4 h-4 flex-shrink-0 rounded-md flex items-center justify-center border-2 transition-all ${selectedEmails.includes(em.normalized)
                                                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                                                    : 'border-[var(--border-primary)]'
                                                    }`}
                                                >
                                                    {selectedEmails.includes(em.normalized) && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]/20 border border-dashed border-[var(--border-primary)] text-center">
                                        <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No Emails Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Phones Section */}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-1">
                                    Verified GB Numbers
                                </label>
                                {phones.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-1 max-h-[130px] overflow-y-auto pr-1 scrollbar-thin">
                                        {phones.map((ph, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => togglePhone(ph)}
                                                className={`flex items-center justify-between py-1.5 px-3 rounded-lg border transition-all ${selectedPhones.includes(ph)
                                                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                                    : 'bg-[var(--bg-tertiary)]/30 border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold truncate max-w-[200px]">{ph}</span>
                                                <div className={`w-4 h-4 flex-shrink-0 rounded-md flex items-center justify-center border-2 transition-all ${selectedPhones.includes(ph)
                                                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                                                    : 'border-[var(--border-primary)]'
                                                    }`}
                                                >
                                                    {selectedPhones.includes(ph) && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]/20 border border-dashed border-[var(--border-primary)] text-center">
                                        <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No Numbers Available</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAssign}
                                disabled={isAssigning || (selectedEmails.length === 0 && selectedPhones.length === 0)}
                                className="w-full h-11 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary)]/80 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 mt-4"
                            >
                                {isAssigning ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Transfer to Manager
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
