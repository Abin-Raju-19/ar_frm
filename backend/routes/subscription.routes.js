const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const subscriptionController = require('../controllers/subscription.controller');

const router = express.Router();

// Plans
router.get('/plans', protect, subscriptionController.getSubscriptionPlans);

// User subscriptions
router.get('/', protect, subscriptionController.getUserSubscriptions);
router.get('/:id', protect, subscriptionController.getSubscription);

// Update subscription payment method
router.patch('/:id/payment-method', protect, subscriptionController.updatePaymentMethod);

module.exports = router;
