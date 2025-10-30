/**
 * Controller for handling Stripe checkout sessions
 */

const User = require('../models/user.model');
const { Payment, Subscription } = require('../models/payment.model');
const Appointment = require('../models/appointment.model');
const checkoutUtils = require('../utils/checkout.utils');

/**
 * Create a checkout session for appointment payment
 * @route POST /api/checkout/appointment/:id
 */
exports.createAppointmentCheckout = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }
    
    // Check if appointment belongs to user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to pay for this appointment'
      });
    }
    
    // Check if appointment is already paid
    if (appointment.payment) {
      return res.status(400).json({
        status: 'fail',
        message: 'This appointment is already paid for'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Create a payment record
    const payment = await Payment.create({
      user: req.user.id,
      amount: appointment.price,
      currency: 'usd',
      status: 'pending',
      paymentType: 'appointment',
      relatedTo: appointment._id,
      onModel: 'Appointment'
    });
    
    // Create checkout session
    const session = await checkoutUtils.createCheckoutSession(user, {
      lineItems: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment with ${appointment.trainer.name || 'Trainer'}`,
              description: `${appointment.date} at ${appointment.startTime}`
            },
            unit_amount: Math.round(appointment.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      successUrl: `${process.env.CLIENT_URL}/appointments/${appointment._id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_URL}/appointments/${appointment._id}/cancel`,
      metadata: {
        appointmentId: appointment._id.toString(),
        paymentId: payment._id.toString()
      }
    });
    
    // Update payment with Stripe session ID
    await Payment.findByIdAndUpdate(payment._id, {
      stripeSessionId: session.id
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        sessionUrl: session.url
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
 * Create a checkout session for subscription
 * @route POST /api/checkout/subscription
 */
exports.createSubscriptionCheckout = async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a plan ID'
      });
    }
    
    // Get plan details (in a real app, fetch from database)
    const plans = {
      basic: { 
        name: 'Basic Plan', 
        description: 'Access to basic fitness tracking and limited trainer consultations',
        price: 9.99, 
        interval: 'month' 
      },
      premium: { 
        name: 'Premium Plan', 
        description: 'Full access to all features including unlimited trainer consultations',
        price: 19.99, 
        interval: 'month' 
      },
      annual: { 
        name: 'Annual Plan', 
        description: 'All premium features at a discounted annual rate',
        price: 199.99, 
        interval: 'year' 
      }
    };
    
    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid plan ID'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Create product and price in Stripe
    const { product, price } = await checkoutUtils.createProductAndPrice(
      {
        name: plan.name,
        description: plan.description
      },
      {
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: plan.interval
        }
      }
    );
    
    // Create subscription record
    const subscription = await Subscription.create({
      user: req.user.id,
      plan: planId,
      amount: plan.price,
      interval: `${plan.interval}ly`,
      status: 'pending',
      startDate: new Date()
    });
    
    // Create checkout session
    const session = await checkoutUtils.createSubscriptionCheckout(user, {
      priceId: price.id,
      successUrl: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        subscriptionId: subscription._id.toString(),
        planId
      }
    });
    
    // Update subscription with Stripe details
    await Subscription.findByIdAndUpdate(subscription._id, {
      stripeProductId: product.id,
      stripePriceId: price.id,
      stripeSessionId: session.id
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        sessionUrl: session.url
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
 * Handle checkout session completion
 * @route GET /api/checkout/session/:sessionId
 */
exports.getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve session from Stripe
    const session = await checkoutUtils.retrieveCheckoutSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }
    
    // Check if session belongs to user
    if (session.metadata.userId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this session'
      });
    }
    
    // Handle different checkout types
    if (session.metadata.appointmentId) {
      // Update appointment payment status
      await Appointment.findByIdAndUpdate(session.metadata.appointmentId, {
        status: session.payment_status === 'paid' ? 'confirmed' : 'pending',
        payment: session.metadata.paymentId
      });
      
      // Update payment status
      await Payment.findByIdAndUpdate(session.metadata.paymentId, {
        status: session.payment_status === 'paid' ? 'completed' : 'pending',
        stripePaymentId: session.payment_intent
      });
    } else if (session.metadata.subscriptionId) {
      // Update subscription status
      await Subscription.findByIdAndUpdate(session.metadata.subscriptionId, {
        status: session.payment_status === 'paid' ? 'active' : 'pending',
        stripeSubscriptionId: session.subscription
      });
      
      // Update user subscription status
      if (session.payment_status === 'paid') {
        await User.findByIdAndUpdate(req.user.id, {
          subscriptionStatus: 'active',
          subscriptionPlan: session.metadata.planId
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        session
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};