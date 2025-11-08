import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth';
import { NutritionContext } from './nutrition';

export const NutritionProvider = ({ children }) => {
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchNutritionPlans();
    } else if (!authLoading && !currentUser) {
      setNutritionPlans([]);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  const fetchNutritionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/nutrition', config);
      setNutritionPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      setError('Failed to fetch nutrition plans');
      setLoading(false);
    }
  };

  const getNutritionPlan = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/api/nutrition/${id}`, config);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get nutrition plan');
      throw error;
    }
  };

  const createNutritionPlan = async (nutritionData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/nutrition', nutritionData, config);
      setNutritionPlans([...nutritionPlans, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create nutrition plan');
      throw error;
    }
  };

  const updateNutritionPlan = async (id, nutritionData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`/api/nutrition/${id}`, nutritionData, config);
      setNutritionPlans(
        nutritionPlans.map((plan) => (plan._id === id ? response.data : plan))
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update nutrition plan');
      throw error;
    }
  };

  const deleteNutritionPlan = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/nutrition/${id}`, config);
      setNutritionPlans(nutritionPlans.filter((plan) => plan._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete nutrition plan');
      throw error;
    }
  };

  const value = {
    nutritionPlans,
    loading,
    error,
    fetchNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
  };

  return (
    <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>
  );
};