const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

// Appointment checkout
router.post('/appointment/:id', protect, checkoutController.createAppointmentCheckout);

// Subscription checkout (matches frontend path)
router.post('/subscription', protect, checkoutController.createSubscriptionCheckout);

// Get checkout session
router.get('/sessions/:id', protect, checkoutController.getCheckoutSession);

// No explicit completion route; session retrieval handles post-checkout updates

module.exports = router;
