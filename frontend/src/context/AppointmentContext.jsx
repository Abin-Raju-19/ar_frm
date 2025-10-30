import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth';

const AppointmentContext = createContext();
// useAppointments hook moved to a separate file to satisfy fast-refresh constraints

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/appointments', config);
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/appointments', appointmentData, config);
      setAppointments([...appointments, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create appointment');
      throw error;
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`/api/appointments/${id}`, appointmentData, config);
      setAppointments(
        appointments.map((appointment) =>
          appointment._id === id ? response.data : appointment
        )
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update appointment');
      throw error;
    }
  };

  const cancelAppointment = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/appointments/${id}`, config);
      setAppointments(appointments.filter((appointment) => appointment._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel appointment');
      throw error;
    }
  };

  const createCheckoutSession = async (appointmentId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `/api/checkout/appointment`,
        { appointmentId },
        config
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create checkout session');
      throw error;
    }
  };

  const value = {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    createCheckoutSession,
  };

  return (
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  );
};