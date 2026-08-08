import axiosInstance from './axiosInstance';

/**
 * metaLeadAPI.js
 * -----------------------------------------------------------------------
 * Single source of truth for talking to the Meta Lead backend
 * (adminController.js / writerController.js, mounted at
 * /api/admin/meta-leads and /api/writer/meta-leads in app.js).
 *
 * Auth & Request Lifecycle: Routed through the central axiosInstance.
 * -----------------------------------------------------------------------
 */

/**
 * Helper to construct query string from optional params object.
 */
function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Normalizes Axios errors into a consistent error structure
 * { status, message, fieldErrors, isNetworkError, original }
 */
function handleApiError(error) {
  if (error && error.status !== undefined && error.message) {
    return Promise.reject(error);
  }

  if (!error.response) {
    return Promise.reject({
      status: 0,
      message:
        error.code === 'ECONNABORTED'
          ? 'The request timed out. Please try again.'
          : error.message || 'Unable to reach the server. Check your connection and try again.',
      isNetworkError: true,
      original: error,
    });
  }

  const { status, data } = error.response;
  return Promise.reject({
    status,
    message:
      (data && (data.message || data.error || data.msg)) ||
      error.message ||
      'Something went wrong. Please try again.',
    fieldErrors: (data && (data.errors || data.fieldErrors)) || null,
    isNetworkError: false,
    original: error,
  });
}

export const metaLeadAPI = {
  // ---------------- Admin ----------------

  /**
   * Fetch all MetaLeads with optional filters.
   * GET /api/admin/meta-leads
   * Params: { stage, status, assignedTo, limit, skip }
   */
  async getMetaLeads({ stage = '', status = '', assignedTo = '', limit = 20, skip = 0 } = {}) {
    try {
      const response = await axiosInstance.get(`/api/admin/meta-leads${toQueryString({ stage, status, assignedTo, limit, skip })}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch all approved managers for the assignment dropdown.
   * GET /api/admin/managers
   */
  async getApprovedManagers() {
    try {
      const response = await axiosInstance.get('/api/admin/managers');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new Meta Lead (stage: ADMIN_REVIEW, status: UNPAID).
   * POST /api/admin/meta-leads
   * Required: date, program, school, fullName + (email OR number)
   * Optional: website
   */
  async createMetaLead(payload) {
    try {
      const response = await axiosInstance.post('/api/admin/meta-leads', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Assign an UNPAID MetaLead to an approved Manager.
   * PATCH /api/admin/meta-leads/:leadId/assign-manager
   * Body: { managerId }
   */
  async assignMetaLeadToManager(leadId, managerId) {
    try {
      const response = await axiosInstance.patch(`/api/admin/meta-leads/${leadId}/assign-manager`, { managerId });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch all PAID leads (both Lead + MetaLead models) for Admin queue.
   * GET /api/admin/paid-leads
   */
  async getPaidLeads({ limit = 20, skip = 0, source = 'ALL' } = {}) {
    try {
      const response = await axiosInstance.get(`/api/admin/paid-leads${toQueryString({ limit, skip, source })}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Process a paid lead and push it to the writer queue.
   * PATCH /api/admin/paid-leads/:source/:leadId/process
   *
   * source: 'LEAD' | 'META_LEAD'  (comes from lead.source field in the response)
   * leadType: 'NORMAL' | 'RECURRING'
   * adminAssignedDate: required (YYYY-MM-DD) only when leadType === 'NORMAL'
   */
  async processPaidLead(source, leadId, { leadType, adminAssignedDate } = {}) {
    const body = { leadType };
    if (leadType === 'NORMAL') {
      body.adminAssignedDate = adminAssignedDate;
    }
    try {
      const response = await axiosInstance.patch(`/api/admin/paid-leads/${source}/${leadId}/process`, body);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ---------------- Writer ----------------

  /**
   * Fetch NORMAL paid leads currently active for writers.
   * GET /api/writer/leads/normal
   */
  async getNormalLeads({ limit = 20, skip = 0 } = {}) {
    try {
      const response = await axiosInstance.get(`/api/writer/leads/normal${toQueryString({ limit, skip })}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch RECURRING paid leads currently active for writers.
   * GET /api/writer/leads/recurring
   */
  async getRecurringLeads({ limit = 20, skip = 0 } = {}) {
    try {
      const response = await axiosInstance.get(`/api/writer/leads/recurring${toQueryString({ limit, skip })}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark a writer lead as done. Moves it back to ADMIN_REVIEW.
   * PATCH /api/writer/leads/:source/:leadId/done
   *
   * source: 'LEAD' | 'META_LEAD'
   */
  async markLeadDone(source, leadId) {
    try {
      const response = await axiosInstance.patch(`/api/writer/leads/${source}/${leadId}/done`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default metaLeadAPI;