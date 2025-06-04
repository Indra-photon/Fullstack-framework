import axios from 'axios';
import { handleApiError } from './errorHandler.js';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_DOMAIN,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    // Global error handling
    await handleApiError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;