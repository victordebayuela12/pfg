const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.get('/', diseaseController.getAllDiseases);

router.get('/:id/approved-version', diseaseController.getApprovedVersionByDiseaseId);

router.post('/', diseaseController.createDisease);

router.get('/:id', diseaseController.getDiseaseById);

router.delete('/:id', diseaseController.deleteDisease);

router.put('/:id/version', diseaseController.updateApprovedVersion);

router.get('/:diseaseId/treatments', authenticateJWT, diseaseController.getTreatmentsFromApprovedVersion);
router.get('/', diseaseController.getAllDiseases);

module.exports = router;
