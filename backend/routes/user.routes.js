const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users (admin only)
router.get('/', restrictTo('admin'), userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUser);

// Update user profile
router.patch('/:id', userController.updateUser);

// Delete user (admin only)
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

// Get user's trainers
router.get('/:id/trainers', userController.getUserTrainers);

module.exports = router;