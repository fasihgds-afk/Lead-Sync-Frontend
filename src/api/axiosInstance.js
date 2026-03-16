import axios from 'axios';
import tokenManager from '../utils/tokenManager';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://leadsyncflow-3.onrender.com'
).replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // Increased to 2 minutes to handle cold starts and prevent premature timeouts
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Skip adding token for auth endpoints to prevent conflicts
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/signup')) {
        // Force fresh connection for auth
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        return config;
      }

      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Better timeout error handling
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.message = 'The server is taking too long to respond. Please check your internet connection or try again.';
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenManager.clearAuthData();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

Object.freeze(axiosInstance);

export default axiosInstance;
