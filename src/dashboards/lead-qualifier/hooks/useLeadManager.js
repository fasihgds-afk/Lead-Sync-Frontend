import { useState, useEffect, useCallback, useRef } from 'react';
import { lqAPI } from '../../../api/lead-qualifier.api';

export const useLeadManager = (filters = {}, currentPage = 1, itemsPerPage = 20) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadsError, setLeadsError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filtersApplied, setFiltersApplied] = useState({});

    // Use refs to prevent redundant/parallel overlapping fetches
    const isFetchingLeads = useRef(false);

    const fetchLeads = useCallback(async (force = false) => {
        if (isFetchingLeads.current && !force) return;

        try {
            isFetchingLeads.current = true;
            setLoading(true);

            const skip = (currentPage - 1) * itemsPerPage;
            console.log('Fetching leads with filters:', { filters, currentPage, itemsPerPage, skip });

            const response = await lqAPI.getMyLeads(itemsPerPage, skip, filters);
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
            console.error("Fetch leads error:", err);
            setLeadsError("Network error while fetching leads");
            setLeads([]);
            setTotal(0);
        } finally {
            isFetchingLeads.current = false;
            setLoading(false);
        }
    }, [filters, currentPage, itemsPerPage]);

    // Initial load and when filters/page changes
    useEffect(() => {
        fetchLeads();
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
                return true;
            }
        } catch (err) {
            console.error("Submit to manager error:", err);
            return false;
        }
        return false;
    };

    return {
        leads,
        loading,
        error: leadsError,
        total,
        filtersApplied,
        updateLeadStatus,
        addLeadComment,
        assignLeadManager,
        refreshLeads: () => fetchLeads(true)
    };
};
