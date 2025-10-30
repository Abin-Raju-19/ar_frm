/**
 * Controller for managing payment methods
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const customerUtils = require('../utils/customer.utils');

/**
 * Create a setup intent for adding a payment method
 * @route POST /api/payment-methods/setup-intent
 */
exports.createSetupIntent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get or create customer
    const customerId = await customerUtils.getOrCreateCustomer(user);
    
    // Create a setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session'
    });
    
    res.status(200).json({
      status: 'success',
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get user's payment methods
 * @route GET /api/payment-methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(200).json({
        status: 'success',
        data: {
          paymentMethods: []
        }
      });
    }
    
    // Get payment methods from Stripe
    const paymentMethods = await customerUtils.getPaymentMethods(user.stripeCustomerId);
    
    // Format payment methods for response
    const formattedPaymentMethods = paymentMethods.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault: pm.id === user.defaultPaymentMethod
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentMethods: formattedPaymentMethods
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
 * Add a payment method
 * @route POST /api/payment-methods
 */
exports.addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a payment method ID'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Get or create customer
    const customerId = await customerUtils.getOrCreateCustomer(user);
    
    // Add payment method to customer
    const paymentMethod = await customerUtils.addPaymentMethod(customerId, paymentMethodId);
    
    // Update user's default payment method if they don't have one
    if (!user.defaultPaymentMethod) {
      await User.findByIdAndUpdate(req.user.id, {
        defaultPaymentMethod: paymentMethodId
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentMethod: {
          id: paymentMethod.id,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        }
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
 * Set default payment method
 * @route PATCH /api/payment-methods/:id/default
 */
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        status: 'fail',
        message: 'No customer profile found'
      });
    }
    
    // Verify payment method belongs to customer
    const paymentMethods = await customerUtils.getPaymentMethods(user.stripeCustomerId);
    const paymentMethodExists = paymentMethods.some(pm => pm.id === paymentMethodId);
    
    if (!paymentMethodExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Payment method not found'
      });
    }
    
    // Set as default in Stripe
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Update user in database
    await User.findByIdAndUpdate(req.user.id, {
      defaultPaymentMethod: paymentMethodId
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Default payment method updated'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Delete a payment method
 * @route DELETE /api/payment-methods/:id
 */
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        status: 'fail',
        message: 'No customer profile found'
      });
    }
    
    // Verify payment method belongs to customer
    const paymentMethods = await customerUtils.getPaymentMethods(user.stripeCustomerId);
    const paymentMethodExists = paymentMethods.some(pm => pm.id === paymentMethodId);
    
    if (!paymentMethodExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Payment method not found'
      });
    }
    
    // Delete payment method
    await customerUtils.deletePaymentMethod(paymentMethodId);
    
    // If this was the default payment method, update user
    if (user.defaultPaymentMethod === paymentMethodId) {
      // Get remaining payment methods
      const remainingPaymentMethods = await customerUtils.getPaymentMethods(user.stripeCustomerId);
      
      // Update user with new default payment method or null
      await User.findByIdAndUpdate(req.user.id, {
        defaultPaymentMethod: remainingPaymentMethods.length > 0 ? 
          remainingPaymentMethods[0].id : null
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Payment method deleted'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};