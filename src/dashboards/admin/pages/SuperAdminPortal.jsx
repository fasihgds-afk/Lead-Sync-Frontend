import React, { useState, useEffect, useCallback } from 'react';
import { superAdminAPI } from '../../../api/super-admin';
import SharedLoader from '../../../components/SharedLoader';

export default function SuperAdminPortal() {
    const [activeTab, setActiveTab] = useState('assignment');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, lqId: null, lqName: '' });

    // Assignment data states
    const [allManagers, setAllManagers] = useState([]);
    const [allLeadQualifiers, setAllLeadQualifiers] = useState([]);
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [selectedLqIds, setSelectedLqIds] = useState([]);

    const [managersWithLQs, setManagersWithLQs] = useState([]);
    const [selectedHierarchyManagerId, setSelectedHierarchyManagerId] = useState(null);

    // Search states
    const [managerSearch, setManagerSearch] = useState('');
    const [lqSearch, setLqSearch] = useState('');

    // Track loaded data per tab
    const [dataLoaded, setDataLoaded] = useState({
        assignment: false,
        hierarchy: false
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load Assignment Data
    const loadAssignmentData = useCallback(async (force = false) => {
        if (!force && dataLoaded.assignment && allManagers.length > 0) return;

        setLoading(true);
        setError(null);
        try {
            const [managersRes, lqsRes, managersWithLQsRes] = await Promise.all([
                superAdminAPI.getManagersWithoutLQs(),
                superAdminAPI.getUnassignedLeadQualifiers(),
                superAdminAPI.getManagersWithLQs()
            ]);

            // Combine managers from both sources
            const combinedManagers = [
                ...(managersRes.managers || []),
                ...(managersWithLQsRes.managers || [])
            ];

            // Remove duplicates
            const uniqueManagersMap = new Map();
            combinedManagers.forEach(item => {
                if (!uniqueManagersMap.has(item._id)) {
                    uniqueManagersMap.set(item._id, item);
                }
            });
            const uniqueManagers = Array.from(uniqueManagersMap.values());

            // Normalize LQs
            const normalizedLQs = (lqsRes.leadQualifiers || []).map(lq => ({
                ...lq,
                _id: lq._id || lq.id
            }));

            setAllManagers(uniqueManagers);
            setAllLeadQualifiers(normalizedLQs);
            setDataLoaded(prev => ({ ...prev, assignment: true }));
        } catch (err) {
            setError('Failed to load assignment data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dataLoaded.assignment, allManagers.length]);

    // Load Hierarchy Data
    const loadHierarchyData = useCallback(async (force = false) => {
        if (!force && dataLoaded.hierarchy && managersWithLQs.length > 0) return;

        setLoading(true);
        setError(null);
        try {
            const res = await superAdminAPI.getManagersWithLQs();
            setManagersWithLQs(res.managers || []);
            setDataLoaded(prev => ({ ...prev, hierarchy: true }));
        } catch (err) {
            setError('Failed to load hierarchy data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dataLoaded.hierarchy, managersWithLQs.length]);

    // Handle tab change - load only the needed data
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSelectedManagerId('');
        setSelectedLqIds([]);
        setManagerSearch('');
        setLqSearch('');
        setError(null);

        if (tab === 'assignment') {
            loadAssignmentData();
        } else if (tab === 'hierarchy') {
            loadHierarchyData();
        }
    }, [loadAssignmentData, loadHierarchyData]);

    // Initial load
    useEffect(() => {
        loadAssignmentData();
    }, [loadAssignmentData]);

    const handleAssign = async () => {
        if (!selectedManagerId || selectedLqIds.length === 0) return;

        setActionLoading(true);
        try {
            await superAdminAPI.assignLqsToManager(selectedManagerId, selectedLqIds);
            setSelectedLqIds([]);
            setSelectedManagerId('');

            // Reset loaded data to force refresh
            setDataLoaded({ assignment: false, hierarchy: false });
            await Promise.all([loadAssignmentData(true), loadHierarchyData(true)]);
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

            // Reset loaded data to force refresh
            setDataLoaded({ assignment: false, hierarchy: false });
            await Promise.all([loadAssignmentData(true), loadHierarchyData(true)]);

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

    const handleManagerSelect = (manager) => {
        setSelectedHierarchyManagerId(manager._id);
    };

    // Derived selected manager from the latest data
    const selectedManager = React.useMemo(() => {
        if (!selectedHierarchyManagerId) return null;
        return managersWithLQs.find(m => m._id === selectedHierarchyManagerId);
    }, [selectedHierarchyManagerId, managersWithLQs]);

    // Filter managers for hierarchy view
    const filteredManagers = managersWithLQs.filter(m =>
        m.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(managerSearch.toLowerCase())
    );

    // Filter managers for assignment view
    const filteredManagersForAssignment = allManagers.filter(m =>
        m.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(managerSearch.toLowerCase())
    );

    // Filter LQs for assignment view
    const filteredLQs = allLeadQualifiers.filter(lq =>
        lq.name?.toLowerCase().includes(lqSearch.toLowerCase()) ||
        lq.email?.toLowerCase().includes(lqSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen py-8 px-4 md:px-8"
            style={{
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
            }}>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
                    <div className={`px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 border ${toast.type === 'success'
                        ? 'bg-[var(--bg-secondary)] border-emerald-500/30 text-emerald-400'
                        : 'bg-[var(--bg-secondary)] border-red-500/30 text-red-400'
                        }`}>
                        {toast.type === 'success' ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {toast.msg}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="rounded-2xl p-8 border shadow-xl"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-primary)'
                        }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Assign LQ to Manger
                                </h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Manage lead qualifiers and their assignments
                                </p>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex gap-2 p-1 rounded-xl"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <button
                                    onClick={() => handleTabChange('assignment')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'assignment'
                                        ? 'text-white shadow-lg'
                                        : 'opacity-60 hover:opacity-100'
                                        }`}
                                    style={{
                                        background: activeTab === 'assignment'
                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                            : 'transparent',
                                        color: activeTab === 'assignment' ? 'white' : 'var(--text-primary)'
                                    }}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Assign LQs
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleTabChange('hierarchy')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'hierarchy'
                                        ? 'text-white shadow-lg'
                                        : 'opacity-60 hover:opacity-100'
                                        }`}
                                    style={{
                                        background: activeTab === 'hierarchy'
                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                            : 'transparent',
                                        color: activeTab === 'hierarchy' ? 'white' : 'var(--text-primary)'
                                    }}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        View Assigned
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 animate-fadeIn">
                        <div className="p-4 rounded-xl flex items-center gap-3"
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-error)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: "var(--accent-error)" }}>{error}</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <SharedLoader size="large" />
                    </div>
                )}

                {/* Assignment View */}
                {!loading && activeTab === 'assignment' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Managers Card */}
                        <div className="rounded-2xl border shadow-lg overflow-hidden"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-primary)'
                            }}>
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Select Manager
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    Choose a manager to assign lead qualifiers
                                </p>
                            </div>

                            <div className="p-6">
                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={managerSearch}
                                        onChange={(e) => setManagerSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)] transition-all text-sm"
                                        style={{
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                {/* Managers List */}
                                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {filteredManagersForAssignment.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                No managers found
                                            </p>
                                        </div>
                                    ) : (
                                        filteredManagersForAssignment.map((manager) => (
                                            <div
                                                key={manager._id}
                                                onClick={() => setSelectedManagerId(manager._id)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedManagerId === manager._id
                                                    ? 'border-[var(--accent-success)] shadow-md'
                                                    : 'hover:border-[var(--accent-success)]/30'
                                                    }`}
                                                style={{
                                                    backgroundColor: selectedManagerId === manager._id
                                                        ? 'rgba(16, 185, 129, 0.1)'
                                                        : 'var(--bg-tertiary)',
                                                    borderColor: selectedManagerId === manager._id
                                                        ? 'var(--accent-success)'
                                                        : 'var(--border-primary)'
                                                }}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                            {manager.name}
                                                        </h3>
                                                        <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                            {manager.email}
                                                        </p>
                                                    </div>
                                                    {(manager.assignedLQs?.length > 0 || manager.lqCount > 0) && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold"
                                                            style={{
                                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                                color: 'var(--accent-success)'
                                                            }}>
                                                            {manager.assignedLQs?.length || manager.lqCount} assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lead Qualifiers Card */}
                        <div className="rounded-2xl border shadow-lg overflow-hidden"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-primary)'
                            }}>
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                            Lead Qualifiers
                                        </h2>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                            Select qualifiers to assign
                                        </p>
                                    </div>
                                    {selectedLqIds.length > 0 && (
                                        <button
                                            onClick={() => setSelectedLqIds([])}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                                            style={{ color: 'var(--accent-error)' }}>
                                            Clear ({selectedLqIds.length})
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search qualifiers..."
                                        value={lqSearch}
                                        onChange={(e) => setLqSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)] transition-all text-sm"
                                        style={{
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                {/* Lead Qualifiers List */}
                                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {filteredLQs.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                No lead qualifiers found
                                            </p>
                                        </div>
                                    ) : (
                                        filteredLQs.map((lq) => (
                                            <label
                                                key={lq._id}
                                                className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${selectedLqIds.includes(lq._id)
                                                    ? 'border-[var(--accent-success)] shadow-md'
                                                    : 'hover:border-[var(--accent-success)]/30'
                                                    }`}
                                                style={{
                                                    backgroundColor: selectedLqIds.includes(lq._id)
                                                        ? 'rgba(16, 185, 129, 0.1)'
                                                        : 'var(--bg-tertiary)',
                                                    borderColor: selectedLqIds.includes(lq._id)
                                                        ? 'var(--accent-success)'
                                                        : 'var(--border-primary)'
                                                }}>
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
                                                    className="h-4 w-4 mt-0.5 mr-3 rounded"
                                                    style={{ accentColor: 'var(--accent-success)' }}
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                        {lq.name}
                                                    </h3>
                                                    <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                        {lq.email}
                                                    </p>
                                                    {lq.assignedManager && (
                                                        <p className="text-xs mt-2" style={{ color: 'var(--accent-success)' }}>
                                                            Currently assigned to: {lq.assignedManager.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>

                                {/* Assign Button */}
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedManagerId || selectedLqIds.length === 0 || actionLoading}
                                    className="w-full mt-6 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: (!selectedManagerId || selectedLqIds.length === 0 || actionLoading)
                                            ? 'var(--text-tertiary)'
                                            : 'linear-gradient(135deg, #10b981, #059669)',
                                    }}>
                                    <div className="flex items-center justify-center gap-2">
                                        {actionLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Assigning...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span>Assign {selectedLqIds.length} Qualifier{selectedLqIds.length !== 1 ? 's' : ''}</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hierarchy View */}
                {!loading && activeTab === 'hierarchy' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Managers List */}
                        <div className="rounded-2xl border shadow-lg overflow-hidden"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-primary)'
                            }}>
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Managers
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    Select a manager to view their team
                                </p>
                            </div>

                            <div className="p-6">
                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search manager..."
                                        value={managerSearch}
                                        onChange={(e) => setManagerSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)] transition-all text-sm"
                                        style={{
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                {/* Managers List */}
                                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {filteredManagers.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                No managers found
                                            </p>
                                        </div>
                                    ) : (
                                        filteredManagers.map((manager) => (
                                            <div
                                                key={manager._id}
                                                onClick={() => handleManagerSelect(manager)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedManager?._id === manager._id
                                                    ? 'border-[var(--accent-success)] shadow-md'
                                                    : 'hover:border-[var(--accent-success)]/30'
                                                    }`}
                                                style={{
                                                    backgroundColor: selectedManager?._id === manager._id
                                                        ? 'rgba(16, 185, 129, 0.1)'
                                                        : 'var(--bg-tertiary)',
                                                    borderColor: selectedManager?._id === manager._id
                                                        ? 'var(--accent-success)'
                                                        : 'var(--border-primary)'
                                                }}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                            {manager.name}
                                                        </h3>
                                                        <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                            {manager.email}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            color: 'var(--accent-success)'
                                                        }}>
                                                        {manager.assignedLQs?.length || 0} members
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Team Members */}
                        <div className="rounded-2xl border shadow-lg overflow-hidden"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-primary)'
                            }}>
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Team Members
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedManager ? `Assigned to ${selectedManager.name}` : 'Select a manager to view team members'}
                                </p>
                            </div>

                            <div className="p-6">
                                {!selectedManager ? (
                                    <div className="text-center py-10">
                                        <svg className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                            Select a manager from the list to view their team
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(!selectedManager.assignedLQs || selectedManager.assignedLQs.length === 0) ? (
                                            <div className="text-center py-10">
                                                <p className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                    No team members assigned yet
                                                </p>
                                            </div>
                                        ) : (
                                            selectedManager.assignedLQs.map((lq) => (
                                                <div
                                                    key={lq._id}
                                                    className="p-4 rounded-xl border flex justify-between items-center"
                                                    style={{
                                                        backgroundColor: 'var(--bg-tertiary)',
                                                        borderColor: 'var(--border-primary)'
                                                    }}>
                                                    <div>
                                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                            {lq.name}
                                                        </h3>
                                                        <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                            {lq.email}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => promptUnassign(lq)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                                        style={{
                                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                            color: 'var(--accent-error)',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                                        }}>
                                                        Unassign
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)'
                        }}>
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-error)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Unassign Lead Qualifier?
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Are you sure you want to remove <br />
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{confirmModal.lqName}</span>
                                <br /> from this manager's team?
                            </p>
                        </div>
                        <div className="flex border-t" style={{ borderColor: 'var(--border-primary)' }}>
                            <button
                                onClick={() => setConfirmModal({ show: false, lqId: null, lqName: '' })}
                                className="flex-1 py-3 text-sm font-semibold transition-colors hover:opacity-70"
                                style={{ color: 'var(--text-secondary)' }}>
                                Cancel
                            </button>
                            <button
                                onClick={executeUnassign}
                                disabled={actionLoading}
                                className="flex-1 py-3 text-sm font-semibold transition-colors hover:opacity-70"
                                style={{ color: 'var(--accent-error)' }}>
                                {actionLoading ? 'Removing...' : 'Confirm Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(16, 185, 129, 0.3);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(16, 185, 129, 0.6);
                    }
                    @keyframes scaleIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    .animate-scaleIn {
                        animation: scaleIn 0.2s ease-out;
                    }
                `
            }} />
        </div>
    );
}