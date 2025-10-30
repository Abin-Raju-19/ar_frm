import React, { useState, useEffect } from 'react';
import { usePayments } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
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

const AdminPayments = () => {
  const { currentUser } = useAuth();
  const {
    paymentMethods,
    payments,
    subscriptions,
    loading,
    error,
    createSubscription,
    cancelSubscription,
  } = usePayments();

  // State for users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  
  // State for selected user
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // State for modals
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);
  
  // State for form data
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: 'basic',
    userId: '',
  });
  
  // State for selected subscription to cancel
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // State for operation status
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  const [operationError, setOperationError] = useState(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUsers(response.data);
      } catch (error) {
        setUsersError(error.response?.data?.message || 'Failed to fetch users');
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const activeSubscription = getUserActiveSubscription(user._id);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && activeSubscription) || 
      (statusFilter === 'inactive' && !activeSubscription);
    
    const matchesPlan = planFilter === 'all' || 
      (activeSubscription && activeSubscription.plan === planFilter);
    
    return matchesSearch && matchesRole && matchesStatus && matchesPlan;
  });

  // Get user payments
  const getUserPayments = (userId) => {
    return payments.filter(payment => payment.user === userId);
  };

  // Get user subscriptions
  const getUserSubscriptions = (userId) => {
    return subscriptions.filter(subscription => subscription.user === userId);
  };

  // Get user active subscription
  const getUserActiveSubscription = (userId) => {
    return getUserSubscriptions(userId).find(sub => sub.status === 'active');
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

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

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSubscriptionForm(prev => ({ ...prev, userId: user._id }));
  };

  // Handle subscription form input change
  const handleSubscriptionInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionForm({ ...subscriptionForm, [name]: value });
  };

  // Handle create subscription
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError(null);
    
    try {
      // Validate form data
      if (!subscriptionForm.plan || !subscriptionForm.userId) {
        setOperationError('Please select a plan and user');
        setOperationLoading(false);
        return;
      }
      
      // Create subscription
      await createSubscription({
        ...subscriptionForm,
        // Admin can create subscription without payment method
        isAdminCreated: true,
      });
      setOperationSuccess('Subscription created successfully');
      setIsSubscribeModalOpen(false);
      resetSubscriptionForm();
    } catch (error) {
      setOperationError(error.response?.data?.message || 'Failed to create subscription');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setOperationLoading(true);
    setOperationError(null);
    
    try {
      await cancelSubscription(selectedSubscription._id);
      setOperationSuccess('Subscription cancelled successfully');
      setIsConfirmCancelModalOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      setOperationError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Open subscribe modal
  const openSubscribeModal = () => {
    resetSubscriptionForm();
    setIsSubscribeModalOpen(true);
  };

  // Open confirm cancel modal
  const openConfirmCancelModal = (subscription) => {
    setSelectedSubscription(subscription);
    setIsConfirmCancelModalOpen(true);
  };

  // Reset subscription form
  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      plan: 'basic',
      userId: selectedUser ? selectedUser._id : '',
    });
    setOperationError(null);
  };

  // Get total revenue
  const getTotalRevenue = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0) / 100;
  };

  // Get active subscriptions count
  const getActiveSubscriptionsCount = () => {
    return subscriptions.filter(sub => sub.status === 'active').length;
  };

  // Get subscription distribution
  const getSubscriptionDistribution = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const total = activeSubscriptions.length;
    
    if (total === 0) return { basic: 0, premium: 0, elite: 0 };
    
    const basic = activeSubscriptions.filter(sub => sub.plan === 'basic').length;
    const premium = activeSubscriptions.filter(sub => sub.plan === 'premium').length;
    const elite = activeSubscriptions.filter(sub => sub.plan === 'elite').length;
    
    return {
      basic: Math.round((basic / total) * 100),
      premium: Math.round((premium / total) * 100),
      elite: Math.round((elite / total) * 100),
    };
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          {selectedUser && (
            <Button onClick={openSubscribeModal} variant="primary">
              Create Subscription
            </Button>
          )}
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

        {usersError && (
          <Alert type="error" className="mb-4">
            {usersError}
          </Alert>
        )}

        {/* Payment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">${getTotalRevenue().toFixed(2)}</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Active Subscriptions</h3>
              <p className="text-3xl font-bold">{getActiveSubscriptionsCount()}</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Subscription Distribution</h3>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-blue-500 rounded" style={{ width: `${getSubscriptionDistribution().basic}%` }}></div>
                <div className="h-4 bg-purple-500 rounded" style={{ width: `${getSubscriptionDistribution().premium}%` }}></div>
                <div className="h-4 bg-yellow-500 rounded" style={{ width: `${getSubscriptionDistribution().elite}%` }}></div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Basic ({getSubscriptionDistribution().basic}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                  <span>Premium ({getSubscriptionDistribution().premium}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                  <span>Elite ({getSubscriptionDistribution().elite}%)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1">
            <Card title="Users">
              <div className="p-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Roles' },
                      { value: 'user', label: 'Users' },
                      { value: 'trainer', label: 'Trainers' },
                      { value: 'admin', label: 'Admins' },
                    ]}
                  />
                  
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'active', label: 'Active Subscription' },
                      { value: 'inactive', label: 'No Subscription' },
                    ]}
                  />
                </div>
                
                <Select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Plans' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'elite', label: 'Elite' },
                  ]}
                  className="mb-4"
                />
              </div>
              
              {usersLoading || loading ? (
                <div className="p-4">
                  <Loading />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const activeSubscription = getUserActiveSubscription(user._id);
                    return (
                      <div
                        key={user._id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-gray-50' : ''}`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <Badge
                              color={
                                user.role === 'admin'
                                  ? 'red'
                                  : user.role === 'trainer'
                                  ? 'blue'
                                  : 'gray'
                              }
                              className="mt-1"
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
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
                    {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || planFilter !== 'all'
                      ? 'No users match your filters.'
                      : 'No users found.'}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="space-y-6">
                <Card>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <Badge
                          color={
                            selectedUser.role === 'admin'
                              ? 'red'
                              : selectedUser.role === 'trainer'
                              ? 'blue'
                              : 'gray'
                          }
                          className="mt-1"
                        >
                          {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                        </Badge>
                      </div>
                      <Button onClick={openSubscribeModal} variant="primary">
                        Create Subscription
                      </Button>
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
                      {getUserActiveSubscription(selectedUser._id) ? (
                        <div className="p-4">
                          {(() => {
                            const activeSubscription = getUserActiveSubscription(selectedUser._id);
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
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => openConfirmCancelModal(activeSubscription)}
                                  >
                                    Cancel Subscription
                                  </Button>
                                </div>
                              </div>
                            );
                          })()} 
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-600">This user doesn't have an active subscription.</p>
                          <Button onClick={openSubscribeModal} variant="primary" className="mt-2">
                            Create Subscription
                          </Button>
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
                      {getUserPayments(selectedUser._id).length > 0 ? (
                        <div className="divide-y">
                          {getUserPayments(selectedUser._id).map((payment) => (
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
                          <p className="text-gray-600">No payment history available for this user.</p>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
                  <p className="text-gray-600">
                    Select a user from the list to view their payment and subscription details.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Subscribe Modal */}
        <Modal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          title="Create Subscription"
        >
          <form onSubmit={handleCreateSubscription} className="space-y-4">
            {operationError && (
              <Alert type="error" className="mb-4">
                {operationError}
              </Alert>
            )}
            
            {!selectedUser && (
              <Select
                label="User"
                name="userId"
                value={subscriptionForm.userId}
                onChange={handleSubscriptionInputChange}
                options={users.map(user => ({
                  value: user._id,
                  label: `${user.name} (${user.email})`,
                }))}
                required
              />
            )}
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Select a Plan</label>
              <div className="grid grid-cols-1 gap-4">
                {['basic', 'premium', 'elite'].map((plan) => {
                  const planDetails = getPlanDetails(plan);
                  return (
                    <div
                      key={plan}
                      className={`border rounded-lg p-4 cursor-pointer ${subscriptionForm.plan === plan ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}
                      onClick={() => setSubscriptionForm({ ...subscriptionForm, plan })}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{planDetails.name}</h3>
                          <div className="mt-1">
                            <Badge color={plan === 'basic' ? 'blue' : plan === 'premium' ? 'purple' : 'yellow'}>
                              {planDetails.price}/month
                            </Badge>
                          </div>
                        </div>
                        <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                          {subscriptionForm.plan === plan && (
                            <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                          )}
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {planDetails.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <svg
                              className="h-4 w-4 text-green-500 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubscribeModalOpen(false)}
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={operationLoading || !subscriptionForm.userId}
              >
                {operationLoading ? 'Processing...' : 'Create Subscription'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Confirm Cancel Modal */}
        <Modal
          isOpen={isConfirmCancelModalOpen}
          onClose={() => setIsConfirmCancelModalOpen(false)}
          title="Cancel Subscription"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to cancel the subscription for{' '}
              <strong>{selectedUser?.name}</strong>? They will lose access to premium features at the end of their current billing period.
            </p>
            
            {operationError && (
              <Alert type="error">
                {operationError}
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmCancelModalOpen(false)}
                disabled={operationLoading}
              >
                Keep Subscription
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelSubscription}
                disabled={operationLoading}
              >
                {operationLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;