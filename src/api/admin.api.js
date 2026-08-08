import axiosInstance from './axiosInstance';

/**
 * admin.api.js
 * -----------------------------------------------------------------------
 * Central Admin & Super Admin API services.
 * Integrates dashboard metrics, signup requests approval/rejection,
 * lead stage filtering, manager/LQ assignments, and lead rejection requests.
 * -----------------------------------------------------------------------
 */

export const adminAPI = {
  // --- Overview & Dashboard Metrics ---
  getOverview: async (params = {}) => {
    const response = await axiosInstance.get('/api/superadmin/overview', { params });
    return response.data;
  },

  // --- User Signup Requests Management ---
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

  rejectSignupRequest: async (requestId) => {
    const response = await axiosInstance.delete(`/api/superadmin/requests/${requestId}/reject`);
    return response.data;
  },

  // --- Lead Rejection Request Management ---
  getRejectionRequests: async () => {
    const response = await axiosInstance.get('/api/superadmin/rejection-requests');
    return response.data;
  },

  decideLeadRejection: async (leadId, decision, comment) => {
    const response = await axiosInstance.patch(
      `/api/superadmin/rejection-requests/${leadId}/decision`,
      { decision, comment }
    );
    return response.data;
  },

  /**
   * Polymorphic helper for decideRejectionRequest:
   *  - If decision parameter is provided: Decides on a lead rejection request (PATCH /api/superadmin/rejection-requests/:leadId/decision)
   *  - If single argument provided: Rejects a user signup request (DELETE /api/superadmin/requests/:requestId/reject)
   */
  decideRejectionRequest: async (leadIdOrRequestId, decision, comment) => {
    if (decision !== undefined && decision !== null) {
      const response = await axiosInstance.patch(
        `/api/superadmin/rejection-requests/${leadIdOrRequestId}/decision`,
        { decision, comment }
      );
      return response.data;
    }
    const response = await axiosInstance.delete(`/api/superadmin/requests/${leadIdOrRequestId}/reject`);
    return response.data;
  },

  // --- Manager & LQ Assignment Management ---
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

  // --- Leads Management ---
  getLeadsByStage: async (stage, limit = 20, skip = 0, extraFilters = {}) => {
    const params = { limit, skip, ...extraFilters };
    if (stage) params.stage = stage;
    const response = await axiosInstance.get('/api/superadmin/leads', { params });
    return response.data;
  },

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
  getPerformance: async (role, extraParams = {}) => {
    const params = { role, ...extraParams };
    const response = await axiosInstance.get('/api/superadmin/performance', { params });
    return response.data;
  },

  // --- User Management ---
  makeSuperAdmin: async (userId) => {
    const response = await axiosInstance.patch(`/api/superadmin/users/${userId}/make-super-admin`);
    return response.data;
  },

  // --- Debug Utilities ---
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
