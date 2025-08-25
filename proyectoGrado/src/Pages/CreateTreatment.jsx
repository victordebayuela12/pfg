import React, { useState } from "react";
import axios from "axios";
import "./CreateTreatment.css";
import { calcularIFSZ, interpretarIFSZ } from "../Utils/IFSZ";

function CreateTreatment() {
  const [formData, setFormData] = useState({
    name: "",
    benefits: "",
    risks: "",
    descriptions: [],
  });
  const [descriptionInput, setDescriptionInput] = useState("");
  const [descriptionImage, setDescriptionImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleRemoveDescription = (index) => {
    setFormData((prev) => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("jwtToken");
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("benefits", formData.benefits);
    formDataToSend.append("risks", formData.risks);

    for (let index = 0; index < formData.descriptions.length; index++) {
      const desc = formData.descriptions[index];
      formDataToSend.append(`descriptions[${index}][descripcion]`, desc.descripcion);

      if (desc.image instanceof File) {
        const resizedImage = await resizeImage(desc.image);
        formDataToSend.append(`description-${index}`, resizedImage);
      }
    }

    try {
      await axios.post("http://localhost:5000/api/treatments/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("✅ Tratamiento creado con éxito y pendiente de aprobación.");
      setFormData({ name: "", benefits: "", risks: "", descriptions: [] });
    } catch (err) {
      console.error("Error al crear el tratamiento:", err);
      setError("❌ Hubo un problema al crear el tratamiento.");
    }
  };

  return (
    <div className="create-treatment-container">
      <div className="create-treatment-box">
        <h1>Crear Tratamiento</h1>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form className="treatment-form" onSubmit={handleSubmit}>
          <h3>Información General</h3>
          <input
            type="text"
            name="name"
            placeholder="Nombre del Tratamiento"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="benefits"
            placeholder="Beneficios del Tratamiento"
            value={formData.benefits}
            onChange={handleInputChange}
            required
          />
           {formData.benefits.trim() && (() => {
        const score = calcularIFSZ(formData.benefits);
        const { grado, color } = interpretarIFSZ(score);
        return (
          <p>
            <strong>IFSZ de beneficios:</strong>{" "}
            <span style={{ color, fontWeight: "bold" }}>
              {score.toFixed(2)} ({grado})
            </span>
          </p>
        );
      })()}
          <textarea
            name="risks"
            placeholder="Riesgos del Tratamiento"
            value={formData.risks}
            onChange={handleInputChange}
            required
          />
          {formData.risks.trim() && (() => {
                  const score = calcularIFSZ(formData.risks);
                  const { grado, color } = interpretarIFSZ(score);
                  return (
                    <p>
                      <strong>IFSZ de riesgos:</strong>{" "}
                      <span style={{ color, fontWeight: "bold" }}>
                        {score.toFixed(2)} ({grado})
                      </span>
                    </p>
                  );
                })()}
          <h3>Añadir Descripciones</h3>
          <textarea
  placeholder="Descripción detallada (máx. 255 caracteres)"
  value={descriptionInput}
  onChange={(e) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setDescriptionInput(value);
    }
  }}
  className="textarea-large"
/>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDescriptionImage(e.target.files[0])}
            className="input-file"
          />
          <button type="button" className="button-modern" onClick={handleAddDescription}>
            Añadir Descripción
          </button>

          {formData.descriptions.map((desc, index) => {
            const score = calcularIFSZ(desc.descripcion);
            const { grado, color } = interpretarIFSZ(score);
            return (
              <div key={index} className="description-box">
                <p>{desc.descripcion}</p>
                {desc.image && <img src={URL.createObjectURL(desc.image)} alt="Descripción" />}
                <p>
                  <strong>IFSZ:</strong>{" "}
                  <span style={{ color, fontWeight: "bold" }}>
                    {score.toFixed(2)} ({grado})
                  </span>
                </p>
                <button type="button" onClick={() => handleRemoveDescription(index)}>
                  
                </button>
              </div>
            );
          })}

          {formData.descriptions.length > 0 && (() => {
            const textoTotal = formData.descriptions.map((d) => d.descripcion).join(" ");
            const scoreTotal = calcularIFSZ(textoTotal);
            const { grado, color } = interpretarIFSZ(scoreTotal);
            return (
              <div style={{ marginTop: "15px" }}>
                <h4>IFSZ total del tratamiento:</h4>
                <p>
                  <span style={{ color, fontWeight: "bold" }}>
                    {scoreTotal.toFixed(2)} ({grado})
                  </span>
                </p>
              </div>
            );
          })()}

          <button type="submit" className="button-modern button-large">
            Guardar Tratamiento
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTreatment;
