const { Workout, WorkoutPlan } = require('../models/workout.model');
const User = require('../models/user.model');
const Trainer = require('../models/trainer.model');

/**
 * Get all workouts for a user
 * @route GET /api/workouts
 */
exports.getAllWorkouts = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    // Check if user is requesting their own workouts or if they have permission
    if (userId !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view these workouts'
        });
      }
    }

    // Build query
    const queryObj = { ...req.query, user: userId };
    delete queryObj.userId;

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Workout.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-date');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const workouts = await query;

    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: {
        workouts
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
 * Get workout by ID
 * @route GET /api/workouts/:id
 */
exports.getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workout not found'
      });
    }

    // Check if user has permission to view this workout
    if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(workout.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view this workout'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        workout
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
 * Create workout
 * @route POST /api/workouts
 */
exports.createWorkout = async (req, res) => {
  try {
    // Set user to current user if not specified
    if (!req.body.user) {
      req.body.user = req.user.id;
    }

    // Check if user has permission to create workout for another user
    if (req.body.user !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(req.body.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to create workouts for this user'
        });
      }

      // Set trainer if user is a trainer
      req.body.trainer = trainer._id;
    }

    const newWorkout = await Workout.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        workout: newWorkout
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
 * Update workout
 * @route PATCH /api/workouts/:id
 */
exports.updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workout not found'
      });
    }

    // Check if user has permission to update this workout
    if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(workout.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to update this workout'
        });
      }
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        workout: updatedWorkout
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
 * Delete workout
 * @route DELETE /api/workouts/:id
 */
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workout not found'
      });
    }

    // Check if user has permission to delete this workout
    if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(workout.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to delete this workout'
        });
      }
    }

    await Workout.findByIdAndDelete(req.params.id);

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
 * Get all workout plans
 * @route GET /api/workouts/plans
 */
exports.getAllWorkoutPlans = async (req, res) => {
  try {
    // Build query to get public plans or user's own plans
    const query = {
      $or: [
        { isPublic: true },
        { creator: req.user.id }
      ]
    };

    // If user is a trainer, also include plans for their clients
    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (trainer && trainer.clients.length > 0) {
        query.$or.push({ creator: { $in: trainer.clients } });
      }
    }

    const workoutPlans = await WorkoutPlan.find(query);

    res.status(200).json({
      status: 'success',
      results: workoutPlans.length,
      data: {
        workoutPlans
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
 * Create workout plan
 * @route POST /api/workouts/plans
 */
exports.createWorkoutPlan = async (req, res) => {
  try {
    // Set creator to current user if not specified
    if (!req.body.creator) {
      req.body.creator = req.user.id;
    }

    // Check if user has permission to create plan for another user
    if (req.body.creator !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(req.body.creator)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to create workout plans for this user'
        });
      }
    }

    const newWorkoutPlan = await WorkoutPlan.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        workoutPlan: newWorkoutPlan
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};