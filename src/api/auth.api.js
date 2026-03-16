import axiosInstance from './axiosInstance';

export const authAPI = {

  signup: async (userData) => {
    const response = await axiosInstance.post('/api/auth/signup', userData);
    return response.data;
  },


  login: async (credentials) => {
    // Add timestamp to force fresh request and bypass any browser/network caching
    const response = await axiosInstance.post(`/api/auth/login?_t=${Date.now()}`, credentials);
    return response.data;
  },


  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, passwordData) => {
    const response = await axiosInstance.post(`/api/auth/reset-password/${token}`, passwordData);
    return response.data;
  },

};

export default authAPI;