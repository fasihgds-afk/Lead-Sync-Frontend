import axiosInstance from './axiosInstance';

/**
 * Writer API
 *
 * Endpoints (from writerController.js):
 *   GET  /api/writer/leads                  — all leads (NORMAL + RECURRING), optional ?leadType=
 *   GET  /api/writer/leads/normal            — NORMAL leads only
 *   GET  /api/writer/leads/recurring         — RECURRING leads only
 *   PATCH /api/writer/leads/:source/:leadId/status  — set writerStatus PENDING | IN_PROGRESS
 *   PATCH /api/writer/leads/:source/:leadId/done    — mark lead DONE → moves to ADMIN_REVIEW
 *
 * Pagination params: ?limit=20&skip=0
 * source param: "LEAD" | "META_LEAD"
 */
export const writerAPI = {
  /**
   * Fetch all writer leads.
   * @param {object} params  e.g. { leadType: 'NORMAL', limit: 20, skip: 0 }
   */
  getAllLeads: async (params = {}) => {
    const response = await axiosInstance.get('/api/writer/leads', { params });
    return response.data;
  },

  /**
   * Fetch only NORMAL leads.
   * @param {object} params  e.g. { limit: 20, skip: 0 }
   */
  getNormalLeads: async (params = {}) => {
    const response = await axiosInstance.get('/api/writer/leads/normal', { params });
    return response.data;
  },

  /**
   * Fetch only RECURRING leads.
   * @param {object} params  e.g. { limit: 20, skip: 0 }
   */
  getRecurringLeads: async (params = {}) => {
    const response = await axiosInstance.get('/api/writer/leads/recurring', { params });
    return response.data;
  },

  /**
   * Update writerStatus to PENDING or IN_PROGRESS.
   * @param {string} source   "LEAD" | "META_LEAD"
   * @param {string} leadId
   * @param {string} writerStatus  "PENDING" | "IN_PROGRESS"
   */
  updateStatus: async (source, leadId, writerStatus) => {
    const response = await axiosInstance.patch(
      `/api/writer/leads/${source}/${leadId}/status`,
      { writerStatus }
    );
    return response.data;
  },

  /**
   * Mark lead as DONE — transitions stage to ADMIN_REVIEW.
   * @param {string} source   "LEAD" | "META_LEAD"
   * @param {string} leadId
   */
  markDone: async (source, leadId) => {
    const response = await axiosInstance.patch(
      `/api/writer/leads/${source}/${leadId}/done`
    );
    return response.data;
  },
};

export default writerAPI;
