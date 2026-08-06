import axios from 'axios';

// In development, Vite proxies /api → localhost:5001
// In production (Vercel), VITE_API_BASE_URL must point to the deployed backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add Authorization header dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omnidecision_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to catch 401 unauth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('omnidecision_token');
      localStorage.removeItem('omnidecision_user');
      // optional redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
