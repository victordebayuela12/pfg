const express = require('express');
const multer = require('multer'); // Importa multer
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Disease = require('../models/Disease'); // Modelo de enfermedades
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../middleware/authenticateJWT');
const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Para cargar variables de entorno




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configuración de multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tfg-images', // Nombre de la carpeta en Cloudinary
        format: async (req, file) => ['png','jpg','jpeg'], // Puedes cambiar a 'jpg', 'webp', etc.
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage: storage });

// Ruta para iniciar sesión
/*router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Su cuenta está pendiente de aprobación. Por favor, contacte al administrador.' });
        }

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            role: user.role,
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Hubo un problema al iniciar sesión.' });
    }
});*/
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Cuenta pendiente de aprobación.' });
        }

        // Generar el token JWT con el ID del usuario
        const token = jwt.sign(
            { id: user._id.toString(), role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } 
        );

        console.log("🟢 Usuario autenticado:", user._id.toString());
        console.log("🟢 Token generado:", token);

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,    
            role: user.role,
            userId: user._id.toString() // Envio de user ID
        });

    } catch (error) {
        console.error('🔴 Error en el inicio de sesión:', error);
        res.status(500).json({ error: 'Hubo un problema al iniciar sesión.' });
    }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.status === 'rejected') {
            return res.status(403).json({
                error: 'Su registro fue rechazado anteriormente. Contacte al administrador para más información.',
            });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            status: 'pending',
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado con éxito. Esperando aprobación.' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Hubo un problema al registrar el usuario.' });
    }
});

// Rutas para gestionar doctores
router.get('/doctors/pending', async (req, res) => {
    try {
        const pendingDoctors = await User.find({ role: 'doctor', status: 'pending' });
        res.status(200).json(pendingDoctors);
    } catch (error) {
        console.error('Error al obtener médicos pendientes:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener los médicos pendientes.' });
    }
});

router.get('/doctors/approved', async (req, res) => {
    try {
        const approvedDoctors = await User.find({ role: 'doctor', status: 'approved' });
        res.status(200).json(approvedDoctors);
    } catch (error) {
        console.error('Error al obtener médicos aprobados:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener los médicos aprobados.' });
    }
});

router.get('/doctors/rejected', async (req, res) => {
    try {
        const rejectedDoctors = await User.find({ role: 'doctor', status: 'rejected' });
        res.status(200).json(rejectedDoctors);
    } catch (error) {
        console.error('Error al obtener médicos rechazados:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener los médicos rechazados.' });
    }
});

router.patch('/doctors/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    try {
        const doctor = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!doctor) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: `Estado actualizado a ${status}.` });
    } catch (error) {
        console.error('Error al actualizar el estado del médico:', error);
        res.status(500).json({ error: 'Hubo un problema al actualizar el estado.' });
    }
});

router.delete('/doctors/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Médico eliminado con éxito.' });
    } catch (error) {
        console.error('Error al eliminar al médico:', error);
        res.status(500).json({ error: 'Hubo un problema al eliminar al médico.' });
    }
});

// Rutas para gestionar enfermedades
router.post('/diseases', authenticateJWT, upload.any(), async (req, res) => {
    const { name, resume, descriptions, treatments } = req.body;

    try {
        if (!name || !resume) {
            return res.status(400).json({ error: 'El nombre y el resumen son requeridos.' });
        }
        console.log("📌 ID del Doctor Creador:", req.user_id); // Debe aparecer en la consola
        console.log("📌 Archivos recibidos en req.files:", req.files);
        console.log("📌 Cuerpo de la petición en req.body:", req.body);

        let parsedDescriptions = [];
        if (descriptions) {
            parsedDescriptions = typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions;
            parsedDescriptions = parsedDescriptions.map((desc, index) => ({
                position: desc.position || index + 1,
                descripcion: desc.descripcion,
                image: req.files.find(file => file.fieldname === `description-${index}`)?.path || null,
            }));
        }

        let parsedTreatments = [];
        if (treatments) {
            parsedTreatments = typeof treatments === 'string' ? JSON.parse(treatments) : treatments;
            parsedTreatments = parsedTreatments.map((treatment, treatmentIndex) => ({
                name: treatment.name,
                descriptions: treatment.descriptions.map((desc, descIndex) => ({
                    position: desc.position || descIndex + 1,
                    descripcion: desc.descripcion,
                    image: req.files.find(file => file.fieldname === `treatment-${treatmentIndex}-${descIndex}`)?.path || null,
                })),
            }));
        }

        const newDisease = new Disease({
            name,
            resume,
            descriptions: parsedDescriptions,
            treatments: parsedTreatments,
            doctorCreador: req.user_id, // ✅ Ahora se asignará correctamente
        });

        const savedDisease = await newDisease.save();
        res.status(201).json(savedDisease);
    } catch (error) {
        console.error('Error al crear la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al crear la enfermedad.' });
    }
});



router.get('/diseases/pending', async (req, res) => {
    try {
        const pendingDiseases = await Disease.find({ status: 'pending' });
        res.status(200).json(pendingDiseases);
    } catch (error) {
        console.error('Error al obtener enfermedades pendientes:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades pendientes.' });
    }
});

router.get('/diseases/approved', async (req, res) => {
    try {
        const pendingDiseases = await Disease.find({ status: 'approved' });
        res.status(200).json(pendingDiseases);
    } catch (error) {
        console.error('Error al obtener enfermedades aprobadas:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades aprobadas.' });
    }
});

router.get('/diseases/rejected', async (req, res) => {
    try {
        const pendingDiseases = await Disease.find({ status: 'rejected' });
        res.status(200).json(pendingDiseases);
    } catch (error) {
        console.error('Error al obtener enfermedades rechazadas:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades rechazadas.' });
    }
});

router.patch('/diseases/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    try {
        const disease = await Disease.findByIdAndUpdate(id, { status }, { new: true });
        if (!disease) {
            return res.status(404).json({ error: 'Enfermedad no encontrada.' });
        }
        res.status(200).json({ message: `Estado actualizado a ${status}.` });
    } catch (error) {
        console.error('Error al actualizar el estado de la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al actualizar el estado de la enfermedad.' });
    }
});

router.delete('/diseases/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Disease.findByIdAndDelete(id);
        res.status(200).json({ message: 'Enfermedad eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al eliminar la enfermedad.' });
    }
});


router.patch('/diseases/:id/descriptions', async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ error: 'La descripción es requerida.' });
    }

    try {
        const disease = await Disease.findById(id);
        if (!disease) {
            return res.status(404).json({ error: 'Enfermedad no encontrada.' });
        }

        const newDescription = {
            position: disease.descriptions.length + 1,
            descripcion,
        };

        disease.descriptions.push(newDescription);
        await disease.save();

        res.status(200).json({ message: 'Descripción añadida con éxito.', disease });
    } catch (error) {
        console.error('Error al agregar descripción:', error);
        res.status(500).json({ error: 'Hubo un problema al añadir la descripción.' });
    }
});

router.get('/diseases/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la enfermedad por ID
        const disease = await Disease.findById(id).populate('doctorCreador'); // Incluye información del doctor si existe

        if (!disease) {
            return res.status(404).json({ error: 'Enfermedad no encontrada.' });
        }

        // Decodificar las imágenes Base64 de las descripciones
        const descriptionsWithDecodedImages = disease.descriptions.map((desc) => ({
            position: desc.position,
            descripcion: desc.descripcion,
            image: desc.image ? `data:image/jpeg;base64,${desc.image}` : null // Adaptar según el tipo de imagen
        }));

        // Decodificar las imágenes Base64 de los tratamientos
        const treatmentsWithDecodedImages = disease.treatments.map((treatment) => ({
            name: treatment.name,
            descriptions: treatment.descriptions.map((desc) => ({
                position: desc.position,
                descripcion: desc.descripcion,
                image: desc.image ? `data:image/jpeg;base64,${desc.image}` : null // Adaptar según el tipo de imagen
            }))
        }));

        // Formar la respuesta con imágenes decodificadas
        const response = {
            ...disease.toObject(),
            descriptions: descriptionsWithDecodedImages,
            treatments: treatmentsWithDecodedImages
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error al obtener la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener la enfermedad.' });
    }
});



router.patch('/diseases/:id', upload.any(), async (req, res) => {
    const { id } = req.params;
    let { name, resume, descriptions, treatments } = req.body;

    try {
        if (!name || !resume) {
            return res.status(400).json({ error: 'El nombre y el resumen son requeridos.' });
        }

        console.log("📌 Archivos recibidos en req.files:", req.files);
        console.log("📌 Cuerpo de la petición en req.body:", req.body);

        // --- Procesar descripciones ---
        let parsedDescriptions = [];
        if (descriptions) {
            if (typeof descriptions === 'string') {
                parsedDescriptions = JSON.parse(descriptions);
            } else if (Array.isArray(descriptions)) {
                parsedDescriptions = descriptions;
            }

            parsedDescriptions = parsedDescriptions.map((desc, index) => ({
                position: desc.position || index + 1,
                descripcion: desc.descripcion,
                image: req.files.find((file) => file.fieldname === `description-${index}`)
                    ? req.files.find((file) => file.fieldname === `description-${index}`).path
                    : desc.image || null,
            }));
        }

        // --- Procesar tratamientos ---
        let parsedTreatments = [];
        if (treatments) {
            if (typeof treatments === 'string') {
                parsedTreatments = JSON.parse(treatments);
            } else if (Array.isArray(treatments)) {
                parsedTreatments = treatments;
            }

            parsedTreatments = parsedTreatments.map((treatment, treatmentIndex) => ({
                name: treatment.name,
                descriptions: treatment.descriptions.map((desc, descIndex) => ({
                    position: desc.position || descIndex + 1,
                    descripcion: desc.descripcion,
                    image: req.files.find((file) => file.fieldname === `treatment-${treatmentIndex}-${descIndex}`)
                        ? req.files.find((file) => file.fieldname === `treatment-${treatmentIndex}-${descIndex}`).path
                        : desc.image || null,
                })),
            }));
        }

        // --- Actualizar enfermedad ---
        const updatedDisease = await Disease.findByIdAndUpdate(
            id,
            {
                name,
                resume,
                descriptions: parsedDescriptions,
                treatments: parsedTreatments,
            },
            { new: true }
        );

        if (!updatedDisease) {
            return res.status(404).json({ error: 'Enfermedad no encontrada.' });
        }

        res.status(200).json({ message: 'Enfermedad actualizada con éxito.', updatedDisease });
    } catch (error) {
        console.error('Error al actualizar la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al actualizar la enfermedad.' });
    }
});





router.delete('/diseases/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDisease = await Disease.findByIdAndDelete(id);
        if (!deletedDisease) {
            return res.status(404).json({ error: 'Enfermedad no encontrada.' });
        }
        res.status(200).json({ message: 'Enfermedad eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar la enfermedad:', error);
        res.status(500).json({ error: 'Hubo un problema al eliminar la enfermedad.' });
    }
});

router.get('/users/:userId/diseases', async (req, res) => {
    const { userId } = req.params;

    try {
        const diseases = await Disease.find({ doctorCreador: userId });
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Error al obtener enfermedades del usuario:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades del usuario.' });
    }
});

// Obtener enfermedades pendientes del doctor autenticado
router.get('/users/:userId/diseases/pending', async (req, res) => {
    const { userId } = req.params;

    try {
        const diseases = await Disease.find({ doctorCreador: userId, status: 'pending' });
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Error al obtener enfermedades pendientes:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades pendientes.' });
    }
});

// Obtener enfermedades aprobadas del doctor autenticado
router.get('/users/:userId/diseases/approved', async (req, res) => {
    const { userId } = req.params;

    try {
        const diseases = await Disease.find({ doctorCreador: userId, status: 'approved' });
        res.status(200).json(diseases);
    } catch (error) {
        console.error('Error al obtener enfermedades aprobadas:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener las enfermedades aprobadas.' });
    }      
});


router.post('/users/patient', async (req, res) => {
    const { name, email, password, disease, treatment } = req.body;

    if (!name || !email || !password || !disease || !treatment) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar que la enfermedad exista
        const selectedDisease = await Disease.findById(disease);
        if (!selectedDisease) {
            return res.status(404).json({ error: 'La enfermedad seleccionada no existe.' });
        }

        // Verificar que el tratamiento exista en la enfermedad seleccionada
        const selectedTreatment = selectedDisease.treatments.id(treatment);
        if (!selectedTreatment) {
            return res.status(404).json({ error: 'El tratamiento seleccionado no existe en la enfermedad.' });
        }

        // Obtener el doctor (puedes ajustarlo para obtenerlo de un token o sesión)
        const doctorId = req.user._id; // Asegúrate de tener el doctor autenticado

        // Crear nuevo paciente
        const newPatient = new Patient({
            name,
            email,
            password,
            doctor: doctorId,
            disease,
            treatment,
        });

        await newPatient.save();
        res.status(201).json({ message: 'Paciente creado con éxito.', newPatient });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        res.status(500).json({ error: 'Hubo un problema al crear el paciente.' });
    }
});

module.exports = router;
