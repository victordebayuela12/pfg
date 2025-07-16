const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/register', userController.registerUser);


router.get('/', userController.getAllUsers);

router.put('/:id/status', userController.approveOrRejectUser);

router.get('/doctors/pending', userController.getPendingDoctors);
router.get('/doctors/approved', userController.getApprovedDoctors);
router.get('/doctors/rejected', userController.getRejectedDoctors);

router.patch('/doctors/:id/status', userController.approveOrRejectUser);

router.delete('/doctors/:id', userController.deleteUser);

router.get('/userdata', authenticateJWT, userController.getAuthenticatedUser);

module.exports = router;
