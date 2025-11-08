const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Trainer = require('../models/trainer.model');
const Appointment = require('../models/appointment.model');
const { Workout } = require('../models/workout.model');
const { NutritionLog } = require('../models/nutrition.model');
const { Payment } = require('../models/payment.model');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(restrictTo('admin'));

/**
 * Get dashboard statistics
 * @route GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTrainers = await Trainer.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalNutritionLogs = await NutritionLog.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalTrainers,
          totalAppointments,
          totalWorkouts,
          totalNutritionLogs,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get all users
 * @route GET /api/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get all trainers
 * @route GET /api/admin/trainers
 */
router.get('/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate('user', 'name email profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: trainers.length,
      data: {
        trainers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;