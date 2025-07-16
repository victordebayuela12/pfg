const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
require('dotenv').config();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });



exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("🔍 Petición recibida para:", email); 

  let user = await User.findOne({ email });
  let model = 'User';

  if (!user) {
    user = await Patient.findOne({ email });
    model = user ? 'Patient' : null;
  }

  if (!user || !model)
    return res.status(404).json({ message: 'No existe una cuenta con ese email.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000;

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&type=${model.toLowerCase()}`;

  console.log("🔗 Enlace de recuperación:", resetUrl);



  const mailOptions = {
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetUrl}">${resetUrl}</a>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(" Error al enviar el correo:", err); 
      return res.status(500).json({ message: 'Error al enviar el correo', error: err.message });
    }
    console.log(" Correo enviado:", info.response);
    res.json({ message: 'Correo enviado correctamente' });
  });
};



exports.resetPassword = async (req, res) => {
  const { token, newPassword, type } = req.body;

  const Model = type === 'patient' ? Patient : User;

  const user = await Model.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Contraseña actualizada correctamente' });
};


exports.sendDoctorApprovedEmail = async (email, name) => {
  const mailOptions = {
    to: email,
    subject: '✔️ Alta aprobada en la plataforma',
    html: `
      <h2>Hola Dr/a. ${name}</h2>
      <p>Tu cuenta ha sido aprobada con éxito. Ya puedes iniciar sesión en la plataforma con tu correo electrónico.</p>
      <p>¡Gracias por unirte!</p>
    `
  };

  return transporter.sendMail(mailOptions);
};


exports.sendPasswordEmail = async (to, name, password) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Plataforma de salud" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Datos de acceso a la plataforma',
        text: `Hola ${name},\n\nTu cuenta ha sido registrada correctamente.\n\nTu contraseña de acceso es: ${password}\n\nPor favor, inicia sesión y cambia tu contraseña cuanto antes.\n\nUn saludo,\nEl equipo médico.`
    };

    await transporter.sendMail(mailOptions);
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with email:", email);

    let user = await User.findOne({ email });

    if (user) {
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Cuenta pendiente de aprobación.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Comparando contraseña para usuario:", isMatch);

      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      return res.status(200).json({
        message: 'Inicio de sesión exitoso.',
        token,
        role: user.role,
        userId: user._id.toString()
      });
    }

    console.log("No encontrado en User, buscando en Patient...");
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    console.log("Comparando contraseña para paciente:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

  
    const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("Login exitoso como paciente ✅");
console.log("ID del paciente:", patient._id.toString());
console.log("Token generado:", token);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      role: 'patient',
      userId: patient._id.toString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión.", error });
  }
};


exports.changePasswordWithSession = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user_id;

  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual no es correcta.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};