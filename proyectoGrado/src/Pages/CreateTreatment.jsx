import React, { useState } from "react";
import axios from "axios";
import "./CreateTreatment.css";
import { calcularINFZ } from "../Utils/INFZ";

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
      const { width: originalWidth, height: originalHeight } = img;

      // Si ya es pequeña, no redimensionar
      if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
        return resolve(file);
      }

      // Calcular escala proporcional
      const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
      const width = originalWidth * scale;
      const height = originalHeight * scale;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' })); // fuerza JPEG
      }, 'image/jpeg', 0.8); // calidad 80%
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
            const newDescription = {
                descripcion: descriptionInput,
                image: descriptionImage,
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
            setFormData({ name: "", descriptions: [], benefits: "", risks: "" });
        } catch (err) {
            console.error("Error al crear el tratamiento:", err);
            setError("❌ Hubo un problema al crear el tratamiento.");
        }
    };

    const getColor = (score) => {
        if (score >= 80) return "green";
        if (score >= 50) return "orange";
        return "red";
    };

    return (
        <div className="create-treatment-container">
            <div className="create-treatment-box">
                <h1> Crear Tratamiento</h1>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <form className="treatment-form" onSubmit={handleSubmit}>
                    <h3> Información General</h3>
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

                    <h3> Añadir Descripciones</h3>
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
                    <button type="button" className="button-modern" onClick={handleAddDescription}>
                         Añadir Descripción
                    </button>

                    {formData.descriptions.map((desc, index) => {
                        const infz = calcularINFZ(desc.descripcion);
                        return (
                            <div key={index} className="description-box">
                                <p>{desc.descripcion}</p>
                                {desc.image && (
                                    <img
                                        src={URL.createObjectURL(desc.image)}
                                        alt="Descripción"
                                    />
                                )}
                                <p>
                                    <strong>INFZ:</strong>{" "}
                                    <span style={{ color: getColor(infz), fontWeight: "bold" }}>
                                        {infz.toFixed(2)}
                                    </span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDescription(index)}
                                >
                                    
                                </button>
                            </div>
                        );
                    })}

                    {formData.descriptions.length > 0 && (() => {
                        const textoTotal = formData.descriptions.map((desc) => desc.descripcion).join(" ");
                        const infzTotal = calcularINFZ(textoTotal);
                        return (
                            <div style={{ marginTop: "15px" }}>
                                <h4>INFZ total del tratamiento:</h4>
                                <p>
                                    <span style={{ color: getColor(infzTotal), fontWeight: "bold" }}>
                                        {infzTotal.toFixed(2)} (
                                        {getColor(infzTotal) === "green"
                                            ? "Fácil"
                                            : getColor(infzTotal) === "orange"
                                            ? "Media"
                                            : "Difícil"}
                                        )
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
