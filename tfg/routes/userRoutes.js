const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');
const { upload } = require('../config/cloudinary');
router.post('/register', userController.registerUser);


router.get('/', userController.getAllUsers);

router.put('/:id/status', userController.approveOrRejectUser);

router.get('/doctors/pending', userController.getPendingDoctors);
router.get('/doctors/approved', userController.getApprovedDoctors);
router.get('/doctors/rejected', userController.getRejectedDoctors);

router.patch('/doctors/:id/status', userController.approveOrRejectUser);

router.delete('/doctors/:id', userController.deleteUser);

router.get('/userdata', authenticateJWT, userController.getAuthenticatedUser);
router.post(
  "/upload-test",
  upload.any(), // permite cualquier campo de imagen
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    const file = req.files[0]; // solo probamos con una imagen

    console.log("✅ Imagen subida:", file);

    return res.status(200).json({
      message: "Imagen subida con éxito",
      file,
      cloudinaryUrl: file.path, // la URL pública de Cloudinary
    });
  }
);

module.exports = router;
