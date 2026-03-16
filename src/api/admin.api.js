import axiosInstance from './axiosInstance';
import tokenManager from '../utils/tokenManager';

export const adminAPI = {
  // Get overview stats
  getOverview: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/superadmin/overview', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all pending requests
  getPendingRequests: async () => {
    const token = tokenManager.getToken();
    const response = await axiosInstance.get('/api/superadmin/requests/pending', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Approve a pending request
  approveRequest: async (requestId, role) => {
    const response = await axiosInstance.patch(`/api/superadmin/requests/${requestId}/approve`, { role });
    return response.data;
  },

  // Reject a pending request
  rejectRequest: async (requestId) => {
    const response = await axiosInstance.delete(`/api/superadmin/requests/${requestId}/reject`);
    return response.data;
  },

  // --- Leads Management ---

  /**
   * Generic helper to fetch leads by stage with pagination
   * @param {string|null} stage - The specific stage (e.g., 'DM', 'LQ', 'Manager') or null for all
   * @param {number} limit - Number of items per page
   * @param {number} skip - Number of items to skip
   * @param {object} extraFilters - Additional query parameters
   */
  getLeadsByStage: async (stage, limit = 20, skip = 0, extraFilters = {}) => {
    const params = { limit, skip, ...extraFilters };
    if (stage) params.stage = stage;
    const response = await axiosInstance.get('/api/superadmin/leads', { params });
    return response.data;
  },

  // Role-specific lead fetchers (Shorthands)
  getAllLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage(null, limit, skip, filters),

  getDMLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('DM', limit, skip, filters),

  getVerifierLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('Verifier', limit, skip, filters),

  getLQLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('LQ', limit, skip, filters),

  getManagerLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('Manager', limit, skip, filters),

  getDoneLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('DONE', limit, skip, filters),

  getRejectedLeads: async (limit = 20, skip = 0, filters = {}) =>
    adminAPI.getLeadsByStage('REJECTED', limit, skip, filters),

  // --- Analytics & Performance ---

  /**
   * Get performance metrics for a specific role
   * @param {string} role - The role to fetch performance for
   */
  getPerformance: async (role, extraParams = {}) => {
    const params = { role, ...extraParams };
    const response = await axiosInstance.get('/api/superadmin/performance', { params });
    return response.data;
  },

  // --- User Management ---

  /**
   * Promote a user to Super Admin status
   */
  makeSuperAdmin: async (userId) => {
    const response = await axiosInstance.patch(`/api/superadmin/users/${userId}/make-super-admin`);
    return response.data;
  },

  /**
   * Debug utility to retrieve and analyze lead stages
   */
  getStagesDebug: async () => {
    const response = await axiosInstance.get('/api/superadmin/leads', {
      params: { limit: 1000, skip: 0 }
    });
    if (response.data.success) {
      const leads = response.data.leads || [];
      const stages = [...new Set(leads.map(l => l.stage))];
      const stageBreakdown = leads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      }, {});
      return { stages, stageBreakdown, total: leads.length };
    }
    return response.data;
  },
};

export default adminAPI;
