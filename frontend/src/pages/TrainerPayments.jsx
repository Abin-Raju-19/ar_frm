import React, { useState, useEffect } from 'react';
import { usePayments } from '../context/payment';
import { useAuth } from '../context/auth';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

const TrainerPayments = () => {
  const { currentUser } = useAuth();
  const {
    payments,
    subscriptions,
    loading,
    error,
  } = usePayments();

  // State for clients
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);
  
  // State for selected client
  const [selectedClient, setSelectedClient] = useState(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // State for operation status
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  const [operationError, setOperationError] = useState(null);

  // Fetch clients assigned to the trainer
  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setClients(response.data);
      } catch (error) {
        setClientsError(error.response?.data?.message || 'Failed to fetch clients');
      } finally {
        setClientsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  // Filter payments by client
  const getClientPayments = (clientId) => {
    return payments.filter(payment => payment.user === clientId);
  };

  // Filter subscriptions by client
  const getClientSubscriptions = (clientId) => {
    return subscriptions.filter(subscription => subscription.user === clientId);
  };

  // Get active subscription for a client
  const getActiveSubscription = (clientId) => {
    return getClientSubscriptions(clientId).find(sub => sub.status === 'active');
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const activeSubscription = getActiveSubscription(client._id);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && activeSubscription) || 
      (statusFilter === 'inactive' && !activeSubscription);
    
    const matchesPlan = planFilter === 'all' || 
      (activeSubscription && activeSubscription.plan === planFilter);
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Format card number for display
  const formatCardNumber = (cardNumber) => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  // Get plan details
  const getPlanDetails = (planType) => {
    switch (planType) {
      case 'basic':
        return {
          name: 'Basic Plan',
          price: '$9.99',
          features: ['Access to workout library', 'Basic nutrition tracking', 'Limited appointment booking'],
          color: 'bg-blue-100 text-blue-800',
        };
      case 'premium':
        return {
          name: 'Premium Plan',
          price: '$19.99',
          features: ['Full workout library access', 'Advanced nutrition tracking', 'Priority appointment booking', 'Custom workout plans'],
          color: 'bg-purple-100 text-purple-800',
        };
      case 'elite':
        return {
          name: 'Elite Plan',
          price: '$29.99',
          features: ['All premium features', 'Personal trainer sessions', 'Custom nutrition plans', 'Unlimited appointments', '24/7 support'],
          color: 'bg-yellow-100 text-yellow-800',
        };
      default:
        return {
          name: 'Unknown Plan',
          price: 'N/A',
          features: [],
          color: 'bg-gray-100 text-gray-800',
        };
    }
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Client Payments & Subscriptions</h1>
        </div>

        {operationSuccess && (
          <Alert type="success" className="mb-4">
            {operationSuccess}
          </Alert>
        )}

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {clientsError && (
          <Alert type="error" className="mb-4">
            {clientsError}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-1">
            <Card title="Clients">
              <div className="p-4">
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'active', label: 'Active Subscription' },
                      { value: 'inactive', label: 'No Subscription' },
                    ]}
                  />
                  
                  <Select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Plans' },
                      { value: 'basic', label: 'Basic' },
                      { value: 'premium', label: 'Premium' },
                      { value: 'elite', label: 'Elite' },
                    ]}
                  />
                </div>
              </div>
              
              {clientsLoading ? (
                <div className="p-4">
                  <Loading />
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredClients.map((client) => {
                    const activeSubscription = getActiveSubscription(client._id);
                    return (
                      <div
                        key={client._id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedClient?._id === client._id ? 'bg-gray-50' : ''}`}
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                          {activeSubscription ? (
                            <Badge color="green">
                              {getPlanDetails(activeSubscription.plan).name}
                            </Badge>
                          ) : (
                            <Badge color="gray">No Subscription</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">
                    {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                      ? 'No clients match your filters.'
                      : 'No clients found.'}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="space-y-6">
                <Card>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                        <p className="text-gray-600">{selectedClient.email}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Subscription Status */}
                <Card title="Subscription Status">
                  {loading ? (
                    <div className="p-4">
                      <Loading />
                    </div>
                  ) : (
                    <>
                      {getActiveSubscription(selectedClient._id) ? (
                        <div className="p-4">
                          {(() => {
                            const activeSubscription = getActiveSubscription(selectedClient._id);
                            const planDetails = getPlanDetails(activeSubscription.plan);
                            return (
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {planDetails.name}
                                  </h3>
                                  <p className="text-gray-600 mt-1">
                                    Renews on {new Date(activeSubscription.endDate).toLocaleDateString()}
                                  </p>
                                  <div className="mt-2">
                                    <Badge color="green">Active</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{planDetails.price}</p>
                                  <p className="text-gray-600 text-sm">per month</p>
                                </div>
                              </div>
                            );
                          })()} 
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-600">This client doesn't have an active subscription.</p>
                        </div>
                      )}
                    </>
                  )}
                </Card>

                {/* Payment History */}
                <Card title="Payment History">
                  {loading ? (
                    <div className="p-4">
                      <Loading />
                    </div>
                  ) : (
                    <>
                      {getClientPayments(selectedClient._id).length > 0 ? (
                        <div className="divide-y">
                          {getClientPayments(selectedClient._id).map((payment) => (
                            <div key={payment._id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{payment.description || 'Payment'}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">${(payment.amount / 100).toFixed(2)}</p>
                                  <Badge
                                    color={
                                      payment.status === 'completed'
                                        ? 'green'
                                        : payment.status === 'failed'
                                        ? 'red'
                                        : 'yellow'
                                    }
                                    className="mt-1"
                                  >
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-600">No payment history available for this client.</p>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="p-8 text-center">
                  <svg
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
                  <p className="text-gray-600">
                    Select a client from the list to view their payment and subscription details.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerPayments;
