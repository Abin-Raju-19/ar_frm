const Trainer = require('../models/trainer.model');
const User = require('../models/user.model');

/**
 * Get all trainers
 * @route GET /api/trainers
 */
exports.getAllTrainers = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Trainer.find(JSON.parse(queryStr)).populate('user', 'name email profilePicture');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const trainers = await query;

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
 * Get trainer by ID
 * @route GET /api/trainers/:id
 */
exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('clients', 'name email profilePicture');

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        trainer
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
 * Create trainer profile
 * @route POST /api/trainers
 */
exports.createTrainer = async (req, res) => {
  try {
    // Check if user already has a trainer profile
    const existingTrainer = await Trainer.findOne({ user: req.user.id });
    if (existingTrainer) {
      return res.status(400).json({
        status: 'fail',
        message: 'You already have a trainer profile'
      });
    }

    // Create trainer profile
    const newTrainer = await Trainer.create({
      user: req.user.id,
      ...req.body
    });

    // Update user role to trainer
    await User.findByIdAndUpdate(req.user.id, { role: 'trainer' });

    res.status(201).json({
      status: 'success',
      data: {
        trainer: newTrainer
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
 * Update trainer profile
 * @route PATCH /api/trainers/:id
 */
exports.updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    // Check if user is the trainer or an admin
    if (trainer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this trainer profile'
      });
    }

    // Update trainer profile
    const updatedTrainer = await Trainer.findByIdAndUpdate(
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
        trainer: updatedTrainer
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
 * Delete trainer profile
 * @route DELETE /api/trainers/:id
 */
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    // Check if user is the trainer or an admin
    if (trainer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this trainer profile'
      });
    }

    await Trainer.findByIdAndDelete(req.params.id);

    // Update user role back to user if it's not an admin
    if (req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user.id, { role: 'user' });
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
 * Add client to trainer
 * @route POST /api/trainers/:id/clients
 */
exports.addClient = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide client ID'
      });
    }

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    // Check if user is the trainer or an admin
    if (trainer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this trainer profile'
      });
    }

    // Check if client exists
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Client not found'
      });
    }

    // Check if client is already added
    if (trainer.clients.includes(clientId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Client already added to trainer'
      });
    }

    // Add client to trainer
    trainer.clients.push(clientId);
    await trainer.save();

    res.status(200).json({
      status: 'success',
      data: {
        trainer
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
 * Remove client from trainer
 * @route DELETE /api/trainers/:id/clients/:clientId
 */
exports.removeClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    // Check if user is the trainer or an admin
    if (trainer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this trainer profile'
      });
    }

    // Check if client is in the trainer's client list
    if (!trainer.clients.includes(clientId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Client not found in trainer\'s client list'
      });
    }

    // Remove client from trainer
    trainer.clients = trainer.clients.filter(
      client => client.toString() !== clientId
    );
    await trainer.save();

    res.status(200).json({
      status: 'success',
      data: {
        trainer
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
 * Get trainer's clients
 * @route GET /api/trainers/:id/clients
 */
exports.getTrainerClients = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    // Check if user is the trainer or an admin
    if (trainer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this trainer\'s clients'
      });
    }

    const clients = await User.find({ _id: { $in: trainer.clients } });

    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: {
        clients
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};