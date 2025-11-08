const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const trainerController = require('../controllers/trainer.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all trainers
router.get('/', trainerController.getAllTrainers);

// Get trainer by ID
router.get('/:id', trainerController.getTrainer);

// Create trainer profile
router.post('/', trainerController.createTrainer);

// Update trainer profile
router.patch('/:id', trainerController.updateTrainer);

// Delete trainer profile
router.delete('/:id', trainerController.deleteTrainer);

// Add client to trainer
router.post('/:id/clients', trainerController.addClient);

// Remove client from trainer
router.delete('/:id/clients/:clientId', trainerController.removeClient);

// Get trainer's clients
router.get('/:id/clients', trainerController.getTrainerClients);

module.exports = router;