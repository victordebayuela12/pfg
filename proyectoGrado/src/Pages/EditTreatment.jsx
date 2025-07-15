import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./EditTreatment.css";
import { calcularIFSZ, interpretarIFSZ } from "../Utils/IFSZ";
function EditTreatment() {
  const { id } = useParams();
  const token = localStorage.getItem("jwtToken");

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

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/treatments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, benefits, risks, descriptions } = res.data;
        setFormData({
          name,
          benefits,
          risks,
          descriptions: descriptions || [],
        });
      } catch (err) {
        console.error("Error al cargar tratamiento:", err);
        setError("❌ No se pudo cargar el tratamiento.");
      }
    };

    fetchTreatment();
  }, [id, token]);

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
          return resolve(file);
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
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.8);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddDescription = async () => {
    if (descriptionInput.trim()) {
      let finalImage = descriptionImage;

      if (descriptionImage instanceof File) {
        finalImage = await resizeImage(descriptionImage);
      }

      const newDescription = {
        descripcion: descriptionInput,
        image: finalImage,
      };

      setFormData((prev) => ({
        ...prev,
        descriptions: [...prev.descriptions, newDescription],
      }));

      setDescriptionInput("");
      setDescriptionImage(null);
    }
  };

  const handleRemoveDescription = (index) => {
    setFormData((prev) => ({
      ...prev,
      descriptions: prev.descriptions.map((desc, i) =>
        i === index ? { ...desc, _markedForDeletion: true } : desc
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("benefits", formData.benefits);
    formDataToSend.append("risks", formData.risks);

    const descriptionsToSend = [];

    for (let i = 0; i < formData.descriptions.length; i++) {
      const desc = formData.descriptions[i];

      if (desc._markedForDeletion) continue;

      const entry = { descripcion: desc.descripcion };

      if (desc.image instanceof File) {
        const resized = await resizeImage(desc.image);
        formDataToSend.append(`description-${i}`, resized);
        entry.image = "__upload__";
      } else if (typeof desc.image === "string") {
        entry.image = desc.image;
      }

      descriptionsToSend.push(entry);
    }

    formDataToSend.append("descriptions", JSON.stringify(descriptionsToSend));

    try {
      await axios.put(`http://localhost:5000/api/treatments/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("✅ Tratamiento actualizado con éxito.");
    } catch (err) {
      console.error("Error al actualizar tratamiento:", err);
      setError("❌ Hubo un problema al actualizar el tratamiento.");
    }
  };

  return (
    <div className="edit-treatment-container">
      <div className="edit-treatment-box">
        <h1>✏️ Editar Tratamiento</h1>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form className="treatment-form" onSubmit={handleSubmit}>
          <h3>📌 Información General</h3>
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
          ></textarea>
          <textarea
            name="risks"
            placeholder="Riesgos del Tratamiento"
            value={formData.risks}
            onChange={handleInputChange}
            required
          ></textarea>

          <h3>📸 Añadir Descripciones</h3>
          <textarea
            placeholder="Descripción detallada"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            className="textarea-large"
          ></textarea>
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

          {formData.descriptions.map((desc, index) => {
                if (desc._markedForDeletion) return null;
                const score = calcularIFSZ(desc.descripcion);
                const { grado, color } = interpretarIFSZ(score);

                return (
                  <div key={index} className="description-box">
                    <p>{desc.descripcion}</p>
                    {desc.image &&
                      (typeof desc.image === "string" ? (
                        <img src={desc.image} alt="Descripción" />
                      ) : (
                        <img src={URL.createObjectURL(desc.image)} alt="Nueva imagen" />
                      ))}
                    <p>
                      <strong>IFSZ:</strong>{" "}
                      <span style={{ color, fontWeight: "bold" }}>
                        {score.toFixed(2)} ({grado})
                      </span>
                    </p>
                    <button
                      type="button"
                      className="button-delete"
                      onClick={() => handleRemoveDescription(index)}
                    >
                      X
                    </button>
                  </div>
                );
              })}
              {formData.descriptions.length > 0 && (() => {
                const textoTotal = formData.descriptions
                  .filter((d) => !d._markedForDeletion)
                  .map((d) => d.descripcion)
                  .join(" ");
                if (!textoTotal.trim()) return null;
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
            💾 Modificar Tratamiento
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditTreatment;
