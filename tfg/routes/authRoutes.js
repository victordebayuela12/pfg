const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.loginUser);
router.put('/change-password', authenticateJWT, authController.changePasswordWithSession);
module.exports = router;
