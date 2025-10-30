import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth';

const WorkoutContext = createContext();
export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchWorkouts();
    } else {
      setWorkouts([]);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/workouts', config);
      setWorkouts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to fetch workouts');
      setLoading(false);
    }
  };

  const getWorkout = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/api/workouts/${id}`, config);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get workout');
      throw error;
    }
  };

  const createWorkout = async (workoutData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/workouts', workoutData, config);
      setWorkouts([...workouts, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create workout');
      throw error;
    }
  };

  const updateWorkout = async (id, workoutData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`/api/workouts/${id}`, workoutData, config);
      setWorkouts(
        workouts.map((workout) => (workout._id === id ? response.data : workout))
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update workout');
      throw error;
    }
  };

  const deleteWorkout = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/workouts/${id}`, config);
      setWorkouts(workouts.filter((workout) => workout._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete workout');
      throw error;
    }
  };

  const value = {
    workouts,
    loading,
    error,
    fetchWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};