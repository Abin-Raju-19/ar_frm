const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const appointmentController = require('../controllers/appointment.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get trainer appointments
router.get('/trainer', appointmentController.getTrainerAppointments);

// Appointment routes
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', appointmentController.createAppointment);
router.patch('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

// Cancel appointment
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Submit feedback
router.post('/:id/feedback', appointmentController.submitFeedback);

module.exports = router;