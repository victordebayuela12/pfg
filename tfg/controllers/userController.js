const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendDoctorApprovedEmail} = require('./authController');
// Registrar un nuevo usuario (Admin o Doctor)
exports.registerUser = async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya está registrado." });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            surname,
            email,
            password: hashedPassword,
            role,
            status: 'pending'
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado con éxito, pendiente de aprobación.", newUser });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar usuario.", error });
    }
};

// Iniciar sesión (Admin y Doctor)
/*exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Cuenta pendiente de aprobación.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Inicio de sesión exitoso.', token, role: user.role, userId: user._id.toString() });
    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión.", error });
    }
};*/

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios.", error });
    }
};

// Aprobar o rechazar un usuario

exports.approveOrRejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // ✅ Si fue aprobado, enviar el email
    if (status === 'approved') {
      try {
        await sendDoctorApprovedEmail(updatedUser.email, updatedUser.name);
        console.log(`📧 Correo enviado a ${updatedUser.email}`);
      } catch (err) {
        console.error('❌ Error al enviar correo de aprobación:', err.message);
        // Si lo deseas, puedes seguir sin cortar la respuesta al frontend
      }
    }

    res.status(200).json({ message: `Usuario ${status} con éxito.`, updatedUser });
  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ message: "Error al cambiar el estado del usuario.", error });
  }
};
// Obtener doctores por estado
exports.getPendingDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', status: 'pending' });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener médicos pendientes.", error });
    }
};

exports.getApprovedDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', status: 'approved' });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener médicos aprobados.", error });
    }
};

exports.getRejectedDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', status: 'rejected' });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener médicos rechazados.", error });
    }
};

// Eliminar un doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Médico eliminado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar médico.", error });
    }
};

exports.getAuthenticatedUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};