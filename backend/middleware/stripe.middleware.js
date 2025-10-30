/**
 * Stripe webhook middleware for verifying webhook signatures
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Verify Stripe webhook signature
 * This middleware should be used on webhook routes to ensure the request is coming from Stripe
 */
exports.verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({
      status: 'fail',
      message: 'Stripe signature is missing'
    });
  }

  try {
    // Verify the event by fetching the signature from headers
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Add the verified event to the request object
    req.stripeEvent = event;
    next();
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({
      status: 'fail',
      message: `Webhook signature verification failed: ${error.message}`
    });
  }
};

/**
 * Handle specific Stripe webhook events
 * @param {Array} eventTypes - Array of event types to handle
 * @returns {Function} - Middleware function
 */
exports.handleWebhookEvents = (eventTypes) => {
  return (req, res, next) => {
    const event = req.stripeEvent;
    
    if (!event) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Stripe event found. Make sure to use verifyWebhookSignature middleware first.'
      });
    }
    
    // Check if the event type is one we want to handle
    if (eventTypes.includes(event.type)) {
      next();
    } else {
      // If we don't handle this event type, acknowledge receipt
      return res.status(200).json({ received: true });
    }
  };
};