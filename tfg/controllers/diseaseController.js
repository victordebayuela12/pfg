const Disease = require('../models/Disease');
const DiseaseVersion = require('../models/DiseaseVersion');

exports.createDisease = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio." });
    }

   
    const exists = await Disease.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: "La enfermedad ya existe." });
    }

    const newDisease = new Disease({ name });
    await newDisease.save();

    res.status(201).json(newDisease);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la enfermedad.", error: error.message });
  }
};


exports.getAllDiseases = async (req, res) => {
    try {
      const diseases = await Disease.find().populate({
        path: "version_aprobada",
        strictPopulate: false 
      });
  
      res.status(200).json(diseases);
    } catch (error) {
      console.error("❌ Error en getAllDiseases:", error);
      res.status(500).json({
        message: "Error al obtener enfermedades",
        error: error.message
      });
    }
  };
  


exports.getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findById(id).populate("version_aprobada");
    if (!disease) {
      return res.status(404).json({ message: "Enfermedad no encontrada." });
    }
    res.status(200).json(disease);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la enfermedad.", error: error.message });
  }
};


exports.deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findByIdAndDelete(id);
    if (!disease) {
      return res.status(404).json({ message: "Enfermedad no encontrada." });
    }
    res.status(200).json({ message: "Enfermedad eliminada con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la enfermedad.", error: error.message });
  }
};

exports.updateApprovedVersion = async (req, res) => {
  try {
    const { id } = req.params; 
    const { versionId } = req.body; 

    const disease = await Disease.findById(id);
    if (!disease) {
      return res.status(404).json({ message: "Enfermedad no encontrada." });
    }

    disease.version_aprobada = versionId;
    await disease.save();

    res.status(200).json({ message: "Versión aprobada actualizada.", disease });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la versión aprobada.", error: error.message });
  }
};


exports.getApprovedVersionByDiseaseId = async (req, res) => {
  const { id } = req.params;

  try {
    const disease = await Disease.findById(id)
      .populate({
        path: 'version_aprobada',
        populate: ['treatments', 'doctorCreador']
      });

    if (!disease || !disease.version_aprobada) {
      return res.status(404).json({ message: 'No hay versión aprobada para esta enfermedad.' });
    }

    res.status(200).json(disease.version_aprobada);
  } catch (error) {
    console.error('Error al obtener versión aprobada:', error);
    res.status(500).json({ message: 'Error al buscar la versión aprobada' });
  }
};

exports.getTreatmentsFromApprovedVersion = async (req, res) => {
  try {
      const { diseaseId } = req.params;

      const disease = await Disease.findById(diseaseId).populate('version_aprobada');
      if (!disease || !disease.version_aprobada) {
          return res.status(404).json({ message: "No se encontró una versión aprobada para esta enfermedad." });
      }

      const version = await DiseaseVersion.findById(disease.version_aprobada._id).populate('treatments');
      if (!version) {
          return res.status(404).json({ message: "No se encontró la versión aprobada correspondiente." });
      }

      res.status(200).json(version.treatments);
  } catch (error) {
      console.error("❌ Error al obtener tratamientos de la versión aprobada:", error);
      res.status(500).json({ message: "Error al obtener tratamientos." });
  }
};