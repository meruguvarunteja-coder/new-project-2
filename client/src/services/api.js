import axios from 'axios';

// In development, Vite proxies /api → localhost:5001
// In production, set VITE_API_BASE_URL to your deployed backend URL
// If no backend is available, the app uses localStorage + local computation fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

export default api;
