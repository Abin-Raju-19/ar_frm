const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);

// Stripe webhook (raw body parser applied in server.js)
router.post('/webhook', paymentController.handleWebhook);

// User payments
router.get('/', protect, paymentController.getUserPayments);
router.get('/:id', protect, paymentController.getPayment);

// Basic subscription actions under payments namespace
router.post('/subscriptions', protect, paymentController.createSubscription);
router.patch('/subscriptions/:id/cancel', protect, paymentController.cancelSubscription);

module.exports = router;
