import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateDisease.css";
import { calcularIFSZ, interpretarIFSZ } from "../Utils/IFSZ";

function CreateDisease() {
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
  const [existingDiseases, setExistingDiseases] = useState([]);
  const [diseaseExists, setDiseaseExists] = useState(null);
  const [diseaseList, setDiseaseList] = useState([]);

  const closePreviewModal = () => setSelectedTreatmentDetails(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwtToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [tApproved, tPending, dAll] = await Promise.all([
          axios.get("http://localhost:5000/api/treatments/state?status=approved", config),
          axios.get("http://localhost:5000/api/treatments/state?status=pending", config),
          axios.get("http://localhost:5000/api/diseases", config),
        ]);
        const treatments = [...tApproved.data, ...tPending.data];
        setAllTreatments(treatments);
        setFilteredTreatments(treatments);
        setExistingDiseases(dAll.data);
        setDiseaseList(dAll.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, []);

  const resizeImage = (file, maxWidth = 800, maxHeight = 600) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const { width, height } = img;
        if (width <= maxWidth && height <= maxHeight) return resolve(file);

        const scale = Math.min(maxWidth / width, maxHeight / height);
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.8);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredTreatments(allTreatments.filter((t) => t.name.toLowerCase().includes(query)));
  };

  const handleAddDescription = () => {
    if (descriptionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        descriptions: [...prev.descriptions, { descripcion: descriptionInput, image: descriptionImage }],
      }));
      setDescriptionInput("");
      setDescriptionImage(null);
    }
  };

  const handleSelectTreatment = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedTreatments: prev.selectedTreatments.includes(id)
        ? prev.selectedTreatments.filter((tId) => tId !== id)
        : [...prev.selectedTreatments, id],
    }));
  };

  const handlePreviewTreatment = (treatmentId) => {
    const treatment = allTreatments.find((t) => t._id === treatmentId);
    treatment ? setSelectedTreatmentDetails(treatment) : console.warn("❌ Tratamiento no encontrado:", treatmentId);
  };

  const checkIfDiseaseExists = (name) => {
    if (!name.trim()) return setDiseaseExists(null);
    const match = existingDiseases.find((d) => d.name.toLowerCase() === name.trim().toLowerCase());
    setDiseaseExists(!!match);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    const doctorId = localStorage.getItem("userId");
    if (!doctorId) return alert("No se encontró el ID del doctor.");

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const diseasesRes = await axios.get("http://localhost:5000/api/diseases", config);
      let disease = diseasesRes.data.find((d) => d.name.toLowerCase() === formData.name.trim().toLowerCase());

      if (!disease) {
        const res = await axios.post("http://localhost:5000/api/diseases", { name: formData.name }, config);
        disease = res.data;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("diseaseId", disease._id);
      formDataToSend.append("resume", formData.resume);
      formData.selectedTreatments.forEach((id, i) => formDataToSend.append(`treatments[${i}]`, id));

      for (let i = 0; i < formData.descriptions.length; i++) {
        const desc = formData.descriptions[i];
        formDataToSend.append(`descriptions[${i}][descripcion]`, desc.descripcion);

        if (desc.image instanceof File) {
          const resizedImage = await resizeImage(desc.image);
          formDataToSend.append(`description-${i}`, resizedImage);
        }
      }

      await axios.post("http://localhost:5000/api/diseaseVersions/", formDataToSend, config);
      alert("Versión de enfermedad creada con éxito.");
      setFormData({ name: "", resume: "", descriptions: [], selectedTreatments: [] });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Hubo un problema al crear la enfermedad.");
    }
  };
return (
  <div className="create-disease-container">
    <div className="create-disease-box">
      <h1>Crear Enfermedad</h1>
      <form className="disease-form" onSubmit={handleSubmit}>
        {/* Nombre de la enfermedad */}
        <input
  type="text"
  name="name"
  placeholder="Nombre de la Enfermedad"
  list="diseaseSuggestions"
  autoComplete="on"
  value={formData.name}
  onChange={(e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name }));
    checkIfDiseaseExists(name);
  }}
  required
/>
        <datalist id="diseaseSuggestions">
          {diseaseList.map((d) => (
            <option key={d._id} value={d.name} />
          ))}
        </datalist>
        {diseaseExists !== null && (
          <p className={`status-message ${diseaseExists ? "existing" : "new"}`}>
            {diseaseExists ? "✔ Enfermedad existente" : "➕ Se creará una nueva enfermedad"}
          </p>
        )}

        {/* Resumen */}
        <textarea
          name="resume"
          placeholder="Resumen"
          value={formData.resume}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, resume: e.target.value }))
          }
          required
        />

        {/* Añadir descripción */}
        <h3>Descripciones</h3>
        <textarea
          placeholder="Descripción"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
        />
        <input
          type="file"
          className="input-file"
          accept="image/*"
          onChange={(e) => setDescriptionImage(e.target.files[0])}
        />
        <button type="button" className="button-secondary" onClick={handleAddDescription}>
          Añadir Descripción
        </button>

        {/* Mostrar descripciones añadidas */}
        <div className="description-container">
          {formData.descriptions.map((desc, i) => {
            const score = calcularIFSZ(desc.descripcion);
            const { grado, color } = interpretarIFSZ(score);
            return (
              <div key={i} className="description-box">
                <p>{desc.descripcion}</p>
                {desc.image && <img src={URL.createObjectURL(desc.image)} alt="Descripción" />}
                <p>
                  <strong>IFSZ:</strong>{" "}
                  <span style={{ color, fontWeight: "bold" }}>
                    {score.toFixed(2)} ({grado})
                  </span>
                </p>
                <button
                  className="remove-description"
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      descriptions: prev.descriptions.filter((_, j) => j !== i),
                    }))
                  }
                >
                  
                </button>
              </div>
            );
          })}
        </div>

        {/* IFSZ total */}
        {formData.descriptions.length > 0 && (() => {
          const textoTotal = formData.descriptions.map((d) => d.descripcion).join(" ");
          const score = calcularIFSZ(textoTotal);
          const { grado, color } = interpretarIFSZ(score);
          return (
            <div className="infz-total">
              <h4>IFSZ total del conjunto:</h4>
              <p>
                <span style={{ color, fontWeight: "bold" }}>
                  {score.toFixed(2)} ({grado})
                </span>
              </p>
            </div>
          );
        })()}

        {/* Tratamientos seleccionados */}
        <button type="button" onClick={() => setShowModal(true)} className="button-secondary">
          Seleccionar Tratamientos
        </button>
        <div className="treatment-container">
          {formData.selectedTreatments.map((id) => {
            const t = allTreatments.find((t) => t._id === id);
            if (!t) return null;
            return (
              <div key={id} className="treatment-selected">
                <p className="treatment-name" onClick={() => handlePreviewTreatment(id)}>
                  {t.name} ({t.status === "pending" ? "Pendiente" : "Aprobado"})
                </p>
                <button className="remove-treatment" onClick={() => handleSelectTreatment(id)}>
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <button type="submit" className="button-large">Crear Enfermedad</button>
      </form>
    </div>

    {/* Modal de selección de tratamientos */}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Seleccionar Tratamientos</h2>
          <input
            type="text"
            placeholder="Buscar tratamiento..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="treatment-list">
            {filteredTreatments.map((t) => (
              <div key={t._id} className="treatment-item">
                <p className="treatment-name" onClick={() => handlePreviewTreatment(t._id)}>
                  {t.name} ({t.status === "pending" ? "Pendiente" : "Aprobado"})
                </p>
                <button
                  className={`select-treatment-btn ${formData.selectedTreatments.includes(t._id) ? "added" : ""}`}
                  onClick={() => handleSelectTreatment(t._id)}
                >
                  {formData.selectedTreatments.includes(t._id) ? "Quitar" : "Añadir"}
                </button>
              </div>
            ))}
          </div>
          <button className="button-close" onClick={() => setShowModal(false)}>Cerrar</button>
        </div>
      </div>
    )}

    {/* Modal de vista previa del tratamiento */}
    {selectedTreatmentDetails && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>{selectedTreatmentDetails.name}</h2>
          <p><strong>Beneficios:</strong> {selectedTreatmentDetails.benefits}</p>
          <p><strong>Riesgos:</strong> {selectedTreatmentDetails.risks}</p>
          <h3>Descripciones</h3>
          <div className="description-container">
            {selectedTreatmentDetails.descriptions.length > 0 ? (
              selectedTreatmentDetails.descriptions.map((desc, index) => (
                <div key={index} className="description-box">
                  <p>{desc.descripcion}</p>
                  {desc.image && <img src={desc.image} alt={`Descripción ${index}`} />}
                </div>
              ))
            ) : (
              <p>No hay descripciones disponibles.</p>
            )}
          </div>
          <button className="button-close" onClick={closePreviewModal}>Cerrar</button>
        </div>
      </div>
    )}
  </div>
);
}

export default CreateDisease;
