import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
