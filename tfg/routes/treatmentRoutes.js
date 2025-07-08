const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const authenticateJWT = require('../middleware/authenticateJWT');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// 📌 Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📌 Configuración de Multer para subir imágenes a Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'treatments', // Carpeta en Cloudinary
        format: async (req, file) => 'png', // Formato de imagen
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage: storage });

// 📌 Crear un tratamiento (Solo médicos autenticados)
router.post('/create', authenticateJWT, upload.any(), treatmentController.createTreatment);




// 📌 Modificar un tratamiento (permitiendo actualizar imágenes)
router.put('/:id', authenticateJWT, upload.any(), treatmentController.updateTreatment);

// 📌 Cambiar estado del tratamiento (Solo admins)
router.patch('/:id/status', authenticateJWT, treatmentController.updateTreatmentStatus);

// 📌 Eliminar un tratamiento
router.delete('/:id', authenticateJWT, treatmentController.deleteTreatment);

// Obtener tratamientos del doctor autenticado por estado
router.get('/doctor/:doctorId/:status', authenticateJWT, treatmentController.getTreatmentsByDoctorAndStatus);

router.get('/state', authenticateJWT, treatmentController.getTreatmentsByStatus);

// 📌 Obtener un tratamiento por ID
router.get('/:id', authenticateJWT, treatmentController.getTreatmentById);

module.exports = router;
