const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendDoctorApprovedEmail} = require('./authController');

exports.registerUser = async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body;

      
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya está registrado." });
        }

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


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios.", error });
    }
};


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

    if (status === 'approved') {
      try {
        await sendDoctorApprovedEmail(updatedUser.email, updatedUser.name);
        console.log(`📧 Correo enviado a ${updatedUser.email}`);
      } catch (err) {
        console.error('❌ Error al enviar correo de aprobación:', err.message);

      }
    }

    res.status(200).json({ message: `Usuario ${status} con éxito.`, updatedUser });
  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ message: "Error al cambiar el estado del usuario.", error });
  }
};

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

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Uusario eliminado con éxito.' });
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