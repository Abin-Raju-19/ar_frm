const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const paymentMethodController = require('../controllers/payment-method.controller');

const router = express.Router();

// Create a setup intent for adding a payment method
router.post('/setup-intent', protect, paymentMethodController.createSetupIntent);

// Get user's payment methods
router.get('/', protect, paymentMethodController.getPaymentMethods);

// Add a payment method
router.post('/', protect, paymentMethodController.addPaymentMethod);

// Set default payment method (use PUT to match frontend)
router.put('/:id/default', protect, paymentMethodController.setDefaultPaymentMethod);

// Delete a payment method
router.delete('/:id', protect, paymentMethodController.deletePaymentMethod);

module.exports = router;
