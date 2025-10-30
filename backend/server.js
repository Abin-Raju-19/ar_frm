const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const trainerRoutes = require('./routes/trainer.routes');
const adminRoutes = require('./routes/admin.routes');
const workoutRoutes = require('./routes/workout.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const paymentRoutes = require('./routes/payment.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const paymentMethodRoutes = require('./routes/payment-method.routes');
const checkoutRoutes = require('./routes/checkout.routes');

const app = express();

// Middleware
app.use(cors());

// Special raw body parser for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Standard body parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err.message);
    console.log('Continuing without database connection. Some features may not work.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/checkout', checkoutRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Fitness Management System API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});