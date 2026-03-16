import axiosInstance from './axiosInstance';
import tokenManager from '../utils/tokenManager';

export const lqAPI = {
    // Get leads assigned to the current Lead Qualifier with filters
    getMyLeads: async (limit = 20, skip = 0, filters = {}) => {
        const token = tokenManager.getToken();
        const params = { limit, skip, ...filters };

        console.log('Making API call with params:', params);

        const response = await axiosInstance.get('/api/lq/leads', {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Raw API response:', response.data);
        return response.data;
    },

    // Update the status of a lead (IN_CONVERSATION, DEAD, QUALIFIED)
    updateStatus: async (leadId, lqStatus) => {
        const token = tokenManager.getToken();
        const response = await axiosInstance.patch(`/api/lq/leads/${leadId}/status`, { lqStatus }, {
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
