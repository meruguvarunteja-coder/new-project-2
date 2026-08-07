import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Initialize: check active Supabase session ────────────────────────────
  useEffect(() => {
    if (supabase) {
      // Get current Supabase session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          const u = session.user;
          setUser({
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.email.split('@')[0],
            role: u.user_metadata?.role || 'Decision Strategist'
          });
          // Store token for API interceptor
          localStorage.setItem('omnidecision_token', session.access_token);
        }
        setLoading(false);
      });

      // Listen for auth state changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          const u = session.user;
          const userObj = {
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.email.split('@')[0],
            role: u.user_metadata?.role || 'Decision Strategist'
          };
          setUser(userObj);
          localStorage.setItem('omnidecision_token', session.access_token);
        } else {
          setUser(null);
          localStorage.removeItem('omnidecision_token');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Legacy mode: check stored JWT token
      const savedUser = localStorage.getItem('omnidecision_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Verify against backend
        api.get('/auth/me').catch(() => {
          setUser(null);
          localStorage.removeItem('omnidecision_user');
          localStorage.removeItem('omnidecision_token');
        });
      }
      setLoading(false);
    }
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (email, password, name, role) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0], role: role || 'Decision Strategist' }
        }
      });

      if (error) throw { response: { data: { message: error.message } } };

      // Supabase may require email confirmation — handle gracefully
      if (data.user && !data.session) {
        return { success: true, requiresConfirmation: true, message: 'Check your email to confirm your account.' };
      }

      return { success: true };
    } else {
      // Legacy API fallback
      const res = await api.post('/auth/register', { email, password, name, role });
      if (res.data.success) {
        localStorage.setItem('omnidecision_token', res.data.token);
        localStorage.setItem('omnidecision_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      return res.data;
    }
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw { response: { data: { message: error.message } } };
      return { success: true };
    } else {
      // Legacy API fallback
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('omnidecision_token', res.data.token);
        localStorage.setItem('omnidecision_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      return res.data;
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('omnidecision_token');
    localStorage.removeItem('omnidecision_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
