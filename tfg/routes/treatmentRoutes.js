const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const authenticateJWT = require('../middleware/authenticateJWT');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'treatments', 
        format: async (req, file) => 'png', 
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage: storage });


router.post('/create', authenticateJWT, upload.any(), treatmentController.createTreatment);





router.put('/:id', authenticateJWT, upload.any(), treatmentController.updateTreatment);


router.patch('/:id/status', authenticateJWT, treatmentController.updateTreatmentStatus);


router.delete('/:id', authenticateJWT, treatmentController.deleteTreatment);


router.get('/doctor/:doctorId/:status', authenticateJWT, treatmentController.getTreatmentsByDoctorAndStatus);

router.get('/state', authenticateJWT, treatmentController.getTreatmentsByStatus);


router.get('/:id', authenticateJWT, treatmentController.getTreatmentById);

module.exports = router;
