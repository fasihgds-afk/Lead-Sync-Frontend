import React, { useState } from 'react';
import { superAdminAPI } from '../../../api/super-admin';
import SharedLoader from '../../../components/SharedLoader';

export default function SuperAdminPortal() {
    const [activeTab, setActiveTab] = useState(null); // null | 'assignment' | 'hierarchy'

    // Data states
    const [allManagers, setAllManagers] = useState([]);
    const [allLeadQualifiers, setAllLeadQualifiers] = useState([]);
    const [managersWithLQs, setManagersWithLQs] = useState([]);

    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [selectedLqIds, setSelectedLqIds] = useState([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [assignmentLoaded, setAssignmentLoaded] = useState(false);
    const [hierarchyLoaded, setHierarchyLoaded] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, lqId: null, lqName: '' });

    // Search
    const [managerSearch, setManagerSearch] = useState('');
    const [lqSearch, setLqSearch] = useState('');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadAssignmentData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [managersRes, lqsRes, managersWithLQsRes] = await Promise.all([
                superAdminAPI.getManagersWithoutLQs(), // Returns managers (potentially filtered or partial)
                superAdminAPI.getUnassignedLeadQualifiers(), // Returns ALL LQs now
                superAdminAPI.getManagersWithLQs() // Returns managers who ALREADY have LQs
            ]);

            // Combine both lists and remove duplicates by ID to show EVERYONE in the dropdown
            const combinedManagers = [
                ...(managersRes.managers || []),
                ...(managersWithLQsRes.managers || [])
            ];

            // Start Debug Console Logs
            console.group('🔍 SUPER ADMIN ASSIGNMENT DATA');
            console.log('Managers (Without LQs):', managersRes.managers?.length || 0);
            console.log('Managers (With LQs):', managersWithLQsRes.managers?.length || 0);
            console.log('Raw Combined Managers:', combinedManagers.length);

            // Remove duplicates based on _id
            const uniqueManagersMap = new Map();
            combinedManagers.forEach(item => {
                if (!uniqueManagersMap.has(item._id)) {
                    uniqueManagersMap.set(item._id, item);
                }
            });
            const uniqueManagers = Array.from(uniqueManagersMap.values());

            console.log('Final Unique Managers List:', uniqueManagers);

            // Normalize LQs to ensure _id is present (backend sends 'id' for LQs but '_id' for managers)
            const normalizedLQs = (lqsRes.leadQualifiers || []).map(lq => ({
                ...lq,
                _id: lq._id || lq.id
            }));
            console.log('All LQs:', normalizedLQs.length);
            console.groupEnd();

            setAllManagers(uniqueManagers);
            setAllLeadQualifiers(normalizedLQs);
            setAssignmentLoaded(true);
        } catch (err) {
            setError('Failed to load assignment data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadHierarchyData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminAPI.getManagersWithLQs();
            setManagersWithLQs(res.managers || []);
            setHierarchyLoaded(true);
        } catch (err) {
            setError('Failed to load hierarchy data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedManagerId('');
        setSelectedLqIds([]);
        setManagerSearch(''); // Reset search on tab change
        if (tab === 'assignment' && !assignmentLoaded) {
            loadAssignmentData();
        }
        if (tab === 'hierarchy' && !hierarchyLoaded) {
            loadHierarchyData();
        }
    };

    const handleAssign = async () => {
        if (!selectedManagerId || selectedLqIds.length === 0) return;

        setActionLoading(true);
        try {
            await superAdminAPI.assignLqsToManager(selectedManagerId, selectedLqIds);
            setSelectedLqIds([]);
            setSelectedManagerId('');
            await Promise.all([loadAssignmentData(), loadHierarchyData()]);
            showToast('Successfully assigned!');
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Failed to assign';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const promptUnassign = (lq) => {
        setConfirmModal({ show: true, lqId: lq._id, lqName: lq.name });
    };

    const executeUnassign = async () => {
        if (!confirmModal.lqId) return;

        setActionLoading(true);
        try {
            await superAdminAPI.unassignLqs([confirmModal.lqId]);
            await Promise.all([loadAssignmentData(), loadHierarchyData()]);
            showToast('Unassigned successfully');
            setConfirmModal({ show: false, lqId: null, lqName: '' });
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Failed to unassign';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const refresh = () => {
        if (activeTab === 'assignment') loadAssignmentData();
        if (activeTab === 'hierarchy') loadHierarchyData();
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(35,76,106,0.45),_rgba(15,42,63,0.95)_55%,_rgba(15,42,63,1))]" />
                <div className="absolute -top-28 -right-24 w-80 h-80 bg-[var(--accent-primary)]/15 blur-[120px] rounded-full" />
                <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-[var(--bg-tertiary)]/40 blur-[130px] rounded-full" />
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
                    <div
                        className={`px-6 py-3 rounded-2xl border shadow-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 ${toast.type === 'success'
                            ? 'bg-[var(--bg-secondary)] border-emerald-500/30 text-emerald-400'
                            : 'bg-[var(--bg-secondary)] border-red-500/30 text-red-400'
                            }`}
                    >
                        <span className="text-[12px]">{toast.type === 'success' ? 'OK' : 'X'}</span>
                        {toast.msg}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="max-w-[1500px] mx-auto">
                <div className="bg-[var(--bg-secondary)] rounded-[28px] shadow-2xl border border-[var(--border-primary)] p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-tight">
                                Assign<span className="text-emerald-500"> Lead Qualifiers</span>
                            </h1>

                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex bg-[var(--bg-tertiary)]/60 border border-[var(--border-primary)] rounded-2xl p-1.5 shadow-sm">
                                <button
                                    onClick={() => handleTabChange('assignment')}
                                    className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'assignment'
                                        ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    Assignment
                                </button>
                                <button
                                    onClick={() => handleTabChange('hierarchy')}
                                    className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'hierarchy'
                                        ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] shadow'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    View Assigned LQs
                                </button>
                            </div>

                            <button
                                onClick={refresh}
                                disabled={!activeTab || loading || actionLoading}
                                className="px-5 py-2.5 bg-[var(--bg-tertiary)]/60 border border-[var(--border-primary)] rounded-xl text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition disabled:opacity-40 disabled:hover:text-[var(--text-secondary)]"
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="max-w-[1500px] mx-auto bg-red-500/10 border border-red-500/20 text-red-300 p-5 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-widest">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <SharedLoader size="large" />
                </div>
            )}

            {/* Assignment View */}
            {activeTab === 'assignment' && !loading && (
                <div className="grid lg:grid-cols-2 gap-6 max-w-[1500px] mx-auto">
                    {/* Managers */}
                    <div className="bg-[var(--bg-secondary)] rounded-[24px] shadow-xl border border-[var(--border-primary)] p-6">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] mb-5">
                            Select Manager
                        </h2>

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={managerSearch}
                            onChange={(e) => setManagerSearch(e.target.value)}
                            className="w-full bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:opacity-40 mb-5 outline-none focus:border-[var(--accent-primary)]/40"
                        />

                        {allManagers.length === 0 ? (
                            <div className="text-center py-10 text-[var(--text-tertiary)] text-[11px] font-black uppercase tracking-widest">
                                No managers found
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {allManagers
                                    .filter(
                                        (m) =>
                                            m.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
                                            m.email?.toLowerCase().includes(managerSearch.toLowerCase())
                                    )
                                    .map((manager) => (
                                        <div
                                            key={manager._id}
                                            onClick={() => setSelectedManagerId(manager._id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedManagerId === manager._id
                                                ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40'
                                                : 'bg-[var(--bg-tertiary)]/20 border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="text-[12px] font-black text-[var(--text-primary)]">{manager.name}</div>
                                                {/* Show badge if they have LQs */}
                                                {(manager.assignedLQs?.length > 0 || manager.lqCount > 0) && (
                                                    <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                        {manager.assignedLQs?.length || manager.lqCount} Assigned
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase opacity-70">
                                                {manager.email}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Lead Qualifiers */}
                    <div className="bg-[var(--bg-secondary)] rounded-[24px] shadow-xl border border-[var(--border-primary)] p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
                                Select Lead Qualifiers
                            </h2>
                            {selectedLqIds.length > 0 && (
                                <button
                                    onClick={() => setSelectedLqIds([])}
                                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300"
                                >
                                    Clear selection ({selectedLqIds.length})
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Search qualifiers..."
                            value={lqSearch}
                            onChange={(e) => setLqSearch(e.target.value)}
                            className="w-full bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:opacity-40 mb-5 outline-none focus:border-[var(--accent-primary)]/40"
                        />

                        {allLeadQualifiers.length === 0 ? (
                            <div className="text-center py-10 text-[var(--text-tertiary)] text-[11px] font-black uppercase tracking-widest">
                                No lead qualifiers found
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {allLeadQualifiers
                                    .filter(
                                        (lq) =>
                                            lq.name?.toLowerCase().includes(lqSearch.toLowerCase()) ||
                                            lq.email?.toLowerCase().includes(lqSearch.toLowerCase())
                                    )
                                    .map((lq) => (
                                        <label
                                            key={lq._id}
                                            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${selectedLqIds.includes(lq._id)
                                                ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40'
                                                : 'bg-[var(--bg-tertiary)]/20 border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedLqIds.includes(lq._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedLqIds([...selectedLqIds, lq._id]);
                                                    } else {
                                                        setSelectedLqIds(selectedLqIds.filter(id => id !== lq._id));
                                                    }
                                                }}
                                                className="h-4 w-4 accent-[var(--accent-primary)] mr-4"
                                            />
                                            <div>
                                                <div className="text-[12px] font-black text-[var(--text-primary)]">{lq.name}</div>
                                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase opacity-70">
                                                    {lq.email}
                                                </div>
                                                {lq.assignedManager && (
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] mt-1">
                                                        Assigned to: {lq.assignedManager.name}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                            </div>
                        )}

                        <button
                            onClick={handleAssign}
                            disabled={!selectedManagerId || selectedLqIds.length === 0 || actionLoading}
                            className="mt-6 w-full bg-[var(--accent-primary)] text-white py-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent-primary)]/20 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-[0.3em]"
                        >
                            {actionLoading ? (
                                'Assigning...'
                            ) : (
                                <>
                                    Assign {selectedLqIds.length || ''} Qualifier{selectedLqIds.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Hierarchy View */}
            {activeTab === 'hierarchy' && !loading && (
                <div className="grid lg:grid-cols-[1fr_2fr] gap-4 max-w-[1500px] mx-auto h-[calc(100vh-180px)]">
                    {/* Left Column: Managers List */}
                    <div className="bg-[var(--bg-secondary)] rounded-[20px] shadow-xl border border-[var(--border-primary)] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-[var(--border-primary)]">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">
                                Managers
                            </h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search manager..."
                                    value={managerSearch}
                                    onChange={(e) => setManagerSearch(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)] rounded-lg px-3 py-2.5 text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:opacity-40 outline-none focus:border-[var(--accent-primary)]/40 pl-8"
                                />
                                <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar space-y-1">
                            {managersWithLQs
                                .filter(m =>
                                    m.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
                                    m.email?.toLowerCase().includes(managerSearch.toLowerCase())
                                )
                                .map((manager) => (
                                    <div
                                        key={manager._id}
                                        onClick={() => setSelectedManagerId(manager._id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedManagerId === manager._id
                                            ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40'
                                            : 'bg-[var(--bg-tertiary)]/20 border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="text-[12px] font-black text-[var(--text-primary)]">{manager.name}</div>
                                            {manager.assignedLQs?.length > 0 && (
                                                <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {manager.assignedLQs.length} Assigned
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase opacity-70 mt-1">
                                            {manager.email}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="bg-[var(--bg-secondary)] rounded-[20px] shadow-xl border border-[var(--border-primary)] p-0 overflow-hidden flex flex-col relative">
                        {!selectedManagerId ? (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-10 opacity-40">
                                <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
                                    Select a manager
                                </div>
                            </div>
                        ) : (() => {
                            const selectedManager = managersWithLQs.find(m => m._id === selectedManagerId);
                            if (!selectedManager) return null;

                            return (
                                <div className="flex flex-col h-full">
                                    <div className="p-5 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/5">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xl font-black text-[var(--text-primary)] mb-0.5">
                                                    {selectedManager.name}
                                                </h2>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-70">
                                                    {selectedManager.email}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Total</span>
                                                <div className="text-2xl font-black text-[var(--accent-primary)] leading-none">
                                                    {selectedManager.assignedLQs?.length || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(!selectedManager.assignedLQs || selectedManager.assignedLQs.length === 0) ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] opacity-50">
                                                No Team Members
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-y-auto flex-1 custom-scrollbar p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {selectedManager.assignedLQs.map((lq) => (
                                                    <div
                                                        key={lq._id}
                                                        className="group relative p-3 bg-[var(--bg-tertiary)]/20 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 hover:bg-[var(--bg-tertiary)]/40 transition-all duration-200 flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] text-[10px] font-black shrink-0">
                                                                {lq.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-[11px] font-bold text-[var(--text-primary)] truncate leading-tight">
                                                                    {lq.name}
                                                                </div>
                                                                <div className="text-[9px] font-medium text-[var(--text-tertiary)] truncate opacity-70">
                                                                    {lq.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                promptUnassign(lq);
                                                            }}
                                                            disabled={actionLoading}
                                                            className="shrink-0 pl-3 pr-4 py-1.5 flex items-center justify-center gap-2 bg-[var(--bg-tertiary)] hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 border border-[var(--border-primary)] hover:border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50 group/btn shadow-sm"
                                                            title="Unassign Member"
                                                        >
                                                            <svg className="w-3.5 h-3.5 opacity-70 group-hover/btn:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 2.192V17h12.5" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12h-4" />
                                                            </svg>
                                                            Unassign
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Unassign Lead Qualifier?</h3>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                                Are you sure you want to remove <br />
                                <span className="font-bold text-[var(--text-primary)]">{confirmModal.lqName}</span>
                                <br /> from this manager's team?
                            </p>
                        </div>
                        <div className="flex border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]/30">
                            <button
                                onClick={() => setConfirmModal({ show: false, lqId: null, lqName: '' })}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50 transition border-r border-[var(--border-primary)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeUnassign}
                                disabled={actionLoading}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/5 transition disabled:opacity-50"
                            >
                                {actionLoading ? 'Removing...' : 'Confirm Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome / No Tab Selected */}
            {!activeTab && !loading && (
                <div className="bg-[var(--bg-secondary)] rounded-[32px] shadow-2xl border border-[var(--border-primary)] p-10 md:p-14 max-w-[1200px] mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,190,155,0.12),_transparent_55%)]" />
                    <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
                        <div className="space-y-5">

                            <h2 className="text-3xl font-black text-[var(--text-primary)]">
                                Assign & Manage Lead Qualifiers
                            </h2>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => handleTabChange('assignment')}
                                    className="px-8 py-4 bg-[var(--accent-primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-lg shadow-[var(--accent-primary)]/20 hover:brightness-110 transition"
                                >
                                    Open Assignments
                                </button>
                                <button
                                    onClick={() => handleTabChange('hierarchy')}
                                    className="px-8 py-4 bg-[var(--bg-tertiary)]/70 text-[var(--text-primary)] rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/40 transition"
                                >
                                    View Assigned LQs
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-[24px] bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)]">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                                    Assignment
                                </div>
                                <div className="text-lg font-black text-[var(--text-primary)] mt-2">Assign LQs to Managers</div>
                                <div className="mt-3 space-y-2">

                                </div>
                            </div>
                            <div className="p-4 rounded-[24px] bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)]">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                                    View & Unassign
                                </div>
                                <div className="text-lg font-black text-[var(--text-primary)] mt-2">See Assigned LQs</div>
                                <div className="mt-3 space-y-2">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                        height: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.03);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 190, 155, 0.35);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: var(--accent-primary);
                    }
                `,
                }}
            />
        </div>
    );
}