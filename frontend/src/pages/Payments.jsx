import React, { useState, useEffect } from 'react';
import { usePayments } from '../context/payment';
import { useAuth } from '../context/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

const Payments = () => {
  const { currentUser } = useAuth();
  const {
    paymentMethods,
    payments,
    subscriptions,
    loading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    createSubscriptionCheckout,
    cancelSubscription,
  } = usePayments();

  // State for modals
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);
  
  // State for form data
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: 'basic',
  });
  
  // State for selected subscription to cancel
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // State for operation status
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  const [operationError, setOperationError] = useState(null);
  
  // Filter user's payments and subscriptions
  const userPayments = payments.filter(payment => payment.user === currentUser._id);
  const userSubscriptions = subscriptions.filter(subscription => subscription.user === currentUser._id);
  const activeSubscription = userSubscriptions.find(sub => sub.status === 'active');

  // Handle payment method form input change
  const handlePaymentMethodInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentMethodForm({ ...paymentMethodForm, [name]: value });
  };

  // Handle subscription form input change
  const handleSubscriptionInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionForm({ ...subscriptionForm, [name]: value });
  };

  // Handle add payment method
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError(null);
    
    try {
      // Validate form data
      if (!paymentMethodForm.cardNumber || !paymentMethodForm.expiryDate || !paymentMethodForm.cvv || !paymentMethodForm.cardholderName) {
        setOperationError('Please fill in all required fields');
        setOperationLoading(false);
        return;
      }
      
      // Add payment method
      await addPaymentMethod(paymentMethodForm);
      setOperationSuccess('Payment method added successfully');
      setIsAddPaymentMethodModalOpen(false);
      resetPaymentMethodForm();
    } catch (error) {
      setOperationError(error.response?.data?.message || 'Failed to add payment method');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Handle create subscription
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError(null);
    setOperationSuccess(null);
    
    try {
      // Validate form data
      if (!subscriptionForm.plan) {
        setOperationError('Please select a plan');
        setOperationLoading(false);
        return;
      }
      
      // Create subscription checkout session
      const checkoutData = await createSubscriptionCheckout(subscriptionForm.plan);
      
      // Redirect to Stripe checkout
      if (checkoutData?.data?.sessionUrl) {
        window.location.href = checkoutData.data.sessionUrl;
      } else if (checkoutData?.sessionUrl) {
        window.location.href = checkoutData.sessionUrl;
      } else {
        setOperationError('Failed to get checkout URL');
        setOperationLoading(false);
      }
    } catch (error) {
      setOperationError(error.response?.data?.message || 'Failed to create subscription');
      setOperationLoading(false);
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

  // Open add payment method modal
  const openAddPaymentMethodModal = () => {
    resetPaymentMethodForm();
    setIsAddPaymentMethodModalOpen(true);
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

  // Reset payment method form
  const resetPaymentMethodForm = () => {
    setPaymentMethodForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    });
    setOperationError(null);
  };

  // Reset subscription form
  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      plan: 'basic',
    });
    setOperationError(null);
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payments & Subscriptions</h1>
          <div className="space-x-2">
            <Button onClick={openAddPaymentMethodModal}>Add Payment Method</Button>
            {!activeSubscription && (
              <Button onClick={openSubscribeModal} variant="primary">
                Subscribe
              </Button>
            )}
          </div>
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

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <Card title="Subscription Status" className="col-span-1 lg:col-span-2">
              {activeSubscription ? (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getPlanDetails(activeSubscription.plan).name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Renews on {new Date(activeSubscription.endDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <Badge color="green">Active</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{getPlanDetails(activeSubscription.plan).price}</p>
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
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Plan Features:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {getPlanDetails(activeSubscription.plan).features.map((feature, index) => (
                        <li key={index} className="text-gray-700">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
                  <Button onClick={openSubscribeModal} variant="primary">
                    Subscribe Now
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment Methods */}
            <Card title="Payment Methods">
              {paymentMethods.length > 0 ? (
                <div className="divide-y">
                  {paymentMethods.map((method) => (
                    <div key={method._id} className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="rounded-full bg-gray-100 p-2 mr-3">
                          <svg
                            className="h-6 w-6 text-gray-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{formatCardNumber(method.cardNumber)}</p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removePaymentMethod(method._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">No payment methods added yet.</p>
                  <Button onClick={openAddPaymentMethodModal} variant="outline">
                    Add Payment Method
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment History */}
            <Card title="Payment History">
              {userPayments.length > 0 ? (
                <div className="divide-y">
                  {userPayments.map((payment) => (
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
                  <p className="text-gray-600">No payment history available.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Add Payment Method Modal */}
        <Modal
          isOpen={isAddPaymentMethodModalOpen}
          onClose={() => setIsAddPaymentMethodModalOpen(false)}
          title="Add Payment Method"
        >
          <form onSubmit={handleAddPaymentMethod} className="space-y-4">
            {operationError && (
              <Alert type="error" className="mb-4">
                {operationError}
              </Alert>
            )}
            
            <Input
              label="Cardholder Name"
              name="cardholderName"
              value={paymentMethodForm.cardholderName}
              onChange={handlePaymentMethodInputChange}
              required
              placeholder="John Doe"
            />
            
            <Input
              label="Card Number"
              name="cardNumber"
              value={paymentMethodForm.cardNumber}
              onChange={handlePaymentMethodInputChange}
              required
              placeholder="1234 5678 9012 3456"
              maxLength={16}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                name="expiryDate"
                value={paymentMethodForm.expiryDate}
                onChange={handlePaymentMethodInputChange}
                required
                placeholder="MM/YY"
                maxLength={5}
              />
              
              <Input
                label="CVV"
                name="cvv"
                value={paymentMethodForm.cvv}
                onChange={handlePaymentMethodInputChange}
                required
                placeholder="123"
                maxLength={3}
                type="password"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPaymentMethodModalOpen(false)}
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={operationLoading}>
                {operationLoading ? 'Adding...' : 'Add Payment Method'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Subscribe Modal */}
        <Modal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          title="Subscribe to a Plan"
        >
          <form onSubmit={handleCreateSubscription} className="space-y-4">
            {operationError && (
              <Alert type="error" className="mb-4">
                {operationError}
              </Alert>
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
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                You will be redirected to Stripe's secure checkout page to complete your subscription payment.
              </p>
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
                disabled={operationLoading}
              >
                {operationLoading ? 'Processing...' : 'Continue to Checkout'}
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
            <p>Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.</p>
            
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

export default Payments;
