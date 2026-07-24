import { useState, useEffect, useCallback, useRef } from 'react';
import { lqAPI } from '../../../api/lead-qualifier.api';

export const useLeadManager = (filters = {}, currentPage = 1, itemsPerPage = 20) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadsError, setLeadsError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filtersApplied, setFiltersApplied] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    // Use refs to abort previous in-flight requests
    const abortControllerRef = useRef(null);

    const fetchLeads = useCallback(async (force = false) => {
        // Abort any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        try {
            if (force) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const skip = (currentPage - 1) * itemsPerPage;
            console.log('Fetching leads with filters:', { filters, currentPage, itemsPerPage, skip });

            const response = await lqAPI.getMyLeads(itemsPerPage, skip, filters, abortControllerRef.current.signal);
            console.log('API response:', response);

            if (response.success) {
                setLeads(response.leads || []);
                setTotal(response.metadata?.total_records || 0);
                setFiltersApplied(response.metadata?.applied_filters || {});
                setLeadsError(null);
            } else {
                setLeadsError(response.message || "Failed to fetch leads");
                setLeads([]);
                setTotal(0);
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                console.log('Fetch leads request was cancelled');
                return; // Silently exit without updating state or stopping loading
            }
            console.error("Fetch leads error:", err);
            setLeadsError("Network error while fetching leads");
            setLeads([]);
            setTotal(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters, currentPage, itemsPerPage]);

    // Initial load and when filters/page changes
    useEffect(() => {
        fetchLeads();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchLeads]);

    const updateLeadStatus = async (leadId, newStatus) => {
        if (newStatus === "PENDING") return;
        try {
            const response = await lqAPI.updateStatus(leadId, newStatus);
            if (response.success) {
                setLeads(prev => prev.map(l => l._id === leadId ? { ...l, lqStatus: newStatus } : l));
                return true;
            }
        } catch (err) {
            console.error("Update status error:", err);
            return false;
        }
        return false;
    };

    const updateBulkLeadStatus = async (leadIds, newStatus) => {
        if (!leadIds || leadIds.length === 0) return false;
        try {
            const response = await lqAPI.updateBulkStatus(leadIds, newStatus);
            if (response.success) {
                // Update leads in local state
                setLeads(prev => prev.map(l => leadIds.includes(l._id) ? { ...l, lqStatus: newStatus } : l));
                return true;
            }
        } catch (err) {
            console.error("Update bulk status error:", err);
            return false;
        }
        return false;
    };

    const addLeadComment = async (leadId, commentText) => {
        try {
            const response = await lqAPI.addComment(leadId, commentText);
            if (response.success) {
                setLeads(prev => prev.map(l => {
                    if (l._id === leadId) {
                        const newComments = [...(l.comments || []), {
                            text: commentText,
                            createdByRole: 'Lead Qualifiers',
                            createdDate: new Date().toISOString()
                        }];
                        return { ...l, comments: newComments };
                    }
                    return l;
                }));
                return true;
            }
        } catch (err) {
            console.error("Add comment error:", err);
            return false;
        }
        return false;
    };

    const assignLeadManager = async (leadId, selectedEmails, selectedPhones) => {
        try {
            const response = await lqAPI.submitToMyManager(leadId, selectedEmails, selectedPhones);
            if (response.success) {
                // Refresh leads to get updated count
                fetchLeads(true);
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message || "Transfer failed" };
        } catch (err) {
            console.error("Submit to manager error:", err);
            return { 
                success: false, 
                message: err.response?.data?.message || err.message || "Failed to submit to manager" 
            };
        }
    };

    const refreshLeads = useCallback(() => {
        console.log('Refresh leads called');
        fetchLeads(true);
    }, [fetchLeads]);

    return {
        leads,
        loading,
        error: leadsError,
        total,
        filtersApplied,
        refreshing,
        updateLeadStatus,
        updateBulkLeadStatus,
        addLeadComment,
        assignLeadManager,
        refreshLeads
    };
};
