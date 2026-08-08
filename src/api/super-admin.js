import { adminAPI } from './admin.api';

/**
 * super-admin.js
 * -----------------------------------------------------------------------
 * Re-exports & exposes Super Admin API operations from admin.api.js
 * maintaining 100% backward compatibility for all existing callers.
 * -----------------------------------------------------------------------
 */

export const superAdminAPI = {
  // Pending Requests Management
  getPendingRequests: adminAPI.getPendingRequests,
  approveRequest: adminAPI.approveRequest,
  rejectRequest: adminAPI.rejectRequest,

  // Manager & LQ Assignments
  getManagersWithLQs: adminAPI.getManagersWithLQs,
  getManagersWithoutLQs: adminAPI.getManagersWithoutLQs,
  getUnassignedLeadQualifiers: adminAPI.getUnassignedLeadQualifiers,
  assignLqsToManager: adminAPI.assignLqsToManager,
  unassignLqs: adminAPI.unassignLqs,

  // Rejection Request Management
  getRejectionRequests: adminAPI.getRejectionRequests,
  decideRejectionRequest: adminAPI.decideRejectionRequest,
  decideLeadRejection: adminAPI.decideLeadRejection,
};

export default superAdminAPI;
