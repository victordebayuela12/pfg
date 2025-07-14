import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreatePatient.css";

function CreatePatient() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        selectedDisease: "",
        selectedTreatments: []
    });

    const [allDiseases, setAllDiseases] = useState([]);
    const [allTreatments, setAllTreatments] = useState([]);
    const [filteredTreatments, setFilteredTreatments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDiseaseModal, setShowDiseaseModal] = useState(false);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [selectedTreatmentDetails, setSelectedTreatmentDetails] = useState(null);

    useEffect(() => {
        fetchDiseases();
    }, []);

const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const fetchDiseases = async () => {
    try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get("http://localhost:5000/api/diseases", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const diseasesWithVersion = response.data.filter(d => d.version_aprobada);
        setAllDiseases(diseasesWithVersion);
    } catch (err) {
        console.error("❌ Error al obtener enfermedades:", err);
    }
};

// ✅ handleSelectDisease modificado para usar treatments directamente
const handleSelectDisease = async (diseaseId) => {
    setFormData(prev => ({
        ...prev,
        selectedDisease: diseaseId,
        selectedTreatments: []
    }));
    setShowDiseaseModal(false);

    try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(`http://localhost:5000/api/diseases/${diseaseId}/treatments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const treatments = response.data;
        setFilteredTreatments(treatments);
        setAllTreatments(treatments);
    } catch (err) {
        console.error("❌ Error al obtener tratamientos:", err);
    }
};

    

    // Manejar búsqueda de tratamientos
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredTreatments(
            allTreatments.filter(treatment =>
                treatment.name.toLowerCase().includes(query)
            )
        );
    };

    // Manejar selección/deselección de tratamientos
    const handleSelectTreatment = (treatmentId) => {
        setFormData(prev => {
            const isSelected = prev.selectedTreatments.includes(treatmentId);
            return {
                ...prev,
                selectedTreatments: isSelected
                    ? prev.selectedTreatments.filter(id => id !== treatmentId)
                    : [...prev.selectedTreatments, treatmentId]
            };
        });
    };

    // Manejar vista previa del tratamiento
    const handlePreviewTreatment = (treatmentId) => {
        const treatment = allTreatments.find(t => t._id === treatmentId);
        if (treatment) {
            setSelectedTreatmentDetails(treatment);
        }
    };

    const closePreviewModal = () => {
        setSelectedTreatmentDetails(null);
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("jwtToken");
        const doctorId = localStorage.getItem("userId");
        const generatedPassword = generateRandomPassword(); 
        if (!doctorId) {
            alert("No se encontró el ID del doctor en localStorage.");
            return;
        }

        const formDataToSend = {
            name: formData.name,
            email: formData.email,
            password: generatedPassword,
            doctor: doctorId,
            disease: formData.selectedDisease,
            treatments: formData.selectedTreatments
            
        };

        try {
            await axios.post("http://localhost:5000/api/patients/register", formDataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Paciente creado con éxito.");
        } catch (err) {
            console.error("Error al crear el paciente:", err);
            alert("Hubo un problema al crear el paciente.");
        }
    };

return (
  <center>
    <div className="create-patient-container">
      <div className="create-patient-box">
        <h1>Crear Paciente</h1>
        <p>Formulario de creación de paciente</p>

        <form className="patient-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre del Paciente"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email del Paciente"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <button
            type="button"
            onClick={() => setShowDiseaseModal(true)}
            className="button-uniform"
          >
            Seleccionar Enfermedad
          </button>

          {formData.selectedDisease && (
            <p>
              Enfermedad seleccionada:{' '}
              {
                allDiseases.find((d) => d._id === formData.selectedDisease)
                  ?.name
              }
            </p>
          )}

          {formData.selectedDisease && (
            <button
              type="button"
              onClick={() => setShowTreatmentModal(true)}
              className="button-uniform"
            >
              Seleccionar Tratamientos
            </button>
          )}

          {formData.selectedDisease &&
            formData.selectedTreatments.length > 0 && (
              <>
                <table className="treatment-table">
                  <thead>
                    <tr>
                      <th>Tratamiento</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.selectedTreatments.map((treatmentId) => {
                      const treatment = allTreatments.find(
                        (t) => t._id === treatmentId
                      );
                      return treatment ? (
                        <tr key={treatment._id}>
                          <td
                            className="treatment-name"
                            onClick={() =>
                              handlePreviewTreatment(treatment._id)
                            }
                          >
                            {treatment.name}
                          </td>
                          <td>
                            <button
                              className="remove-treatment"
                              onClick={() =>
                                handleSelectTreatment(treatment._id)
                              }
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>

                <button type="submit" className="button-large">
                  Crear Paciente
                </button>
              </>
            )}
        </form>
      </div>

            {/* Modal de selección de enfermedades */}
            {showDiseaseModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Seleccionar Enfermedad</h2>
                        {allDiseases.map((disease) => (
                            <p key={disease._id} className="disease-item" onClick={() => handleSelectDisease(disease._id)}>
                                {disease.name}
                            </p>
                        ))}
                        <button className="button-close" onClick={() => setShowDiseaseModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal de selección de tratamientos */}
            {showTreatmentModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Seleccionar Tratamientos</h2>
                        <input type="text" placeholder="Buscar tratamiento..." value={searchQuery} onChange={handleSearch} />

                        <div className="treatment-list">
                        {filteredTreatments.map((treatment) => (
  <div key={treatment._id} className="treatment-item">
    <p className="treatment-name" onClick={() => handlePreviewTreatment(treatment._id)}>
      {treatment.name}
    </p>
    <button
      className="select-treatment-btn"
      onClick={() => handleSelectTreatment(treatment._id)}
    >
      {formData.selectedTreatments.includes(treatment._id) ? "Quitar" : "Añadir"}
    </button>
  </div>
))}


                        </div>

                        <button className="button-close" onClick={() => setShowTreatmentModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal de vista previa de tratamientos */}
            {selectedTreatmentDetails && (
  <div className="modal-overlay">
    <div className="preview-modal">
      <h2>{selectedTreatmentDetails.name}</h2>

      <div className="preview-section">
        <h4>📄 Descripciones</h4>
        {selectedTreatmentDetails.descriptions.map((desc, index) => (
          <div key={index} className="preview-card">
            <p>{desc.descripcion}</p>
            {desc.image && <img src={desc.image} alt="Descripción" />}
          </div>
        ))}
      </div>

      <div className="preview-section">
        <h4>✅ Beneficios</h4>
        <p>{selectedTreatmentDetails.benefits}</p>
      </div>

      <div className="preview-section">
        <h4>⚠️ Riesgos</h4>
        <p>{selectedTreatmentDetails.risks}</p>
      </div>

      <button className="button-close" onClick={closePreviewModal}>
        Cerrar
      </button>
    </div>
  </div>
)}

        </div></center>
    );
}

export default CreatePatient;
