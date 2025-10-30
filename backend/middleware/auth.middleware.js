const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and attaches the user to the request object
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in the authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authorization failed.'
    });
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param  {...String} roles - Roles allowed to access the route
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Middleware to check if the user is the owner of the resource
 * @param {String} model - The model name to check ownership
 * @param {String} paramId - The parameter name in the request params
 */
exports.isOwner = (model, paramId = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${model}.model`);
      const resource = await Model.findById(req.params[paramId]);

      if (!resource) {
        return res.status(404).json({
          status: 'fail',
          message: 'Resource not found'
        });
      }

      // Check if the user is the owner of the resource
      if (resource.user && resource.user.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to perform this action'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  };
};

/**
 * Middleware to check if the user is a trainer assigned to the client
 */
exports.isClientTrainer = async (req, res, next) => {
  try {
    const Trainer = require('../models/trainer.model');
    const trainer = await Trainer.findOne({ user: req.user.id });

    if (!trainer) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not registered as a trainer'
      });
    }

    // Check if the client is in the trainer's client list
    const clientId = req.params.userId || req.body.userId;
    if (!clientId || !trainer.clients.includes(clientId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'This user is not your client'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};