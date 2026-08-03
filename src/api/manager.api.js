import axiosInstance from './axiosInstance';
import tokenManager from '../utils/tokenManager';

const isProd = import.meta.env.PROD;
const logError = (...args) => { if (!isProd) console.error(...args); };

export const managerAPI = {
    // Get leads assigned to the current Manager
    getMyLeads: async (params = {}) => {
        const response = await axiosInstance.get('/api/manager/leads', { params });
        return response.data;
    },

    // Get leads that were approved for rejection (REJECTED stage)
    getApprovedRejections: async (params = {}) => {
        const response = await axiosInstance.get('/api/manager/rejections-approved', { params });
        return response.data;
    },

    // Request lead rejection (Sent to Super Admin)
    requestRejection: async (leadId, comment) => {
        const response = await axiosInstance.post(`/api/manager/leads/${leadId}/reqRejection`, { comment });
        return response.data;
    },

    // Accept or Reject a lead (If needed for other purposes)
    submitDecision: async (leadId, decision, comment) => {
        const response = await axiosInstance.post(`/api/manager/leads/${leadId}/decision`, { decision, comment });
        return response.data;
    },

    // Add a general comment
    addComment: async (leadId, comment) => {
        const response = await axiosInstance.post(`/api/manager/leads/${leadId}/comment`, { comment });
        return response.data;
    },

    // Mark lead as PAID
    markAsPaid: async (leadId, amount, comment) => {
        const response = await axiosInstance.post(`/api/manager/leads/${leadId}/payment-status`, { amount, comment });
        return response.data;
    },

    // Get manager stats
    getStats: async (params = {}) => {
        const user = tokenManager.getUser();

        // Backend route is /api/manager/leads/stats/:managerId
        const managerId = params.managerId || user?.id || user?._id;

        if (!managerId) {
            logError("No managerId found for stats request");
            throw new Error("Manager ID is required");
        }

        const response = await axiosInstance.get(`/api/manager/leads/stats/${managerId}`, { params });
        return response.data;
    }
};

export default managerAPI;
