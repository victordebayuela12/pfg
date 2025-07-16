const DiseaseVersion = require('../models/DiseaseVersion');
const Disease = require('../models/Disease');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.createDiseaseVersion = async (req, res) => {
  try {
    const { diseaseId, resume, descriptions, treatments } = req.body;
    const doctorId = req.user_id;

    if (!diseaseId || !resume || !Array.isArray(descriptions)) {
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

    const processedDescriptions = descriptions.map((desc, index) => {
      let imageUrl = null;
      if (req.files && Array.isArray(req.files)) {
        const file = req.files.find(file => file.fieldname === `description-${index}`);
        if (file) imageUrl = file.path;
      }
      return {
        descripcion: desc.descripcion,
        image: imageUrl
      };
    });

    const newVersion = new DiseaseVersion({
      disease: disease._id,
      resume,
      descriptions: processedDescriptions,
      treatments,
      doctorCreador: doctorId,
      status: "pending"
    });

    await newVersion.save();
    res.status(201).json({ message: "Versión de enfermedad creada.", disease, diseaseVersion: newVersion });

  } catch (error) {
    res.status(500).json({ message: "Error al crear la versión de enfermedad" });
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

    const version = await DiseaseVersion.findById(id);
    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }

    version.status = status;

    if (status === 'rejected') {
      version.rejectionComment = rejectionComment || "";
    } else { version.rejectionComment = "";


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
}

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


exports.updateDiseaseVersion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        updates.status = 'pending';

        const updatedVersion = await DiseaseVersion.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedVersion) {
            return res.status(404).json({ message: 'Versión de enfermedad no encontrada' });
        }

        res.json(updatedVersion);
    } catch (err) {
        console.error('Error actualizando la versión:', err);
        res.status(500).json({ message: 'Error al actualizar la versión de enfermedad' });
    }
};

exports.editRejectedDiseaseVersion = async (req, res) => {
  try {
    const versionId = req.params.id;
    const userId = req.user_id;

    const version = await DiseaseVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({ message: "Versión no encontrada" });
    }

    if (version.status !== 'rejected') {
      return res.status(400).json({ message: "Solo se pueden editar versiones rechazadas" });
    }

    if (version.doctorCreador.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para editar esta versión" });
    }


    version.resume = req.body.resume || version.resume;

    const rawDescriptions = JSON.parse(req.body.descriptions || '[]');

    const processedDescriptions = rawDescriptions.map((desc, index) => {
      const file = req.files?.find(f => f.fieldname === `description-${index}`);
      const imageUrl = file?.path || (desc.image !== '__upload__' ? desc.image : null);
      return {
        descripcion: desc.descripcion,
        image: imageUrl
      };
    });

    version.descriptions = processedDescriptions;


const treatmentEntries = Object.keys(req.body)
  .filter(key => key.startsWith('treatments['))
  .map(key => {
    const match = key.match(/treatments\[(\d+)\]/);
    return match ? { index: parseInt(match[1]), value: req.body[key] } : null;
  })
  .filter(Boolean)
  .sort((a, b) => a.index - b.index);
  console.log("Tratamientos enviados:", req.body.treatments);

version.treatments = JSON.parse(req.body.treatments || '[]');


    version.status = 'pending';

    await version.save();

    res.status(200).json({
      message: "Versión editada y reenviada correctamente",
      version
    });

  } catch (error) {
    console.error("❌ Error al editar la versión rechazada:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
