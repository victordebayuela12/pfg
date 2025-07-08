import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditDisease.css"; // reutilizamos los estilos

function EditRejectedDisease() {
    const { id } = useParams(); // ID de la versión rechazada
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        resume: "",
        descriptions: [],
        selectedTreatments: [],
    });

    const [descriptionInput, setDescriptionInput] = useState("");
    const [descriptionImage, setDescriptionImage] = useState(null);
    const [allTreatments, setAllTreatments] = useState([]);
    const [filteredTreatments, setFilteredTreatments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedTreatmentDetails, setSelectedTreatmentDetails] = useState(null);

    // Cargar tratamientos
    const fetchTreatments = async () => {
        const token = localStorage.getItem("jwtToken");
        const headers = { Authorization: `Bearer ${token}` };
        const approved = await axios.get("http://localhost:5000/api/treatments/state?status=approved", { headers });
        const pending = await axios.get("http://localhost:5000/api/treatments/state?status=pending", { headers });
        const treatments = [...approved.data, ...pending.data];
        setAllTreatments(treatments);
        setFilteredTreatments(treatments);
    };
    const resizeImage = (file, maxWidth = 800, maxHeight = 600) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
            img.src = e.target.result;
            };

            img.onload = () => {
            const { width, height } = img;

            if (width <= maxWidth && height <= maxHeight) {
                return resolve(file); // No redimensionar si es pequeña
            }

            const scale = Math.min(maxWidth / width, maxHeight / height);
            const newWidth = width * scale;
            const newHeight = height * scale;

            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob((blob) => {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.8); // calidad 80%
            };

            reader.readAsDataURL(file);
        });
        };

    // Cargar datos de la versión rechazada
    const fetchVersion = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const { data } = await axios.get(`http://localhost:5000/api/diseaseVersions/version/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormData({
                name: data.disease.name,
                resume: data.resume,
                descriptions: data.descriptions.map(d => ({
                descripcion: d.descripcion,
                image: d.image || null // ← guardar la URL si existe
                })),

                selectedTreatments: data.treatments.map(t => t._id),
            });

        } catch (err) {
            console.error("❌ Error al cargar versión:", err);
            alert("No se pudo cargar la versión.");
        }
    };

    useEffect(() => {
        fetchTreatments();
        fetchVersion();
    }, []);

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

    const handleAddDescription = () => {
        if (descriptionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                descriptions: [...prev.descriptions, { descripcion: descriptionInput, image: descriptionImage }]
            }));
            setDescriptionInput("");
            setDescriptionImage(null);
        }
    };

    const handleRemoveDescription = (index) => {
        setFormData(prev => ({
            ...prev,
            descriptions: prev.descriptions.filter((_, i) => i !== index)
        }));
    };
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("jwtToken");

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("resume", formData.resume);

    // 🟢 Añadir tratamientos

      formDataToSend.append("treatments", JSON.stringify(formData.selectedTreatments));


    // 🟢 Añadir descripciones
   const descriptionsToSend = [];

for (let i = 0; i < formData.descriptions.length; i++) {
  const desc = formData.descriptions[i];
  const entry = { descripcion: desc.descripcion };
  
  if (desc.image instanceof File) {
    const resizedImage = await resizeImage(desc.image);
    formDataToSend.append(`description-${i}`, resizedImage);
    entry.image = `__upload__`; // marcador para que el backend use el archivo
  } else if (typeof desc.image === 'string') {
    entry.image = desc.image; // imagen vieja
  }

  descriptionsToSend.push(entry);
}

formDataToSend.append("descriptions", JSON.stringify(descriptionsToSend));


    await axios.put(`http://localhost:5000/api/diseaseVersions/${id}/edit`, formDataToSend, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("Versión editada y reenviada con éxito");
    navigate("/myDiseasesDashboard");

  } catch (error) {
    console.error("❌ Error al reenviar la versión:", error);
    alert("Error al editar la versión.");
  }
};


    return (
        <div className="edit-disease-container">
            <div className="edit-disease-box">
                <h1>Editar Versión Rechazada</h1>

                <form className="disease-form" onSubmit={handleSubmit}>
                    <input type="text" value={formData.name} disabled />
                    <textarea
                        name="resume"
                        placeholder="Resumen"
                        value={formData.resume}
                        onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                        required
                    ></textarea>

                    <h3>Descripciones</h3>
                    <textarea
                        placeholder="Nueva descripción"
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                    ></textarea>
                    <input type="file" accept="image/*" onChange={(e) => setDescriptionImage(e.target.files[0])} />
                    <h3>📸 Añadir Descripciones</h3>

<textarea
  placeholder="Descripción detallada"
  value={descriptionInput}
  onChange={(e) => setDescriptionInput(e.target.value)}
  className="textarea-large"
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) => setDescriptionImage(e.target.files[0])}
  className="input-file"
/>

<button
  type="button"
  className="button-modern"
  onClick={handleAddDescription}
>
  ➕ Añadir Descripción
</button>

<div className="description-container">
  {formData.descriptions.map((desc, index) =>
    desc._markedForDeletion ? null : (
      <div key={index} className="description-box">
        <p style={{ marginBottom: '10px' }}>{desc.descripcion}</p>
        {desc.image && (
          <img
            src={
              desc.image instanceof File
                ? URL.createObjectURL(desc.image)
                : desc.image
            }
            alt="desc"
          />
        )}
        <button
          type="button"
          className="button-delete"
          onClick={() => handleRemoveDescription(index)}
        >
          🗑️
        </button>
      </div>
    )
  )}
</div>


                    <button type="button" className="button-treatments" onClick={() => setShowModal(true)}>Seleccionar Tratamientos</button>

                    <div className="treatment-container">
                        {formData.selectedTreatments.map(id => {
                            const t = allTreatments.find(t => t._id === id);
                            return t ? (
                                <div key={id} className="treatment-selected">
                                    <p onClick={() => setSelectedTreatmentDetails(t)}>{t.name}</p>
                                    <button onClick={() => handleSelectTreatment(id)}>×</button>
                                </div>
                            ) : null;
                        })}
                    </div>

                    <button type="submit" className="button-large">Guardar Cambios</button>
                </form>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Seleccionar Tratamientos</h2>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setFilteredTreatments(
                                    allTreatments.filter(t =>
                                        t.name.toLowerCase().includes(e.target.value.toLowerCase())
                                    )
                                );
                            }}
                        />
                        <div className="treatment-list">
                            {filteredTreatments.map(t => (
                                <div key={t._id} className="treatment-item">
                                    <p onClick={() => setSelectedTreatmentDetails(t)}>{t.name}</p>
                                    <button
                    className={`select-treatment-btn ${
                      formData.selectedTreatments.includes(t._id) ? "added" : ""
                    }`}
                                        onClick={() => handleSelectTreatment(t._id)}>
                                        
                                        {formData.selectedTreatments.includes(t._id) ? "Quitar" : "Añadir"}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {selectedTreatmentDetails && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{selectedTreatmentDetails.name}</h2>
                        <p><strong>Beneficios:</strong> {selectedTreatmentDetails.benefits}</p>
                        <p><strong>Riesgos:</strong> {selectedTreatmentDetails.risks}</p>
                        <button onClick={() => setSelectedTreatmentDetails(null)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditRejectedDisease;
