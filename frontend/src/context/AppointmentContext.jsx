import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth';

const AppointmentContext = createContext();
// useAppointments hook moved to a separate file to satisfy fast-refresh constraints

export default AppointmentContext;

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchAppointments();
    } else if (!authLoading && !currentUser) {
      setAppointments([]);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

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
      // Use trainer endpoint if user is a trainer, otherwise use regular endpoint
      const endpoint = currentUser?.role === 'trainer' ? '/api/appointments/trainer' : '/api/appointments';
      const response = await axios.get(endpoint, config);
      // Backend returns { status, results, data: { appointments } }
      const appointmentsData = response.data?.data?.appointments || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const fetchTrainerAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/appointments/trainer', config);
      // Backend returns { status, results, data: { appointments } }
      const appointmentsData = response.data?.data?.appointments || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trainer appointments:', error);
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
        `/api/checkout/appointment/${appointmentId}`,
        {},
        config
      );
      // Backend returns { status, data: { sessionId, sessionUrl } }
      const sessionData = response.data?.data || response.data;
      return sessionData;
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
    fetchTrainerAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    createCheckoutSession,
  };

  return (
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  );
};