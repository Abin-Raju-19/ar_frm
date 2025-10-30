/**
 * Stripe webhook event handlers
 */

const { Payment, Subscription } = require('../models/payment.model');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');

/**
 * Handle successful payment intent
 * @param {Object} paymentIntent - Stripe payment intent object
 */
exports.handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    // Find the payment in our database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      {
        status: 'completed',
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url || null,
        paymentDetails: {
          cardBrand: paymentIntent.charges?.data[0]?.payment_method_details?.card?.brand || null,
          last4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4 || null
        }
      },
      { new: true }
    );

    if (!payment) {
      console.log(`No payment found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Handle different payment types
    if (payment.paymentType === 'appointment' && payment.relatedTo) {
      await Appointment.findByIdAndUpdate(payment.relatedTo, {
        status: 'confirmed',
        payment: payment._id
      });
    } else if (payment.paymentType === 'subscription' && payment.relatedTo) {
      await Subscription.findByIdAndUpdate(payment.relatedTo, {
        status: 'active',
        paymentHistory: [...(payment.paymentHistory || []), {
          amount: payment.amount,
          date: new Date(),
          status: 'completed',
          paymentId: payment._id
        }]
      });

      // Update user subscription status
      const subscription = await Subscription.findById(payment.relatedTo);
      if (subscription) {
        await User.findByIdAndUpdate(subscription.user, {
          subscriptionStatus: 'active',
          subscriptionPlan: subscription.plan,
          subscriptionExpiry: subscription.endDate
        });
      }
    }

    console.log(`Payment ${payment._id} marked as completed`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

/**
 * Handle failed payment intent
 * @param {Object} paymentIntent - Stripe payment intent object
 */
exports.handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    // Find the payment in our database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      },
      { new: true }
    );

    if (!payment) {
      console.log(`No payment found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Handle different payment types
    if (payment.paymentType === 'appointment' && payment.relatedTo) {
      await Appointment.findByIdAndUpdate(payment.relatedTo, {
        status: 'payment_failed'
      });
    } else if (payment.paymentType === 'subscription' && payment.relatedTo) {
      await Subscription.findByIdAndUpdate(payment.relatedTo, {
        status: 'payment_failed'
      });
    }

    console.log(`Payment ${payment._id} marked as failed`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

/**
 * Handle subscription created
 * @param {Object} subscription - Stripe subscription object
 */
exports.handleSubscriptionCreated = async (subscription) => {
  try {
    // Find the subscription in our database by Stripe subscription ID
    const dbSubscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status === 'active' ? 'active' : 'pending',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      },
      { new: true }
    );

    if (!dbSubscription) {
      console.log(`No subscription found for Stripe subscription: ${subscription.id}`);
      return;
    }

    console.log(`Subscription ${dbSubscription._id} updated with status: ${dbSubscription.status}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
};

/**
 * Handle subscription updated
 * @param {Object} subscription - Stripe subscription object
 */
exports.handleSubscriptionUpdated = async (subscription) => {
  try {
    // Find the subscription in our database by Stripe subscription ID
    const dbSubscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: mapStripeSubscriptionStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      { new: true }
    );

    if (!dbSubscription) {
      console.log(`No subscription found for Stripe subscription: ${subscription.id}`);
      return;
    }

    // Update user subscription status if needed
    if (dbSubscription.status === 'active' || dbSubscription.status === 'canceled') {
      await User.findByIdAndUpdate(dbSubscription.user, {
        subscriptionStatus: dbSubscription.status,
        subscriptionPlan: dbSubscription.plan,
        subscriptionExpiry: dbSubscription.status === 'canceled' ? 
          dbSubscription.currentPeriodEnd : dbSubscription.endDate
      });
    }

    console.log(`Subscription ${dbSubscription._id} updated with status: ${dbSubscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};

/**
 * Handle subscription deleted
 * @param {Object} subscription - Stripe subscription object
 */
exports.handleSubscriptionDeleted = async (subscription) => {
  try {
    // Find the subscription in our database by Stripe subscription ID
    const dbSubscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'canceled',
        canceledAt: new Date(),
        autoRenew: false
      },
      { new: true }
    );

    if (!dbSubscription) {
      console.log(`No subscription found for Stripe subscription: ${subscription.id}`);
      return;
    }

    // Update user subscription status
    await User.findByIdAndUpdate(dbSubscription.user, {
      subscriptionStatus: 'canceled',
      subscriptionExpiry: dbSubscription.currentPeriodEnd
    });

    console.log(`Subscription ${dbSubscription._id} marked as canceled`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
};

/**
 * Map Stripe subscription status to our database status
 * @param {String} stripeStatus - Stripe subscription status
 * @returns {String} - Database subscription status
 */
function mapStripeSubscriptionStatus(stripeStatus) {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'unpaid': 'past_due',
    'canceled': 'canceled',
    'incomplete': 'pending',
    'incomplete_expired': 'canceled',
    'trialing': 'active'
  };

  return statusMap[stripeStatus] || 'pending';
}