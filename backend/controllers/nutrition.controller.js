const { NutritionLog, MealPlan } = require('../models/nutrition.model');
const User = require('../models/user.model');
const Trainer = require('../models/trainer.model');

/**
 * Get all nutrition logs for a user
 * @route GET /api/nutrition
 */
exports.getAllNutritionLogs = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    // Check if user is requesting their own logs or if they have permission
    if (userId !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view these nutrition logs'
        });
      }
    }

    // Build query
    const queryObj = { ...req.query, user: userId };
    delete queryObj.userId;

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = NutritionLog.find(JSON.parse(queryStr));

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
    const nutritionLogs = await query;

    res.status(200).json({
      status: 'success',
      results: nutritionLogs.length,
      data: {
        nutritionLogs
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
 * Get nutrition log by ID
 * @route GET /api/nutrition/:id
 */
exports.getNutritionLog = async (req, res) => {
  try {
    const nutritionLog = await NutritionLog.findById(req.params.id);

    if (!nutritionLog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Nutrition log not found'
      });
    }

    // Check if user has permission to view this log
    if (nutritionLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(nutritionLog.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view this nutrition log'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        nutritionLog
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
 * Create nutrition log
 * @route POST /api/nutrition
 */
exports.createNutritionLog = async (req, res) => {
  try {
    // Set user to current user if not specified
    if (!req.body.user) {
      req.body.user = req.user.id;
    }

    // Check if user has permission to create log for another user
    if (req.body.user !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(req.body.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to create nutrition logs for this user'
        });
      }
    }

    const newNutritionLog = await NutritionLog.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        nutritionLog: newNutritionLog
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
 * Update nutrition log
 * @route PATCH /api/nutrition/:id
 */
exports.updateNutritionLog = async (req, res) => {
  try {
    const nutritionLog = await NutritionLog.findById(req.params.id);

    if (!nutritionLog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Nutrition log not found'
      });
    }

    // Check if user has permission to update this log
    if (nutritionLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(nutritionLog.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to update this nutrition log'
        });
      }
    }

    const updatedNutritionLog = await NutritionLog.findByIdAndUpdate(
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
        nutritionLog: updatedNutritionLog
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
 * Delete nutrition log
 * @route DELETE /api/nutrition/:id
 */
exports.deleteNutritionLog = async (req, res) => {
  try {
    const nutritionLog = await NutritionLog.findById(req.params.id);

    if (!nutritionLog) {
      return res.status(404).json({
        status: 'fail',
        message: 'Nutrition log not found'
      });
    }

    // Check if user has permission to delete this log
    if (nutritionLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(nutritionLog.user)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to delete this nutrition log'
        });
      }
    }

    await NutritionLog.findByIdAndDelete(req.params.id);

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
 * Get all meal plans
 * @route GET /api/nutrition/plans
 */
exports.getAllMealPlans = async (req, res) => {
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

    const mealPlans = await MealPlan.find(query).populate('creator', 'name email');

    res.status(200).json({
      status: 'success',
      results: mealPlans.length,
      data: {
        mealPlans
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
 * Get meal plan by ID
 * @route GET /api/nutrition/plans/:id
 */
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id).populate('creator', 'name email');

    if (!mealPlan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found'
      });
    }

    // Check if user has permission to view this plan
    if (!mealPlan.isPublic && mealPlan.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(mealPlan.creator)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view this meal plan'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        mealPlan
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
 * Create meal plan
 * @route POST /api/nutrition/plans
 */
exports.createMealPlan = async (req, res) => {
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
          message: 'You do not have permission to create meal plans for this user'
        });
      }
    }

    const newMealPlan = await MealPlan.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        mealPlan: newMealPlan
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
 * Update meal plan
 * @route PATCH /api/nutrition/plans/:id
 */
exports.updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found'
      });
    }

    // Check if user has permission to update this plan
    if (mealPlan.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this meal plan'
      });
    }

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
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
        mealPlan: updatedMealPlan
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
 * Delete meal plan
 * @route DELETE /api/nutrition/plans/:id
 */
exports.deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Meal plan not found'
      });
    }

    // Check if user has permission to delete this plan
    if (mealPlan.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this meal plan'
      });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

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

