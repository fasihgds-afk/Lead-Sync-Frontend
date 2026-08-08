import axiosInstance from './axiosInstance';

/**
 * lead-qualifier.api.js
 * -----------------------------------------------------------------------
 * API endpoints for Lead Qualifier role operations.
 * -----------------------------------------------------------------------
 */

export const lqAPI = {
    // Get leads assigned to the current Lead Qualifier with filters
    getMyLeads: async (limit = 20, skip = 0, filters = {}, signal = null) => {
        const params = { limit, skip, ...filters };
        const response = await axiosInstance.get('/api/lq/leads', {
            params,
            signal
        });
        return response.data;
    },

    // Update the status of a lead (IN_CONVERSATION, DEAD, QUALIFIED)
    updateStatus: async (leadId, lqStatus) => {
        const response = await axiosInstance.patch(`/api/lq/leads/${leadId}/status`, { lqStatus, leadIds: [leadId] });
        return response.data;
    },

    // Bulk update the status of multiple leads
    updateBulkStatus: async (leadIds, lqStatus) => {
        const response = await axiosInstance.patch(`/api/lq/leads/bulk/status`, { lqStatus, leadIds });
        return response.data;
    },

    // Add a comment to a lead
    addComment: async (leadId, text) => {
        const response = await axiosInstance.post(`/api/lq/leads/${leadId}/comment`, { text });
        return response.data;
    },

    // Submit lead to the assigned Manager (multi-contact)
    submitToMyManager: async (leadId, selectedEmails = [], selectedPhones = []) => {
        const response = await axiosInstance.post(
            `/api/lq/leads/${leadId}/submit-to-manager`,
            { selectedEmails, selectedPhones }
        );
        return response.data;
    },

    // Get stats for the current Lead Qualifier
    getStats: async (filters = {}) => {
        const response = await axiosInstance.get('/api/lq/leads/stats', {
            params: filters
        });
        return response.data;
    },

    // Search current Lead Qualifier's accessible leads
    searchMyLeads: async (query, limit = 20, skip = 0, signal = null) => {
        const response = await axiosInstance.get('/api/lq/leads/search', {
            params: { q: query, limit, skip },
            signal
        });
        return response.data;
    }
};

export default lqAPI;
