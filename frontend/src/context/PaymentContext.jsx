import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth';

const PaymentContext = createContext();

// usePayments hook moved to PaymentContext.hooks.jsx for fast-refresh compatibility

export const PaymentProvider = ({ children }) => {

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchPaymentMethods();
      fetchPayments();
      fetchSubscriptions();
    } else {
      setPaymentMethods([]);
      setPayments([]);
      setSubscriptions([]);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/payment-methods', config);
      setPaymentMethods(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to fetch payment methods');
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/payments', config);
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payments');
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/subscriptions', config);
      setSubscriptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to fetch subscriptions');
      setLoading(false);
    }
  };

  const createSetupIntent = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/payment-methods/setup-intent', {}, config);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create setup intent');
      throw error;
    }
  };

  const addPaymentMethod = async (paymentMethodId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        '/api/payment-methods',
        { paymentMethodId },
        config
      );
      setPaymentMethods([...paymentMethods, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add payment method');
      throw error;
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `/api/payment-methods/${paymentMethodId}/default`,
        {},
        config
      );
      setPaymentMethods(
        paymentMethods.map((method) => ({
          ...method,
          isDefault: method.id === paymentMethodId,
        }))
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set default payment method');
      throw error;
    }
  };

  const deletePaymentMethod = async (paymentMethodId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/payment-methods/${paymentMethodId}`, config);
      setPaymentMethods(
        paymentMethods.filter((method) => method.id !== paymentMethodId)
      );
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete payment method');
      throw error;
    }
  };

  const createSubscriptionCheckout = async (planId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        '/api/checkout/subscription',
        { planId },
        config
      );
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to create subscription checkout'
      );
      throw error;
    }
  };

  const value = {
    paymentMethods,
    payments,
    subscriptions,
    loading,
    error,
    fetchPaymentMethods,
    fetchPayments,
    fetchSubscriptions,
    createSetupIntent,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    createSubscriptionCheckout,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};