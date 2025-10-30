const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'wallet', 'other'],
    required: [true, 'Please provide payment method']
  },
  paymentType: {
    type: String,
    enum: ['subscription', 'one_time', 'appointment'],
    required: [true, 'Please provide payment type']
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Appointment', 'Subscription', 'Service']
  },
  stripePaymentId: String,
  stripeCustomerId: String,
  receiptUrl: String,
  description: String,
  metadata: {
    type: Map,
    of: String
  },
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true
});

// Subscription schema for recurring payments
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    required: [true, 'Please provide subscription plan']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide subscription amount']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interval: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  stripeSubscriptionId: String,
  stripePriceId: String,
  cancelReason: String,
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }]
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Payment, Subscription };