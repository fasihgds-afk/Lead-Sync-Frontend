import axiosInstance from './axiosInstance';
import tokenManager from '../utils/tokenManager';

export const lqAPI = {
    // Get leads assigned to the current Lead Qualifier with filters
    getMyLeads: async (limit = 20, skip = 0, filters = {}, signal = null) => {
        const token = tokenManager.getToken();
        const params = { limit, skip, ...filters };

        const response = await axiosInstance.get('/api/lq/leads', {
            params,
            signal,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Update the status of a lead (IN_CONVERSATION, DEAD, QUALIFIED)
    updateStatus: async (leadId, lqStatus) => {
        const token = tokenManager.getToken();
        const response = await axiosInstance.patch(`/api/lq/leads/${leadId}/status`, { lqStatus, leadIds: [leadId] }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Bulk update the status of multiple leads
    updateBulkStatus: async (leadIds, lqStatus) => {
        const token = tokenManager.getToken();
        // We use 'bulk' as the ID to bypass any router parameter requirement and hit the same controller
        const response = await axiosInstance.patch(`/api/lq/leads/bulk/status`, { lqStatus, leadIds }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Add a comment to a lead
    addComment: async (leadId, text) => {
        const token = tokenManager.getToken();
        const response = await axiosInstance.post(`/api/lq/leads/${leadId}/comment`, { text }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Submit lead to the assigned Manager (multi-contact)
    submitToMyManager: async (leadId, selectedEmails = [], selectedPhones = []) => {
        const token = tokenManager.getToken();
        const response = await axiosInstance.post(
            `/api/lq/leads/${leadId}/submit-to-manager`,
            { selectedEmails, selectedPhones },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get stats for the current Lead Qualifier
    getStats: async (filters = {}) => {
        const token = tokenManager.getToken();
        const response = await axiosInstance.get('/api/lq/leads/stats', {
            params: filters,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};

export default lqAPI;
