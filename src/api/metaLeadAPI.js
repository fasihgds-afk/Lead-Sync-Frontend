import axios from 'axios';
import tokenManager from '../utils/tokenManager';

/**
 * metaLeadAPI.js
 * -----------------------------------------------------------------------
 * Single source of truth for talking to the Meta Lead backend
 * (adminController.js / writerController.js, mounted at
 * /api/admin/meta-leads and /api/writer/meta-leads in app.js).
 *
 * Auth: requireAuth on the backend expects a Bearer token. We read it
 * via tokenManager / storage.
 * -----------------------------------------------------------------------
 */

const AUTH_TOKEN_KEY = 'authToken';

const rawBaseUrl =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000';

const BASE_URL = rawBaseUrl.replace(/\/$/, '');

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token (if present) to every request.
client.interceptors.request.use((config) => {
  const token =
    tokenManager.getToken() ||
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize every error into a predictable shape:
// { status, message, fieldErrors, isNetworkError }
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network failure, CORS issue, server down, timeout, etc.
      return Promise.reject({
        status: 0,
        message:
          error.code === 'ECONNABORTED'
            ? 'The request timed out. Please try again.'
            : 'Unable to reach the server. Check your connection and try again.',
        isNetworkError: true,
        original: error,
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Token missing/expired/invalid — clear it so the app can
      // redirect to login instead of looping on 401s.
      tokenManager.clearAuthData();
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    return Promise.reject({
      status,
      message:
        (data && (data.message || data.error)) ||
        'Something went wrong. Please try again.',
      fieldErrors: (data && data.errors) || null,
      isNetworkError: false,
      original: error,
    });
  }
);

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

export const metaLeadAPI = {
  // ---------------- Admin ----------------

  /**
   * Fetch all MetaLeads with optional filters.
   * GET /api/admin/meta-leads
   * Params: { stage, status, assignedTo, limit, skip }
   */
  getMetaLeads({ stage = '', status = '', assignedTo = '', limit = 20, skip = 0 } = {}) {
    return client
      .get(`/api/admin/meta-leads${toQueryString({ stage, status, assignedTo, limit, skip })}`)
      .then((r) => r.data);
  },

  /**
   * Fetch all approved managers for the assignment dropdown.
   * GET /api/admin/managers
   */
  getApprovedManagers() {
    return client.get('/api/admin/managers').then((r) => r.data);
  },

  /**
   * Create a new Meta Lead (stage: ADMIN_REVIEW, status: UNPAID).
   * POST /api/admin/meta-leads
   * Required: date, program, school, fullName + (email OR number)
   * Optional: website
   */
  createMetaLead(payload) {
    return client.post('/api/admin/meta-leads', payload).then((r) => r.data);
  },

  /**
   * Assign an UNPAID MetaLead to an approved Manager.
   * PATCH /api/admin/meta-leads/:leadId/assign-manager
   * Body: { managerId }
   */
  assignMetaLeadToManager(leadId, managerId) {
    return client
      .patch(`/api/admin/meta-leads/${leadId}/assign-manager`, { managerId })
      .then((r) => r.data);
  },

  /**
   * Fetch all PAID leads (both Lead + MetaLead models) for Admin queue.
   * GET /api/admin/paid-leads
   */
  getPaidLeads({ limit = 20, skip = 0, source = 'ALL' } = {}) {
    return client
      .get(`/api/admin/paid-leads${toQueryString({ limit, skip, source })}`)
      .then((r) => r.data);
  },

  /**
   * Process a paid lead and push it to the writer queue.
   * PATCH /api/admin/paid-leads/:source/:leadId/process
   *
   * source: 'LEAD' | 'META_LEAD'  (comes from lead.source field in the response)
   * leadType: 'NORMAL' | 'RECURRING'
   * adminAssignedDate: required (YYYY-MM-DD) only when leadType === 'NORMAL'
   */
  processPaidLead(source, leadId, { leadType, adminAssignedDate } = {}) {
    const body = { leadType };
    if (leadType === 'NORMAL') {
      body.adminAssignedDate = adminAssignedDate;
    }
    return client
      .patch(`/api/admin/paid-leads/${source}/${leadId}/process`, body)
      .then((r) => r.data);
  },

  // ---------------- Writer ----------------

  /**
   * Fetch NORMAL paid leads currently active for writers.
   * GET /api/writer/leads/normal
   */
  getNormalLeads({ limit = 20, skip = 0 } = {}) {
    return client
      .get(`/api/writer/leads/normal${toQueryString({ limit, skip })}`)
      .then((r) => r.data);
  },

  /**
   * Fetch RECURRING paid leads currently active for writers.
   * GET /api/writer/leads/recurring
   */
  getRecurringLeads({ limit = 20, skip = 0 } = {}) {
    return client
      .get(`/api/writer/leads/recurring${toQueryString({ limit, skip })}`)
      .then((r) => r.data);
  },

  /**
   * Mark a writer lead as done. Moves it back to ADMIN_REVIEW.
   * PATCH /api/writer/leads/:source/:leadId/done
   *
   * source: 'LEAD' | 'META_LEAD'
   */
  markLeadDone(source, leadId) {
    return client
      .patch(`/api/writer/leads/${source}/${leadId}/done`)
      .then((r) => r.data);
  },
};

export default metaLeadAPI;