const express = require('express');
const router = express.Router();
const diseaseVersionController = require('../controllers/diseaseVersionController');
const { upload } = require('../config/cloudinary');
const authenticateJWT = require('../middleware/authenticateJWT');


router.get('/doctor/:doctorId/:status', authenticateJWT, diseaseVersionController.getVersionsByDoctorAndStatus);


router.get('/status/:status', authenticateJWT, diseaseVersionController.getDiseaseVersionsByStatus);


router.get('/:disease_id/treatments', diseaseVersionController.getTreatmentsByDisease);


router.get('/:disease_id/versions', diseaseVersionController.getDiseaseVersions);


router.get('/version/:id', diseaseVersionController.getDiseaseVersionById);

router.post('/', authenticateJWT, upload.any(), diseaseVersionController.createDiseaseVersion);

router.patch('/:id/status/:status', authenticateJWT, diseaseVersionController.changeDiseaseVersionStatus);

router.delete('/:id', authenticateJWT, diseaseVersionController.deleteDiseaseVersion);

router.put('/:id/edit', authenticateJWT, upload.any(), diseaseVersionController.editRejectedDiseaseVersion);

module.exports = router;
