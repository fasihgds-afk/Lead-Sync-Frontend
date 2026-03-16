import axiosInstance from './axiosInstance';

export const combinedAPI = {
  // Get all leads with optional filtering and pagination
  getAllLeadsCombined: async (limit = 20, skip = 0, filters = {}) => {
    const response = await axiosInstance.get('/api/superadmin/leads', {
      params: { limit, skip, ...filters }
    });
    return response.data;
  },

  // Get leads specifically filtered by process role (e.g., DM, LQ, MANAGER)
  getLeadsByRole: async (role, limit = 20, skip = 0, filters = {}) => {
    const response = await axiosInstance.get('/api/superadmin/leads', {
      params: { limit, skip, stage: role, ...filters }
    });
    return response.data;
  }
};
