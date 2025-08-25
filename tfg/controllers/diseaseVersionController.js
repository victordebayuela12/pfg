const DiseaseVersion = require('../models/DiseaseVersion');
const Disease = require('../models/Disease');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');


// ✅ Asegúrate de tener multer configurado previamente para aceptar múltiples archivos

exports.createDiseaseVersion = async (req, res) => {
  console.log("🧪 Recibido:");
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  console.log("USER ID:", req.user_id);

  try {
    const doctorId = req.user_id;
    const { diseaseId, resume, treatments = [] } = req.body;

    if (!diseaseId || !resume) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const disease = await Disease.findById(diseaseId);
    if (!disease) {
      return res.status(404).json({ message: "La enfermedad no existe." });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Solo los doctores pueden crear versiones de enfermedades." });
    }

    // ✅ Construcción de descripciones
    const descriptions = [];
    let index = 0;
    while (req.body[`descripcion-${index}`] !== undefined) {
      const descripcion = req.body[`descripcion-${index}`];
      const imageFile = req.files?.find(f => f.fieldname === `description-${index}`);
      descriptions.push({
        descripcion,
        image: imageFile?.path || null,
      });
      index++;
    }

    const newVersion = new DiseaseVersion({
      disease: disease._id,
      resume,
      descriptions,
      treatments: Array.isArray(treatments) ? treatments : [treatments],
      doctorCreador: doctorId,
      status: "pending",
    });

    await newVersion.save();

    res.status(201).json({
      message: "Versión de enfermedad creada con éxito.",
      diseaseVersion: newVersion,
    });

  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({
      message: "Error al crear la versión de enfermedad.",
      error: error?.message || String(error),
    });
  }
};


exports.getDiseaseVersions = async (req, res) => {
  try {
    const { disease_id } = req.params;

    const versions = await DiseaseVersion.find({ disease: disease_id })
      .populate('doctorCreador')
      .populate('treatments');

    res.status(200).json(versions);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener versiones de enfermedad" });
  }
};

exports.getDiseaseVersionById = async (req, res) => {
  try {
    const { id } = req.params;

    const version = await DiseaseVersion.findById(id)
      .populate('doctorCreador')
      .populate({ path: 'treatments', populate: { path: 'descriptions' } })
      .populate('disease');

    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }

    res.status(200).json(version);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la versión" });
  }
};


exports.getTreatmentsByDisease = async (req, res) => {
  try {
    const { disease_id } = req.params;

    const diseaseVersion = await DiseaseVersion.findOne({
      disease: disease_id,
      status: "approved"
    }).populate("treatments");

    if (!diseaseVersion) {
      return res.status(404).json({ message: "No se encontró versión aprobada" });
    }

    res.status(200).json(diseaseVersion.treatments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tratamientos" });
  }
};


exports.getDiseaseVersionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const versions = await DiseaseVersion.find({ status })
      .populate('disease')    
      .populate('treatments');   

    res.status(200).json(versions);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener versiones" });
  }
};
exports.changeDiseaseVersionStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const { rejectionComment } = req.body;
    const validStatuses = ['approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const version = await DiseaseVersion.findById(id).populate('treatments');
    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }

    if (status === 'approved') {
      const todosAprobados = version.treatments.every(t => t.status === 'approved');
      if (!todosAprobados) {
        return res.status(400).json({
          message: "No se puede aprobar esta enfermedad. Todos los tratamientos asociados deben estar aprobados."
        });
      }

      version.rejectionComment = "";

      await Disease.findByIdAndUpdate(version.disease, {
        version_aprobada: version._id,
      });

      await DiseaseVersion.updateMany(
        {
          disease: version.disease,
          _id: { $ne: version._id },
          status: 'approved'
        },
        {
          status: 'rejected',
          rejectionComment: 'Reemplazada por una versión más reciente.'
        }
      );
    } else if (status === 'rejected') {
      version.rejectionComment = rejectionComment || "";
    }

    version.status = status;
    await version.save();

    res.status(200).json({ message: `Versión marcada como ${status}`, version });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el estado" });
  }
};


exports.deleteDiseaseVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const version = await DiseaseVersion.findById(id);
    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }

    if (version.status !== 'rejected') {
      return res.status(400).json({ message: "Solo se pueden eliminar versiones rechazadas" });
    }

    await DiseaseVersion.findByIdAndDelete(id);
    res.status(200).json({ message: "Versión eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar versión" });
  }
};

exports.getVersionsByDoctorAndStatus = async (req, res) => {
  try {
    const { doctorId, status } = req.params;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const versions = await DiseaseVersion.find({
      doctorCreador: doctorId,
      status
    }).populate('disease')
    .populate('treatments');

    res.status(200).json(versions);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener versiones del doctor" });
  }
};
exports.editDiseaseVersion = async (req, res) => {
  try {
    const versionId = req.params.id;
    const userId = req.user_id;


    const version = await DiseaseVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }


    if (version.doctorCreador.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para editar esta versión" });
    }

    const { name, resume } = req.body;
    if (!resume || !name) {
      return res.status(400).json({ message: "Faltan datos obligatorios: nombre o resumen" });
    }


    const descriptions = [];
    let index = 0;
    while (req.body[`descripcion-${index}`] !== undefined) {
      let rawDescripcion = req.body[`descripcion-${index}`];


      const descripcion = Array.isArray(rawDescripcion)
        ? rawDescripcion.join(" ")
        : String(rawDescripcion);

      const file = req.files?.find(f => f.fieldname === `description-${index}`);
      const previousImage = req.body[`existing-image-${index}`];

      descriptions.push({
        descripcion,
        image: file?.path || previousImage || null,
      });

      index++;
    }


    let treatmentIds = [];
    try {
      treatmentIds = JSON.parse(req.body.selectedTreatments || "[]");
    } catch (error) {
      console.warn("⚠️ Error al parsear tratamientos:", error);
      treatmentIds = [];
    }

    version.name = name;
    version.resume = resume;
    version.descriptions = descriptions;
    version.treatments = Array.isArray(treatmentIds) ? treatmentIds : [];
    version.status = "pending";

    await version.save();

    return res.status(200).json({
      message: "Versión editada correctamente",
      version,
    });

  } catch (error) {
    console.error("❌ Error al editar la versión:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }
};
