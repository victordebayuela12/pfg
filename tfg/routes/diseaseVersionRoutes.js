const express = require('express');
const router = express.Router();
const diseaseVersionController = require('../controllers/diseaseVersionController');
const { upload } = require('../config/cloudinary');
const authenticateJWT = require('../middleware/authenticateJWT');

// ✅ Obtener versiones creadas por un doctor según su estado
router.get('/doctor/:doctorId/:status', authenticateJWT, diseaseVersionController.getVersionsByDoctorAndStatus);

// ✅ Obtener versiones por estado global
router.get('/status/:status', authenticateJWT, diseaseVersionController.getDiseaseVersionsByStatus);

// ✅ Obtener tratamientos de la versión aprobada de una enfermedad
router.get('/:disease_id/treatments', diseaseVersionController.getTreatmentsByDisease);

// ✅ Obtener todas las versiones de una enfermedad
router.get('/:disease_id/versions', diseaseVersionController.getDiseaseVersions);

// ✅ Obtener una versión específica por ID
router.get('/version/:id', diseaseVersionController.getDiseaseVersionById);

// ✅ Crear nueva versión (con imágenes en descriptions)
router.post('/', authenticateJWT, upload.any(), diseaseVersionController.createDiseaseVersion);

// ✅ Cambiar estado de una versión
router.patch('/:id/status/:status', authenticateJWT, diseaseVersionController.changeDiseaseVersionStatus);

// ✅ Eliminar una versión rechazada
router.delete('/:id', authenticateJWT, diseaseVersionController.deleteDiseaseVersion);

//Modify version
// Editar una DiseaseVersion rechazada
router.put('/:id/edit', authenticateJWT, upload.any(), diseaseVersionController.editRejectedDiseaseVersion);

module.exports = router;
