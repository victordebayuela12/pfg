import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./TreatmentsDashboard.css";
import RejectionModal from "../Components/RejectionModal";

function TreatmentsDashboard() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(null);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [modalDescriptions, setModalDescriptions] = useState([]);

  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/treatments/state?status=pending", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/treatments/state?status=approved", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/treatments/state?status=rejected", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPending(pendingRes.data);
      setApproved(approvedRes.data);
      setRejected(rejectedRes.data);
      setError("");
    } catch (err) {
      console.error("Error al obtener tratamientos:", err);
      setError("❌ Hubo un problema al cargar los tratamientos.");
    }
  };

  const updateStatus = async (id, status, comment = "") => {
    try {
      await axios.patch(
        `http://localhost:5000/api/treatments/${id}/status`,
        { status, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTreatments();
      setSuccess(`✅ Tratamiento ${status === "approved" ? "aprobado" : "rechazado"} con éxito.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("❌ Hubo un problema al actualizar el estado.");
    }
  };

  const deleteTreatment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/treatments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTreatments();
      setSuccess("🗑️ Tratamiento eliminado con éxito.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al eliminar tratamiento:", err);
      setError("❌ Hubo un problema al eliminar el tratamiento.");
    }
  };

  const openRejectionModal = (id) => {
    setSelectedTreatmentId(id);
    setRejectionModalOpen(true);
  };

  const confirmRejection = (comment) => {
    updateStatus(selectedTreatmentId, "rejected", comment);
    setRejectionModalOpen(false);
    setSelectedTreatmentId(null);
  };

  const openDescriptionsModal = (descriptions) => {
    setModalDescriptions(descriptions);
    setDescriptionModalOpen(true);
  };

  const closeDescriptionsModal = () => {
    setModalDescriptions([]);
    setDescriptionModalOpen(false);
  };
const renderFieldWithModal = (text) => {
  if (!text) return '—';

  const hasNewline = text.includes('\n');
  const isLong = text.length > 60;
  const shouldTruncate = isLong || hasNewline;
  const preview = text.slice(0, 60).replace(/\n/g, ' '); 

  return (
    <>
      <span title={text}>
        {preview}
        {shouldTruncate && '...'}
      </span>
    </>
  );
};

  const renderTable = (title, treatments, actions) => (
    <div className="admin-list">
      <h2>{title}</h2>
      {treatments.length > 0 ? (
        <table className="treatments-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Beneficios</th>
              <th>Riesgos</th>
              <th>Descripciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment, index) => (
              <tr key={treatment._id} className={index === treatments.length - 1 ? "last-row" : ""}>
                <td className="multiline-cell" title={treatment.name}>
                  <Link to={`/treatment/${treatment._id}`} className="treatment-link">
                    {treatment.name || "Nombre no disponible"}
                  </Link>
                </td>
                <td title={treatment.benefits}>{renderFieldWithModal(treatment.benefits)}</td>
                <td title={treatment.risks}>{renderFieldWithModal(treatment.risks)}</td>
                <td>
                  {treatment.descriptions?.length > 0 ? (
                    <button
                      onClick={() => openDescriptionsModal(treatment.descriptions)}
                      className="pill-button"
                    >
                      Ver más
                    </button>
                  ) : (
                    "Sin descripciones"
                  )}
                </td>
                <td className="actions-column">{actions(treatment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results">No hay tratamientos {title.toLowerCase()}.</p>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h1>Gestión de Tratamientos</h1>
        <p>Aprueba, rechaza o elimina tratamientos propuestos por los doctores.</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {renderTable("Pendientes", pending, (t) => (
          <>
            <button
              className="action-button approve-button"
              onClick={() => updateStatus(t._id, "approved")}
            >
              Aprobar
            </button>
            <button
              className="action-button reject-button"
              onClick={() => openRejectionModal(t._id)}
            >
              Rechazar
            </button>
          </>
        ))}

        {renderTable("Rechazados", rejected, (t) => (
          <>
            <button
              className="action-button approve-button"
              onClick={() => updateStatus(t._id, "approved")}
            >
              Aceptar
            </button>
            <button
              className="action-button delete-button"
              onClick={() => deleteTreatment(t._id)}
            >
              Eliminar
            </button>
          </>
        ))}

        {renderTable("Aprobados", approved, () => <p style={{ fontSize: '1rem', color: '#888' }}>Sin acciones</p>)}
      </div>

      {/* Modal de rechazo */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={confirmRejection}
      />

      {/* Modal de descripciones */}
      {descriptionModalOpen && (
        <div className="modal-overlay" onClick={closeDescriptionsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Descripciones</h3>
            <ul>
              {modalDescriptions.map((desc, i) => (
                <li key={i}>{desc.descripcion}</li>
              ))}
            </ul>
            <button onClick={closeDescriptionsModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TreatmentsDashboard;
