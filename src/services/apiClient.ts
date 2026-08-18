import axios from 'axios';
import { getAuthToken, clearAuthCookies } from '../utils/authCookie';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthCookies();
    }

    let errorMessage = 'An unexpected server error occurred. Please try again.';

    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
