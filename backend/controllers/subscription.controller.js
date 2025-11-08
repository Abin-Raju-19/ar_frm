const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Subscription } = require('../models/payment.model');
const User = require('../models/user.model');
const stripeUtils = require('../utils/stripe.utils');

/**
 * Get all subscription plans
 * @route GET /api/subscriptions/plans
 */
exports.getSubscriptionPlans = async (req, res) => {
  try {
    // These would typically come from a database, but for simplicity, we're hardcoding them
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Access to basic fitness tracking and limited trainer consultations',
        price: 9.99,
        interval: 'monthly',
        features: [
          'Basic workout tracking',
          '1 trainer consultation per month',
          'Access to workout library',
          'Basic nutrition tracking'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Full access to all features including unlimited trainer consultations',
        price: 19.99,
        interval: 'monthly',
        features: [
          'Advanced workout tracking',
          'Unlimited trainer consultations',
          'Full access to workout library',
          'Advanced nutrition tracking',
          'Custom meal plans',
          'Priority booking for classes'
        ]
      },
      {
        id: 'annual',
        name: 'Annual Plan',
        description: 'All premium features at a discounted annual rate',
        price: 199.99,
        interval: 'yearly',
        features: [
          'All Premium Plan features',
          '2 months free compared to monthly billing',
          'Annual fitness assessment',
          'Personalized yearly fitness roadmap'
        ]
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        plans
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
 * Create a subscription checkout session
 * @route POST /api/subscriptions/create-checkout-session
 */
exports.createCheckoutSession = async (req, res) => {
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
      basic: { name: 'Basic Plan', price: 9.99, interval: 'month' },
      premium: { name: 'Premium Plan', price: 19.99, interval: 'month' },
      annual: { name: 'Annual Plan', price: 199.99, interval: 'year' }
    };
    
    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid plan ID'
      });
    }
    
    // Get or create Stripe customer
    let user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      const customer = await stripeUtils.createStripeCustomer(user);
      user.stripeCustomerId = customer.id;
      await user.save({ validateBeforeSave: false });
    }
    
    // Create product in Stripe if it doesn't exist
    const product = await stripeUtils.createSubscriptionProduct({
      name: plan.name,
      description: `${plan.name} - ${plan.interval}ly subscription`
    });
    
    // Create price in Stripe
    const price = await stripeUtils.createSubscriptionPrice(
      product.id,
      plan.price,
      plan.interval
    );
    
    // Create subscription in Stripe
    const subscription = await stripeUtils.createStripeSubscription(
      user.stripeCustomerId,
      price.id
    );
    
    // Create subscription in database
    const newSubscription = await Subscription.create({
      user: req.user.id,
      plan: planId,
      amount: plan.price,
      interval: `${plan.interval}ly`,
      status: 'pending',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: user.stripeCustomerId,
      startDate: new Date(),
      endDate: calculateEndDate(new Date(), `${plan.interval}ly`)
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: newSubscription._id
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
 * Get user's active subscriptions
 * @route GET /api/subscriptions
 */
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user.id,
      status: { $in: ['active', 'pending', 'past_due'] }
    }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: {
        subscriptions
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
 * Get subscription by ID
 * @route GET /api/subscriptions/:id
 */
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subscription not found'
      });
    }

    // Check if user has permission to view this subscription
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this subscription'
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
 * Update subscription payment method
 * @route PATCH /api/subscriptions/:id/payment-method
 */
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a payment method ID'
      });
    }
    
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subscription not found'
      });
    }
    
    // Check if user has permission
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this subscription'
      });
    }
    
    // Update payment method in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Payment method updated successfully'
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