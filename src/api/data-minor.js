import axiosInstance from './axiosInstance';

/**
 * data-minor.js
 * -----------------------------------------------------------------------
 * API endpoints for Data Minor & Verifier roles.
 * -----------------------------------------------------------------------
 */

export const dataMinorAPI = {
    // Get stats for the logged-in Data Minor
    getMyStats: async (params = {}) => {
        const response = await axiosInstance.get('/api/dm/stats', { params });
        return response.data;
    },

    // Check for duplicate leads in real-time
    checkDuplicates: async ({ email, phone }) => {
        const response = await axiosInstance.get('/api/dm/duplicates/check', {
            params: { email, phone }
        });
        return response.data;
    },

    // Submit a new lead
    submitLead: async (leadData) => {
        const response = await axiosInstance.post('/api/dm/leads', leadData);
        return response.data;
    },

    // Verifier Endpoints
    getVerifierLeads: async (limit = 20, skip = 0) => {
        const response = await axiosInstance.get('/api/verifier/leads', {
            params: { limit, skip }
        });
        return response.data;
    },

    getVerifierLeadsCount: async () => {
        const response = await axiosInstance.get('/api/verifier/leads/verifier-count');
        return response.data;
    },

    updateLeadAllEmails: async (leadId, emails) => {
        const response = await axiosInstance.post(`/api/verifier/leads/${leadId}/update-emails`, { emails });
        return response.data;
    },

    moveVerifierLeadsToLQ: async (moveCount) => {
        const response = await axiosInstance.post('/api/verifier/leads/move-all-to-lq', { moveCount });
        return response.data;
    },
};

export default dataMinorAPI;
