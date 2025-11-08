const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Subscription } = require('../models/payment.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');

/**
 * Create a payment intent for Stripe
 * @route POST /api/payments/create-payment-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentType, relatedTo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid amount'
      });
    }

    // Create a payment intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      metadata: {
        userId: req.user.id,
        paymentType,
        relatedTo: relatedTo || ''
      }
    });

    // Create a payment record in the database
    const payment = await Payment.create({
      user: req.user.id,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'credit_card',
      paymentType,
      relatedTo,
      onModel: paymentType === 'appointment' ? 'Appointment' : 
               paymentType === 'subscription' ? 'Subscription' : 'Service',
      stripePaymentId: paymentIntent.id
    });

    res.status(200).json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Handle Stripe webhook events
 * @route POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const webhookHandlers = require('../utils/webhook.handlers');
  
  try {
    // Verify the webhook signature
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await webhookHandlers.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await webhookHandlers.handlePaymentIntentFailed(event.data.object);
        break;
      case 'customer.subscription.created':
        await webhookHandlers.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await webhookHandlers.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await webhookHandlers.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// Webhook handlers moved to utils/webhook.handlers.js

/**
 * Get all payments for a user
 * @route GET /api/payments
 */
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: payments.length,
      data: {
        payments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 */
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Payment not found'
      });
    }

    // Check if user has permission to view this payment
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this payment'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Create a subscription
 * @route POST /api/payments/subscriptions
 */
exports.createSubscription = async (req, res) => {
  try {
    const { plan, amount, interval = 'monthly' } = req.body;

    if (!plan || !amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide plan and amount'
      });
    }

    // Create a subscription in the database
    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      amount,
      interval,
      status: 'pending',
      startDate: new Date(),
      endDate: calculateEndDate(new Date(), interval)
    });

    res.status(201).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Cancel a subscription
 * @route PATCH /api/payments/subscriptions/:id/cancel
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subscription not found'
      });
    }

    // Check if user has permission to cancel this subscription
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to cancel this subscription'
      });
    }

    // Update subscription status
    subscription.status = 'canceled';
    subscription.autoRenew = false;
    subscription.cancelReason = req.body.reason || 'User canceled';
    await subscription.save();

    // If there's a Stripe subscription, cancel it
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Calculate end date based on interval
 * @param {Date} startDate - Start date
 * @param {String} interval - Subscription interval
 * @returns {Date} - End date
 */
function calculateEndDate(startDate, interval) {
  const endDate = new Date(startDate);
  
  switch (interval) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }
  
  return endDate;
}