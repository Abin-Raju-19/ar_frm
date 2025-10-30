/**
 * Stripe utility functions for the Fitness Management System
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe customer
 * @param {Object} user - User object with email and name
 * @returns {Object} - Stripe customer object
 */
exports.createStripeCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Create a subscription product in Stripe
 * @param {Object} plan - Plan object with name and description
 * @returns {Object} - Stripe product object
 */
exports.createSubscriptionProduct = async (plan) => {
  try {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description
    });
    
    return product;
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
};

/**
 * Create a subscription price in Stripe
 * @param {String} productId - Stripe product ID
 * @param {Number} amount - Price amount in dollars
 * @param {String} interval - Billing interval (month, year, etc.)
 * @returns {Object} - Stripe price object
 */
exports.createSubscriptionPrice = async (productId, amount, interval = 'month') => {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: interval === 'quarterly' ? 'month' : interval.replace('ly', ''),
        interval_count: interval === 'quarterly' ? 3 : 1
      }
    });
    
    return price;
  } catch (error) {
    console.error('Error creating Stripe price:', error);
    throw error;
  }
};

/**
 * Create a subscription in Stripe
 * @param {String} customerId - Stripe customer ID
 * @param {String} priceId - Stripe price ID
 * @returns {Object} - Stripe subscription object
 */
exports.createStripeSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

/**
 * Retrieve a payment intent from Stripe
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Object} - Stripe payment intent object
 */
exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Generate a payment link for a one-time payment
 * @param {Number} amount - Amount in dollars
 * @param {String} description - Payment description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Payment link object
 */
exports.generatePaymentLink = async (amount, description, metadata = {}) => {
  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata
    });
    
    return paymentLink;
  } catch (error) {
    console.error('Error generating payment link:', error);
    throw error;
  }
};

/**
 * Create a refund in Stripe
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @param {Number} amount - Amount to refund in dollars (optional, full refund if not provided)
 * @param {String} reason - Reason for refund
 * @returns {Object} - Stripe refund object
 */
exports.createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
      reason
    };
    
    if (amount) {
      refundParams.amount = amount * 100; // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};