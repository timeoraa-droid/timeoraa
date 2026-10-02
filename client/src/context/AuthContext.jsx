import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

const API_URL = `${API_BASE}/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_user');
      if (!saved) return null;
      return JSON.parse(saved);
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('timeora_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('timeora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('timeora_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('timeora_token', token);
    } else {
      localStorage.removeItem('timeora_token');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (rawEmail, password) => {
    const email = rawEmail.toLowerCase().trim();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const userData = { ...res.data.user, email: res.data.user.email.toLowerCase().trim() };
      setUser(userData);
      setToken(res.data.token);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to sign in';
      return { success: false, message };
    }
  };

  const adminLogin = async (rawLoginId, password) => {
    const loginId = rawLoginId.toLowerCase().trim();
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { loginId, password });
      const userData = { ...res.data.user, email: res.data.user.email.toLowerCase().trim() };
      setUser(userData);
      setToken(res.data.token);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to sign in as admin';
      return { success: false, message };
    }
  };

  const register = async (name, rawEmail, password, confirmPassword) => {
    const email = rawEmail.toLowerCase().trim();
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password, confirmPassword });
      const userData = { ...res.data.user, email: res.data.user.email.toLowerCase().trim() };
      setUser(userData);
      setToken(res.data.token);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to register';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('timeora_user');
    localStorage.removeItem('timeora_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, login, adminLogin, register, logout, isAuthenticated: !!user, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
