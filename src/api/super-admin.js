import axiosInstance from './axiosInstance';

export const superAdminAPI = {
    // Pending Requests Management
    getPendingRequests: async () => {
        const response = await axiosInstance.get('/api/superadmin/requests/pending');
        return response.data;
    },

    approveRequest: async (requestId, role) => {
        const response = await axiosInstance.patch(`/api/superadmin/requests/${requestId}/approve`, { role });
        return response.data;
    },

    rejectRequest: async (requestId) => {
        const response = await axiosInstance.delete(`/api/superadmin/requests/${requestId}/reject`);
        return response.data;
    },

    // Manager & LQ Assignments
    getManagersWithLQs: async () => {
        const response = await axiosInstance.get('/api/superadmin/managers/with-lqs');
        return response.data;
    },

    getManagersWithoutLQs: async () => {
        const response = await axiosInstance.get('/api/superadmin/managers/without-lqs');
        return response.data;
    },

    getUnassignedLeadQualifiers: async () => {
        const response = await axiosInstance.get('/api/superadmin/lead-qualifiers/unassigned');
        return response.data;
    },

    assignLqsToManager: async (managerId, lqIds) => {
        const response = await axiosInstance.patch(`/api/superadmin/managers/${managerId}/assign-lqs`, { lqIds });
        return response.data;
    },

    unassignLqs: async (lqIds) => {
        const response = await axiosInstance.patch('/api/superadmin/lead-qualifiers/unassign', { lqIds });
        return response.data;
    },

    // Rejection Request Management
    getRejectionRequests: async () => {
        const response = await axiosInstance.get('/api/superadmin/rejection-requests');
        return response.data;
    },
    decideRejectionRequest: async (leadId, decision, comment) => {
        const response = await axiosInstance.patch(
            `/api/superadmin/rejection-requests/${leadId}/decision`,
            { decision, comment }
        );

        return response.data;
    }
};

export default superAdminAPI;
