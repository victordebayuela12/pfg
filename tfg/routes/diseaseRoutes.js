const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');
const authenticateJWT = require('../middleware/authenticateJWT');
// 🔹 Obtener todas las enfermedades
router.get('/', diseaseController.getAllDiseases);

router.get('/:id/approved-version', diseaseController.getApprovedVersionByDiseaseId);

// 🔹 Crear una nueva enfermedad (solo nombre)
router.post('/', diseaseController.createDisease);

// 🔹 Obtener una enfermedad por ID
router.get('/:id', diseaseController.getDiseaseById);

// 🔹 Eliminar una enfermedad
router.delete('/:id', diseaseController.deleteDisease);

// 🔹 Actualizar la versión aprobada de una enfermedad
router.put('/:id/version', diseaseController.updateApprovedVersion);

router.get('/:diseaseId/treatments', authenticateJWT, diseaseController.getTreatmentsFromApprovedVersion);
router.get('/', diseaseController.getAllDiseases);

module.exports = router;
