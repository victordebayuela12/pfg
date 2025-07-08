const Treatment = require('../models/Treatment');
const DiseaseVersion = require('../models/DiseaseVersion');
const User = require('../models/User');
const mongoose = require('mongoose');



// 📌 Crear un nuevo tratamiento asociado a una enfermedad
exports.createTreatment = async (req, res) => {
    try { const { name, descriptions, benefits, risks } = req.body; const doctorId = req.user_id; // ⬅️ Obtenido del token (middleware)

        // Validar doctor
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            return res.status(403).json({ message: "Solo los doctores pueden crear tratamientos." });
        }
    
        // Procesar descripciones con imágenes
        let processedDescriptions = [];
        if (descriptions && Array.isArray(descriptions)) {
            processedDescriptions = descriptions.map((desc, index) => {
                let imageUrl = null;
                if (req.files && req.files.length > 0) {
                    const file = req.files.find(f => f.fieldname === `description-${index}`);
                    if (file) imageUrl = file.path;
                }
                return { descripcion: desc.descripcion, image: imageUrl };
            });
        }
    
        const newTreatment = new Treatment({
            name,
            descriptions: processedDescriptions,
            benefits,
            risks,
            doctorCreador: doctorId, // ✅ Nuevo campo
            status: "pending"
        });
    
        await newTreatment.save();
        res.status(201).json({ message: "Tratamiento creado con éxito y pendiente de aprobación.", newTreatment });
    } catch (error) {
        console.error("🔴 Error en createTreatment:", error);
        res.status(500).json({ message: "Error al crear el tratamiento.", error });
    }
}






// 📌 Obtener un tratamiento por ID
exports.getTreatmentById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación de ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de tratamiento no válida." });
        }

        const treatment = await Treatment.findById(id); // 👈 sin populate

        if (!treatment) {
            return res.status(404).json({ message: "Tratamiento no encontrado." });
        }

        res.status(200).json(treatment);
    } catch (error) {
        console.error("❌ Error al obtener tratamiento:", error);
        res.status(500).json({ message: "Error interno al obtener el tratamiento." });
    }
};

// 📌 Modificar un tratamiento
exports.updateTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, descriptions, benefits, risks } = req.body;

    let processedDescriptions = [];

    if (descriptions) {
      const parsed = JSON.parse(descriptions);

      processedDescriptions = parsed.map((desc, index) => {
        const fileField = `description-${index}`;
        const file = req.files?.find(f => f.fieldname === fileField);
        const imageUrl = file?.path || (desc.image !== "__upload__" ? desc.image : null);

        return {
          descripcion: desc.descripcion,
          image: imageUrl,
        };
      });
    }

    const updatedTreatment = await Treatment.findByIdAndUpdate(
      id,
      {
        name,
        benefits,
        risks,
        descriptions: processedDescriptions,
        status: "pending" // ✅ Fuerza revisión si se edita
      },
      { new: true }
    );

    if (!updatedTreatment) {
      return res.status(404).json({ message: "Tratamiento no encontrado." });
    }

    res.status(200).json({ message: "Tratamiento actualizado con éxito.", updatedTreatment });
  } catch (error) {
    console.error("❌ Error al actualizar el tratamiento:", error);
    res.status(500).json({ message: "Error al actualizar el tratamiento.", error });
  }
};



// 📌 Cambiar estado de un tratamiento (admin)
// 📌 Cambiar estado de un tratamiento (admin)
exports.updateTreatmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Estado no válido. Debe ser 'approved', 'rejected' o 'pending'." });
        }

        const updateFields = { status };

        if (status === 'rejected') {
            updateFields.rejectionComment = comment || '';
        } else if (status === 'approved') {
            updateFields.rejectionComment = ''; // Limpiar el comentario si se aprueba
        }

        const treatment = await Treatment.findByIdAndUpdate(id, updateFields, { new: true });

        if (!treatment) {
            return res.status(404).json({ message: "Tratamiento no encontrado." });
        }

        res.status(200).json({ message: `Tratamiento actualizado a ${status}.`, treatment });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado del tratamiento.", error });
    }
};


// 📌 Eliminar un tratamiento
exports.deleteTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTreatment = await Treatment.findByIdAndDelete(id);

        if (!deletedTreatment) {
            return res.status(404).json({ message: "Tratamiento no encontrado." });
        }

        res.status(200).json({ message: "Tratamiento eliminado con éxito." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el tratamiento.", error });
    }
};

exports.getTreatmentsByDoctorAndStatus = async (req, res) => {
    const { doctorId, status } = req.params;
    try {
        const treatments = await Treatment.find({ doctorCreador: doctorId, status });
        res.status(200).json(treatments);
    } catch (error) {
        console.error('Error al obtener tratamientos:', error);
        res.status(500).json({ message: 'Error al obtener los tratamientos' });
    }
};

exports.getTreatmentsByStatus = async (req, res) => {
    const { status } = req.query;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Estado inválido. Usa 'pending', 'approved' o 'rejected'" });
    }

    try {
        let query = { status };

        // Si el usuario no es admin, filtramos por doctor
        if (req.user_role !== 'admin') {
            query.doctorCreador = req.user_id;
        }

        const treatments = await Treatment.find(query);
        res.json(treatments);
    } catch (error) {
        console.error("Error al obtener tratamientos por estado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
