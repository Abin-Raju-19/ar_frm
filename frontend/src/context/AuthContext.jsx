import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Backend returns { status, data: { user } }
      const response = await axios.get('/api/auth/me', config);
      setCurrentUser(response.data?.data?.user || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      // Backend auth: POST /api/auth/login -> { status, token, data: { user } }
      const response = await axios.post('/api/auth/login', { email, password });
      const token = response.data?.token;
      const user = response.data?.data?.user;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { user };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      // Backend auth: POST /api/auth/register -> { status, token, data: { user } }
      const response = await axios.post('/api/auth/register', userData);
      const token = response.data?.token;
      const user = response.data?.data?.user;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { user };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // User route: PATCH /api/users/me -> returns updated user
      const response = await axios.patch('/api/users/me', userData, config);
      setCurrentUser(response.data?.data?.user || response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};