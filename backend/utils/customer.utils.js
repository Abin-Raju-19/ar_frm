/**
 * Customer utility functions for Stripe integration
 */

const User = require('../models/user.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Get or create a Stripe customer for a user
 * @param {Object} user - User object
 * @returns {String} - Stripe customer ID
 */
exports.getOrCreateCustomer = async (user) => {
  try {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      // Verify the customer exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        
        // If customer exists and is not deleted, return the ID
        if (customer && !customer.deleted) {
          return user.stripeCustomerId;
        }
      } catch (error) {
        // If customer doesn't exist in Stripe, create a new one
        console.log(`Stripe customer ${user.stripeCustomerId} not found, creating new one`);
      }
    }
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Update user with new Stripe customer ID
    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: customer.id
    });
    
    return customer.id;
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error);
    throw error;
  }
};

/**
 * Add a payment method to a customer
 * @param {String} customerId - Stripe customer ID
 * @param {String} paymentMethodId - Stripe payment method ID
 * @returns {Object} - Updated payment method
 */
exports.addPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    return await stripe.paymentMethods.retrieve(paymentMethodId);
  } catch (error) {
    console.error('Error in addPaymentMethod:', error);
    throw error;
  }
};

/**
 * Get customer's payment methods
 * @param {String} customerId - Stripe customer ID
 * @param {String} type - Payment method type (card, bank_account, etc.)
 * @returns {Array} - List of payment methods
 */
exports.getPaymentMethods = async (customerId, type = 'card') => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type
    });
    
    return paymentMethods.data;
  } catch (error) {
    console.error('Error in getPaymentMethods:', error);
    throw error;
  }
};

/**
 * Delete a payment method
 * @param {String} paymentMethodId - Stripe payment method ID
 * @returns {Object} - Deleted payment method
 */
exports.deletePaymentMethod = async (paymentMethodId) => {
  try {
    return await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error) {
    console.error('Error in deletePaymentMethod:', error);
    throw error;
  }
};

/**
 * Update customer details in Stripe
 * @param {String} customerId - Stripe customer ID
 * @param {Object} details - Customer details to update
 * @returns {Object} - Updated customer
 */
exports.updateCustomer = async (customerId, details) => {
  try {
    return await stripe.customers.update(customerId, details);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
};