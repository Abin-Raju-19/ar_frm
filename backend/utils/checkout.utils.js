/**
 * Checkout utility functions for Stripe integration
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const customerUtils = require('./customer.utils');

/**
 * Create a checkout session for one-time payment
 * @param {Object} user - User object
 * @param {Object} options - Checkout options
 * @returns {Object} - Checkout session
 */
exports.createCheckoutSession = async (user, options) => {
  try {
    const {
      lineItems,
      successUrl,
      cancelUrl,
      metadata = {},
      mode = 'payment'
    } = options;
    
    // Get or create customer
    const customerId = await customerUtils.getOrCreateCustomer(user);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        ...metadata
      }
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 * @param {Object} user - User object
 * @param {Object} options - Subscription options
 * @returns {Object} - Checkout session
 */
exports.createSubscriptionCheckout = async (user, options) => {
  try {
    const {
      priceId,
      successUrl,
      cancelUrl,
      metadata = {}
    } = options;
    
    // Get or create customer
    const customerId = await customerUtils.getOrCreateCustomer(user);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        ...metadata
      }
    });
    
    return session;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

/**
 * Create a product and price in Stripe
 * @param {Object} productData - Product data
 * @param {Object} priceData - Price data
 * @returns {Object} - Created product and price
 */
exports.createProductAndPrice = async (productData, priceData) => {
  try {
    // Create product
    const product = await stripe.products.create(productData);
    
    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      ...priceData
    });
    
    return { product, price };
  } catch (error) {
    console.error('Error creating product and price:', error);
    throw error;
  }
};

/**
 * Retrieve a checkout session
 * @param {String} sessionId - Checkout session ID
 * @returns {Object} - Checkout session
 */
exports.retrieveCheckoutSession = async (sessionId) => {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};