const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.patch('/update-password', protect, authController.updatePassword);
router.get('/logout', authController.logout);

module.exports = router;
