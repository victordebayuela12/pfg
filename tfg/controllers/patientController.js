const Patient = require('../models/Patient');
const User = require('../models/User');
const Disease = require('../models/Disease');
const Treatment = require('../models/Treatment');
const DiseaseVersion = require('../models/DiseaseVersion');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer= require('nodemailer');
const {sendPasswordEmail} = require('./authController');


exports.getFullUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("User ID recibido:", userId);

    const patient = await Patient.findById(userId)
      .populate({
        path: "disease",
        populate: {
          path: "version_aprobada",
          populate: {
            path: "treatments"
          }
        }
      })
      .populate("treatments");

    if (!patient) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const version = patient.disease?.version_aprobada;

    res.json({
      name: patient.name,
      disease: patient.disease?.name,
      resumen: version?.resume,
      descripciones: version?.descriptions || [],
      tratamientos: patient.treatments.map((t) => ({
        name: t.name,
        tdescriptions: t.descriptions,
        benefits: t.benefits,
        risks: t.risks
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};


exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user_id;

    if (!doctorId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const patients = await Patient.find({ doctor: doctorId })
      .populate({
        path: 'disease',
        populate: {
          path: 'version_aprobada',
          model: 'DiseaseVersion'
        }
      })
      .populate('treatments');

    res.json(patients);
  } catch (error) {
    console.error("🔥 Error en getMyPatients:", error);
    res.status(500).json({ message: 'Error al obtener tus pacientes' });
  }
};


exports.registerPatient = async (req, res) => {
    try {
        const { name, email, password, doctor, disease, treatments } = req.body;

        const validatePatientData = async () => {
            const existingDoctor = await User.findOne({ _id: doctor, role: 'doctor', status: 'approved' });
            if (!existingDoctor) throw { status: 403, message: "Solo doctores aprobados pueden registrar pacientes." };

            const existingDisease = await Disease.findById(disease);
            if (!existingDisease) throw { status: 404, message: "La enfermedad no existe." };

            const existingTreatments = await Treatment.find({ _id: { $in: treatments } });
            if (existingTreatments.length !== treatments.length) {
                throw { status: 404, message: "Uno o más tratamientos no existen." };
            }
        };


        await validatePatientData();

     
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPatient = new Patient({
            name,
            email,
            password: hashedPassword,
            doctor,
            disease,
            treatments
        });
        await newPatient.save();

        await sendPasswordEmail(email,name,password);

        res.status(201).json({
            message: "Paciente registrado con éxito y contraseña enviada por correo.",
            newPatient
        });

    } catch (error) {
        console.error("❌ Error en registerPatient:", error);
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error al registrar paciente.",
            error
        });
    }
};


exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ error: 'Paciente no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      role: 'patient',
      userId: patient._id.toString()
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión como paciente.', error });
  }
};

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().populate('doctor', 'name1 surname1 email')
                                          .populate('disease', 'name')
                                          .populate('treatment', 'name');

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los pacientes.", error });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id)
                                     .populate('doctor', 'name1 surname1 email')
                                     .populate('disease', 'name')
                                     .populate('treatment', 'name');

        if (!patient) {
            return res.status(404).json({ message: "Paciente no encontrado." });
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el paciente.", error });
    }
};


exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPatient = await Patient.findByIdAndDelete(id);
        if (!deletedPatient) {
            return res.status(404).json({ message: "Paciente no encontrado." });
        }

        res.status(200).json({ message: "Paciente eliminado con éxito." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el paciente.", error });
    }
};

