const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Trainer = require('../models/trainer.model');

/**
 * Get all appointments for a user
 * @route GET /api/appointments
 */
exports.getAllAppointments = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    // Check if user is requesting their own appointments or if they have permission
    if (userId !== req.user.id && req.user.role !== 'admin') {
      // Check if user is a trainer for this client
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || !trainer.clients.includes(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view these appointments'
        });
      }
    }

    // Build query
    const queryObj = { ...req.query, user: userId };
    delete queryObj.userId;

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Appointment.find(JSON.parse(queryStr))
      .populate('trainer', 'user')
      .populate('trainer.user', 'name email profilePicture');

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
    const appointments = await query;

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
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
 * Get appointments for a trainer
 * @route GET /api/appointments/trainer
 */
exports.getTrainerAppointments = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });

    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer profile not found'
      });
    }

    // Build query
    const queryObj = { ...req.query, trainer: trainer._id };
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Appointment.find(JSON.parse(queryStr))
      .populate('user', 'name email profilePicture');

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
    const appointments = await query;

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
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
 * Get appointment by ID
 * @route GET /api/appointments/:id
 */
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('trainer', 'user')
      .populate('trainer.user', 'name email profilePicture');

    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to view this appointment
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is the trainer
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || trainer._id.toString() !== appointment.trainer.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to view this appointment'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
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
 * Create appointment
 * @route POST /api/appointments
 */
exports.createAppointment = async (req, res) => {
  try {
    // Set user to current user if not specified
    if (!req.body.user) {
      req.body.user = req.user.id;
    }

    // Check if user has permission to create appointment for another user
    if (req.body.user !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to create appointments for this user'
      });
    }

    // Verify trainer exists
    const trainer = await Trainer.findById(req.body.trainer);
    if (!trainer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trainer not found'
      });
    }

    const newAppointment = await Appointment.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        appointment: newAppointment
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
 * Update appointment
 * @route PATCH /api/appointments/:id
 */
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to update this appointment
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is the trainer
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || trainer._id.toString() !== appointment.trainer.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to update this appointment'
        });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
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
        appointment: updatedAppointment
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
 * Delete appointment
 * @route DELETE /api/appointments/:id
 */
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to delete this appointment
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is the trainer
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || trainer._id.toString() !== appointment.trainer.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to delete this appointment'
        });
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);

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
 * Cancel appointment
 * @route PATCH /api/appointments/:id/cancel
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to cancel this appointment
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is the trainer
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || trainer._id.toString() !== appointment.trainer.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to cancel this appointment'
        });
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      status: 'success',
      data: {
        appointment
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
 * Submit feedback for appointment
 * @route POST /api/appointments/:id/feedback
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to submit feedback
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to submit feedback for this appointment'
      });
    }

    appointment.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };
    await appointment.save();

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

