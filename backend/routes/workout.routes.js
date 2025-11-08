const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const workoutController = require('../controllers/workout.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Workout plans routes
router.get('/plans', workoutController.getAllWorkoutPlans);
router.post('/plans', workoutController.createWorkoutPlan);

// Workout routes
router.get('/', workoutController.getAllWorkouts);
router.get('/:id', workoutController.getWorkout);
router.post('/', workoutController.createWorkout);
router.patch('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;