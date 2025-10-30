const User = require('../models/user.model');
const Trainer = require('../models/trainer.model');

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });

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
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
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
 * Update user profile
 * @route PATCH /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    // Prevent password updates through this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /update-password.'
      });
    }

    // Filter out unwanted fields that should not be updated
    const filteredBody = filterObj(req.body, 
      'name', 'email', 'profilePicture', 'height', 'weight', 'age', 
      'gender', 'fitnessGoals', 'healthMetrics'
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
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
 * Delete user
 * @route DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get user's trainers
 * @route GET /api/users/:id/trainers
 */
exports.getUserTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ clients: req.params.id })
      .populate('user', 'name email profilePicture');

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
};

/**
 * Helper function to filter object
 * @param {Object} obj - Object to filter
 * @param  {...String} allowedFields - Allowed fields
 * @returns {Object} - Filtered object
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};