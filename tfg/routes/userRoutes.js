const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');
// Registrar un usuario (Admin o Doctor)
router.post('/register', userController.registerUser);

// Iniciar sesión


// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Aprobar o rechazar un usuario (Solo Admin)
router.put('/:id/status', userController.approveOrRejectUser);

// Obtener médicos por estado
router.get('/doctors/pending', userController.getPendingDoctors);
router.get('/doctors/approved', userController.getApprovedDoctors);
router.get('/doctors/rejected', userController.getRejectedDoctors);

// Actualizar estado de un doctor
router.patch('/doctors/:id/status', userController.approveOrRejectUser);

// Eliminar un doctor
router.delete('/doctors/:id', userController.deleteUser);

router.get('/userdata', authenticateJWT, userController.getAuthenticatedUser);

module.exports = router;
