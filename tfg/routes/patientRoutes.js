const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const  authenticateJWT = require('../middleware/authenticateJWT');

router.post('/register', patientController.registerPatient);


router.get('/', patientController.getAllPatients);
router.get('/my-patients', authenticateJWT, patientController.getMyPatients);



router.get('/fullinfo/:id',authenticateJWT, patientController.getFullUserInfo);

router.post('/login', patientController.loginPatient);

router.get('/:id', patientController.getPatientById);

router.delete('/:id', patientController.deletePatient);


module.exports = router;
