import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('omnidecision_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('omnidecision_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('omnidecision_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('omnidecision_token', res.data.token);
      localStorage.setItem('omnidecision_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (email, password, name, role) => {
    const res = await api.post('/auth/register', { email, password, name, role });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('omnidecision_token', res.data.token);
      localStorage.setItem('omnidecision_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('omnidecision_token');
    localStorage.removeItem('omnidecision_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
