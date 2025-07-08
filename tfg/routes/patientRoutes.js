const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const  authenticateJWT = require('../middleware/authenticateJWT');
// Registrar un nuevo paciente
router.post('/register', patientController.registerPatient);

// Obtener todos los pacientes
router.get('/', patientController.getAllPatients);
router.get('/my-patients', authenticateJWT, patientController.getMyPatients);



router.get('/fullinfo/:id',authenticateJWT, patientController.getFullUserInfo);

router.post('/login', patientController.loginPatient);
// Obtener un paciente por ID
router.get('/:id', patientController.getPatientById);

// Eliminar un paciente
router.delete('/:id', patientController.deletePatient);


module.exports = router;
