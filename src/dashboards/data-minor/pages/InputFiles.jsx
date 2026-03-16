// React core imports
import React, { useCallback, useEffect, useRef, useState } from "react";

import dataMinerService from "../services/dataminor.api";

const InputFiles = () => {
    /* ----------------------------- State ----------------------------- */

    const [formData, setFormData] = useState({
        firstName: "",
        location: "",
        primaryPhone: "",
        primaryEmail: "",
        leadSource: "",
        sourceUrl: "",
        customSourceName: ""
    });

    const [emailFields, setEmailFields] = useState([]);
    const [phoneFields, setPhoneFields] = useState([]);
    const [duplicateStatuses, setDuplicateStatuses] = useState({});
    const [loadingField, setLoadingField] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    /* ----------------------------- Refs ------------------------------ */
    const formValuesRef = useRef({
        primaryPhone: "",
        primaryEmail: "",
        extraPhones: [],
        extraEmails: []
    });
    const timers = useRef({});

    /* --------------------------- Effects ----------------------------- */

    useEffect(() => {
        formValuesRef.current = {
            primaryPhone: formData.primaryPhone,
            primaryEmail: formData.primaryEmail,
            extraPhones: phoneFields.map(f => f.value),
            extraEmails: emailFields.map(f => f.value)
        };
    }, [formData.primaryPhone, formData.primaryEmail, phoneFields, emailFields]);

    useEffect(() => {
        if (!message.text) return;
        const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
        return () => clearTimeout(timer);
    }, [message.text]);

    /* ---------------------- Duplicate Checker ------------------------ */

    const checkDuplicate = useCallback(async (type, value, fieldId) => {
        if (!value) {
            setDuplicateStatuses(prev => {
                const next = { ...prev };
                delete next[fieldId];
                return next;
            });
            return;
        }

        setLoadingField(prev => ({ ...prev, [fieldId]: true }));

        try {
            const result = await dataMinerService.checkDuplicate(
                type,
                value,
                formValuesRef.current
            );

            if (result?.checked) {
                setDuplicateStatuses(prev => ({
                    ...prev,
                    [fieldId]: result
                }));
            }
        } catch (error) {
            console.error("Duplicate check failed:", error);
            setDuplicateStatuses(prev => ({
                ...prev,
                [fieldId]: { checked: true, isDuplicate: false, error: true }
            }));
        } finally {
            setLoadingField(prev => ({ ...prev, [fieldId]: false }));
        }
    }, []);

    useEffect(() => {
        // Clear status immediately when user types
        if (!formData.primaryEmail) {
            setDuplicateStatuses(prev => {
                const next = { ...prev };
                delete next['primaryEmail'];
                return next;
            });
            return;
        }

        // Clear existing status while typing
        setDuplicateStatuses(prev => {
            const next = { ...prev };
            delete next['primaryEmail'];
            return next;
        });

        const timer = setTimeout(() => {
            checkDuplicate("email", formData.primaryEmail, "primaryEmail");
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.primaryEmail, checkDuplicate]);

    useEffect(() => {
        // Clear status immediately when user types
        if (!formData.primaryPhone) {
            setDuplicateStatuses(prev => {
                const next = { ...prev };
                delete next['primaryPhone'];
                return next;
            });
            return;
        }

        // Clear existing status while typing
        setDuplicateStatuses(prev => {
            const next = { ...prev };
            delete next['primaryPhone'];
            return next;
        });

        const timer = setTimeout(() => {
            checkDuplicate("phone", formData.primaryPhone, "primaryPhone");
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.primaryPhone, checkDuplicate]);

    /* ---------------------- Field Handlers --------------------------- */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === "primaryPhone"
                ? value.replace(/\D/g, "").slice(0, 10)
                : value
        }));
    };

    const addField = (type) => {
        if ((type === "email" && emailFields.length >= 9) ||
            (type === "phone" && phoneFields.length >= 9)) return;

        const id = `additional-${type}-${Date.now()}`;

        const field = {
            id,
            value: "",
            type,
            label: type === "email"
                ? `Additional Email ${emailFields.length + 1}`
                : `Additional Phone ${phoneFields.length + 1}`,
            placeholder: type === "email"
                ? "alternate@leadsync.com"
                : "Phone number (digits only)"
        };

        type === "email"
            ? setEmailFields(prev => [...prev, field])
            : setPhoneFields(prev => [...prev, field]);
    };

    const handleAdditionalFieldChange = (id, type, value) => {
        const cleaned = type === "phone"
            ? value.replace(/\D/g, "").slice(0, 10)
            : value;

        const setter = type === "email" ? setEmailFields : setPhoneFields;

        setter(prev =>
            prev.map(f => (f.id === id ? { ...f, value: cleaned } : f))
        );

        // Clear existing duplicate status immediately when user types
        setDuplicateStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        if (timers.current[id]) clearTimeout(timers.current[id]);

        if (!cleaned) return;

        timers.current[id] = setTimeout(() => {
            checkDuplicate(type, cleaned, id);
        }, 800);
    };

    const removeField = (id, type) => {
        type === "email"
            ? setEmailFields(prev => prev.filter(f => f.id !== id))
            : setPhoneFields(prev => prev.filter(f => f.id !== id));

        setDuplicateStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    /* ------------------------- Submit ------------------------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        const leadData = dataMinerService.prepareLeadData(
            formData,
            emailFields,
            phoneFields
        );

        const validation = dataMinerService.validateLead(leadData);
        if (!validation.ok) {
            setMessage({ type: "error", text: validation.message });
            return;
        }

        setSubmitting(true);
        try {
            const response = await dataMinerService.submitLead(leadData);

            if (response.success) {
                setMessage({ type: "success", text: "Lead submitted successfully!" });

                setFormData({
                    firstName: "",
                    location: "",
                    primaryPhone: "",
                    primaryEmail: "",
                    leadSource: "",
                    sourceUrl: "",
                    customSourceName: ""
                });

                setEmailFields([]);
                setPhoneFields([]);
                setDuplicateStatuses({});
            }
        } catch (error) {
            console.error("Submission failed:", error);
            setMessage({
                type: "error",
                text: "Failed to submit lead. Please resolve duplicates or missing fields."
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ------------------------- Constants ----------------------------- */

    const baseFields = [
        { label: "First Name", name: "firstName", placeholder: "e.g. John", type: "text" },
        { label: "Location", name: "location", placeholder: "e.g. London", type: "text" },
    ];

    /* --------------------------- Render ------------------------------ */

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div
                className="max-w-7xl mx-auto rounded-[2rem] border shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
            >
                <div className="absolute -right-24 -top-24 w-80 h-80 bg-gradient-to-br from-[#00BE9B]/10 to-[#00a082]/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-[#00BE9B]/10 rounded-full blur-3xl"></div>

                <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-10 space-y-10">
                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </div>
                    )}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="p-3 rounded-[1rem] bg-gradient-to-br from-[#00BE9B] to-[#00a082] text-white shadow-xl shadow-[#00BE9B]/20">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Leads Data Input Form</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-6 mb-10">
                        {baseFields.map((field, idx) => (
                            <div key={`base-${idx}`} className={`group/field space-y-2 ${field.disabled ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between items-center pr-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1 block transition-colors group-focus-within/field:text-[#00BE9B]" style={{ color: 'var(--text-tertiary)' }}>
                                        {field.label} {field.disabled && "(Locked)"}
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        disabled={field.disabled}
                                        value={field.disabled ? "" : formData[field.name]}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        className={`w-full px-5 py-3 rounded-xl border outline-none font-bold transition-all duration-300 ${field.disabled ? 'cursor-not-allowed bg-transparent' : 'focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5'}`}
                                        placeholder={field.placeholder}
                                        style={{
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)',
                                            backgroundColor: field.disabled ? 'rgba(0,0,0,0.05)' : 'var(--bg-primary)'
                                        }}
                                    />
                                    {!field.disabled && (
                                        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#00BE9B] to-[#00a082] scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="pb-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <h3 className="text-base font-black opacity-80" style={{ color: 'var(--text-primary)' }}>
                                Contact Information
                            </h3>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">


                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="group/field space-y-1 col-span-2">
                                            <div className="flex justify-between items-center pr-2">
                                                <span className="text-[12px] font-black text-[#00BE9B]/80 uppercase tracking-widest ml-1">Primary Number</span>
                                                {phoneFields.length < 9 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => addField('phone')}
                                                        className="px-3 py-1.5 rounded-lg bg-[#00BE9B]/10 text-[#00BE9B] flex items-center gap-2 hover:bg-[#00BE9B] hover:text-white transition-all transform active:scale-95 border border-[#00BE9B]/20"
                                                        title="Add more Phone Numbers"
                                                    >
                                                        <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">Add Number</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={formData.primaryPhone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                                    className={`w-full px-4 py-2.5 rounded-lg border outline-none font-bold text-sm transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5 ${duplicateStatuses['primaryPhone']?.isDuplicate ? 'border-rose-500/50' : duplicateStatuses['primaryPhone']?.checked ? 'border-emerald-500/50' : 'var(--border-primary)'}`}
                                                    placeholder="Primary number (digits only)"
                                                    style={{
                                                        borderColor: duplicateStatuses['primaryPhone']?.isDuplicate
                                                            ? '#f43f5e'
                                                            : duplicateStatuses['primaryPhone']?.checked
                                                                ? '#10b981'
                                                                : 'var(--border-primary)',
                                                        color: 'var(--text-primary)',
                                                        backgroundColor: 'var(--bg-primary)'
                                                    }}
                                                />
                                                {loadingField['primaryPhone'] && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="w-3 h-3 border-2 border-[#00BE9B] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#00BE9B] to-[#00a082] scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                            </div>
                                            {duplicateStatuses['primaryPhone']?.checked && (
                                                <div className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 ${duplicateStatuses['primaryPhone'].isDuplicate ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {duplicateStatuses['primaryPhone'].isDuplicate ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{duplicateStatuses['primaryPhone'].message}{duplicateStatuses['primaryPhone'].match ? ` : ${duplicateStatuses['primaryPhone'].match}` : ''}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>New Record</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {phoneFields.map((field) => (
                                            <div key={field.id} className="group/field space-y-1 animate-in zoom-in-95 duration-300">
                                                <div className="flex justify-between items-center pr-2">
                                                    <label className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest ml-1 block">
                                                        {field.label}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeField(field.id, 'phone')}
                                                        className="w-4 h-4 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                        title="Remove Field"
                                                    >
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="tel"
                                                        value={field.value}
                                                        onChange={(e) => handleAdditionalFieldChange(field.id, 'phone', e.target.value)}
                                                        className={`w-full px-4 py-2.5 rounded-lg border border-dashed outline-none font-bold text-sm bg-white/5 transition-all focus:ring-4 focus:ring-[#00BE9B]/10 ${duplicateStatuses[field.id]?.isDuplicate ? 'border-rose-500/50' : duplicateStatuses[field.id]?.checked ? 'border-emerald-500/50' : ''}`}
                                                        placeholder={field.placeholder}
                                                        style={{
                                                            borderColor: duplicateStatuses[field.id]?.isDuplicate
                                                                ? '#f43f5e'
                                                                : duplicateStatuses[field.id]?.checked
                                                                    ? '#10b981'
                                                                    : 'var(--border-primary)',
                                                            color: 'var(--text-primary)',
                                                            backgroundColor: 'var(--bg-primary)'
                                                        }}
                                                    />
                                                    {loadingField[field.id] && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <div className="w-3 h-3 border-2 border-[#00BE9B] border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                                </div>
                                                {duplicateStatuses[field.id]?.checked && (
                                                    <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-1.5 w-fit ${duplicateStatuses[field.id].isDuplicate ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                        {duplicateStatuses[field.id].isDuplicate ? (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>{duplicateStatuses[field.id].isLocal ? 'Already in form' : 'Already Exists'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>New</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="group/field space-y-1 col-span-2">
                                            <div className="flex justify-between items-center pr-2">
                                                <span className="text-[12px] font-black text-[#00BE9B]/80 uppercase tracking-widest ml-1">Primary Email</span>
                                                {emailFields.length < 9 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => addField('email')}
                                                        className="px-3 py-1.5 rounded-lg bg-[#00BE9B]/10 text-[#00BE9B] flex items-center gap-2 hover:bg-[#00BE9B] hover:text-white transition-all transform active:scale-95 border border-[#00BE9B]/20"
                                                        title="Add more Email Addresses"
                                                    >
                                                        <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">Add Email</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={formData.primaryEmail}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, primaryEmail: e.target.value }))}
                                                    className={`w-full px-4 py-2.5 rounded-lg border outline-none font-bold text-sm transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5 ${duplicateStatuses['primaryEmail']?.isDuplicate ? 'border-rose-500/50' : duplicateStatuses['primaryEmail']?.checked ? 'border-emerald-500/50' : 'var(--border-primary)'}`}
                                                    placeholder="john@leadsync.com"
                                                    style={{
                                                        borderColor: duplicateStatuses['primaryEmail']?.isDuplicate
                                                            ? '#f43f5e'
                                                            : duplicateStatuses['primaryEmail']?.checked
                                                                ? '#10b981'
                                                                : 'var(--border-primary)',
                                                        color: 'var(--text-primary)',
                                                        backgroundColor: 'var(--bg-primary)'
                                                    }}
                                                />
                                                {loadingField['primaryEmail'] && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="w-3 h-3 border-2 border-[#00BE9B] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#00BE9B] to-[#00a082] scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                            </div>
                                            {duplicateStatuses['primaryEmail']?.checked && (
                                                <div className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 ${duplicateStatuses['primaryEmail'].isDuplicate ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {duplicateStatuses['primaryEmail'].isDuplicate ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{duplicateStatuses['primaryEmail'].message}{duplicateStatuses['primaryEmail'].match ? ` : ${duplicateStatuses['primaryEmail'].match}` : ''}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>New Record</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {emailFields.map((field) => (
                                            <div key={field.id} className="group/field space-y-1 animate-in zoom-in-95 duration-300">
                                                <div className="flex justify-between items-center pr-2">
                                                    <label className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest ml-1 block">
                                                        {field.label}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeField(field.id, 'email')}
                                                        className="w-4 h-4 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                        title="Remove Field"
                                                    >
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        value={field.value}
                                                        onChange={(e) => handleAdditionalFieldChange(field.id, 'email', e.target.value)}
                                                        className={`w-full px-4 py-2.5 rounded-lg border border-dashed outline-none font-bold text-sm bg-white/5 transition-all focus:ring-4 focus:ring-[#00BE9B]/10 ${duplicateStatuses[field.id]?.isDuplicate ? 'border-rose-500/50' : duplicateStatuses[field.id]?.checked ? 'border-emerald-500/50' : ''}`}
                                                        placeholder={field.placeholder}
                                                        style={{
                                                            borderColor: duplicateStatuses[field.id]?.isDuplicate
                                                                ? '#f43f5e'
                                                                : duplicateStatuses[field.id]?.checked
                                                                    ? '#10b981'
                                                                    : 'var(--border-primary)',
                                                            color: 'var(--text-primary)',
                                                            backgroundColor: 'var(--bg-primary)'
                                                        }}
                                                    />
                                                    {loadingField[field.id] && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <div className="w-3 h-3 border-2 border-[#00BE9B] border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                                </div>
                                                {duplicateStatuses[field.id]?.checked && (
                                                    <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-1.5 w-fit ${duplicateStatuses[field.id].isDuplicate ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                        {duplicateStatuses[field.id].isDuplicate ? (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>{duplicateStatuses[field.id].isLocal ? 'Already in form' : 'Already Exists'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>New</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-3 rounded-[1rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Lead Source Link </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-6">
                            <div className="group/field space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Select Lead Source
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.leadSource}
                                        onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value }))}
                                        className="w-full px-5 py-3 rounded-xl border outline-none font-bold transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5 appearance-none cursor-pointer"
                                        style={{
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)',
                                            backgroundColor: 'var(--bg-primary)'
                                        }}
                                    >
                                        <option value="" className="bg-slate-900 text-white">Choose a source...</option>
                                        <option value="Capella Portal" className="bg-slate-900 text-white">Capella Portal</option>
                                        <option value="Facebook" className="bg-slate-900 text-white">Facebook</option>
                                        <option value="Instagram" className="bg-slate-900 text-white">Instagram</option>
                                        <option value="YouTube" className="bg-slate-900 text-white">YouTube</option>
                                        <option value="Other" className="bg-slate-900 text-white">Other Source</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                </div>
                            </div>

                            {formData.leadSource && (formData.leadSource === 'Facebook' || formData.leadSource === 'Instagram' || formData.leadSource === 'YouTube' || formData.leadSource === 'Capella Portal') && (
                                <div className="group/field space-y-2 animate-in slide-in-from-left-5 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1 block" style={{ color: 'var(--text-tertiary)' }}>
                                        {formData.leadSource} Profile URL
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={formData.sourceUrl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                                            className="w-full px-5 py-3 rounded-xl border outline-none font-bold transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5"
                                            placeholder={`https://www.${formData.leadSource.toLowerCase()}.com/username`}
                                            style={{
                                                borderColor: 'var(--border-primary)',
                                                color: 'var(--text-primary)',
                                                backgroundColor: 'var(--bg-primary)'
                                            }}
                                        />
                                        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                    </div>
                                </div>
                            )}

                            {formData.leadSource === 'Other' && (
                                <>
                                    <div className="group/field space-y-2 animate-in slide-in-from-left-5 duration-500">
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1 block" style={{ color: 'var(--text-tertiary)' }}>
                                            Custom Source Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.customSourceName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customSourceName: e.target.value }))}
                                                className="w-full px-5 py-3 rounded-xl border outline-none font-bold transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5"
                                                placeholder="e.g. LinkedIn, TikTok, etc."
                                                style={{
                                                    borderColor: 'var(--border-primary)',
                                                    color: 'var(--text-primary)',
                                                    backgroundColor: 'var(--bg-primary)'
                                                }}
                                            />
                                            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="group/field space-y-2 animate-in slide-in-from-left-5 duration-500">
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1 block" style={{ color: 'var(--text-tertiary)' }}>
                                            Source Link
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={formData.sourceUrl}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                                                className="w-full px-5 py-3 rounded-xl border outline-none font-bold transition-all duration-300 focus:ring-4 focus:ring-[#00BE9B]/10 bg-white/5"
                                                placeholder="https://..."
                                                style={{
                                                    borderColor: 'var(--border-primary)',
                                                    color: 'var(--text-primary)',
                                                    backgroundColor: 'var(--bg-primary)'
                                                }}
                                            />
                                            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00BE9B] to-[#00a082] hover:from-[#00a688] hover:to-[#008c72] text-white font-black rounded-xl shadow-2xl shadow-[#00BE9B]/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${submitting ? 'opacity-70 cursor-not-allowed translate-y-0' : ''}`}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Save Input Profile</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <div className="hidden lg:flex flex-1 justify-end items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }}>Auto-save Active</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputFiles;