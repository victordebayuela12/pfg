import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DiseasesDashboard.css';
import RejectionModal from '../Components/RejectionModal';
import { Link } from 'react-router-dom';

function DiseasesDashboard() {
  const [pendingDiseases, setPendingDiseases] = useState([]);
  const [approvedDiseases, setApprovedDiseases] = useState([]);
  const [rejectedDiseases, setRejectedDiseases] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [modalDescriptions, setModalDescriptions] = useState([]);

  useEffect(() => {
    fetchDiseases();
  }, []);
const renderFieldWithModal = (text,long) => {
  if (!text) return null;

  const hasNewline = text.includes('\n');
  const isLong = text.length > long;
  const shouldTruncate = isLong || hasNewline;
  const preview = text.slice(0, long).replace(/\n/g, ' '); // opcional: quitar saltos de línea visibles

  return (
    <>
      <span title={text}>
        {preview}
        {shouldTruncate && '...'}
      </span>
    </>
  );
};


  const fetchDiseases = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [pending, approved, rejected] = await Promise.all([
        axios.get('http://localhost:5000/api/diseaseVersions/status/pending', config),
        axios.get('http://localhost:5000/api/diseaseVersions/status/approved', config),
        axios.get('http://localhost:5000/api/diseaseVersions/status/rejected', config)
      ]);
      console.log("🔍 PENDING:", pending.data);
    console.log("🟢 APPROVED:", approved.data);
    console.log("❌ REJECTED:", rejected.data);
      setPendingDiseases(pending.data);
      setApprovedDiseases(approved.data);
      setRejectedDiseases(rejected.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener enfermedades:', err);
      setError('Hubo un problema al cargar las enfermedades.');
    }
  };

  const updateStatus = async (id, status, rejectionComment = '') => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.patch(
        `http://localhost:5000/api/diseaseVersions/${id}/status/${status}`,
        { rejectionComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDiseases();
      setSuccess(`Enfermedad ${status === 'approved' ? 'aprobada' : 'rechazada'} con éxito.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Hubo un problema al actualizar el estado de la enfermedad.');
    }
  };

  const deleteDisease = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`http://localhost:5000/api/diseaseVersions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDiseases();
      setSuccess('Enfermedad eliminada con éxito.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al eliminar enfermedad:', err);
      setError('Hubo un problema al eliminar la enfermedad.');
    }
  };

  const openRejectionModal = (id) => {
    setSelectedDiseaseId(id);
    setModalOpen(true);
  };

  const handleRejectionConfirm = (comment) => {
    updateStatus(selectedDiseaseId, 'rejected', comment);
    setModalOpen(false);
    setSelectedDiseaseId(null);
  };

  const openDescriptionsModal = (descriptions) => {
    setModalDescriptions(descriptions);
    setDescriptionModalOpen(true);
  };

  const closeDescriptionsModal = () => {
    setModalDescriptions([]);
    setDescriptionModalOpen(false);
  };

  const renderTable = (title, diseases, actions) => (
    <div className="admin-list">
      <h2>{title}</h2>
      {diseases.length > 0 ? (
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Resumen</th>
              <th>Descripciones</th>
             <th>Tratamientos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease, index) => (
              <tr key={disease._id} className={index === diseases.length - 1 ? 'last-row' : ''}>
                <td className="multiline-cell" title={disease.disease?.name}>
                <Link to={`/disease/${disease._id}`} className="disease-link">
                    {disease.disease?.name || 'Sin nombre'}
                </Link>
                </td>
                <td title={disease.resume}>{renderFieldWithModal(disease.resume,150)}</td>
                <td>
                  {disease.descriptions?.length > 0 ? (
                    <button
                      onClick={() => openDescriptionsModal(disease.descriptions)}
                      className="pill-button"
                    >
                      Ver más
                    </button>
                  ) : (
                    'Sin descripciones'
                  )}
                </td>
                  <td>
                                  {disease.treatments?.length > 0 ? (
                                    <ul className="treatment-list">
                                      {disease.treatments.map((t, i) => (
                                        <li key={i}>
                                          <Link to={`/treatment/${t._id}`} className="treatment-link">
                                          <h>{renderFieldWithModal(t.name,15)}</h>
                                          </Link>
                                          <h></h>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <em>Sin tratamientos</em>
                                  )}
                                </td>
                              
                <td className="actions-column">
                  {actions(disease)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results">No hay enfermedades {title.toLowerCase()}.</p>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h1>Gestión de Enfermedades</h1>
        <p>Acepta, rechaza o elimina enfermedades según sea necesario.</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {renderTable('Pendientes', pendingDiseases, (disease) => (
          <>
            <button
              onClick={() => updateStatus(disease._id, 'approved')}
              className="action-button approve-button"
            >
              Aprobar
            </button>
            <button
              onClick={() => openRejectionModal(disease._id)}
              className="action-button reject-button"
            >
              Rechazar
            </button>
          </>
        ))}
      
        {renderTable('Rechazadas', rejectedDiseases, (disease) => (
          <>
            <button
              onClick={() => updateStatus(disease._id, 'approved')}
              className="action-button approve-button"
            >
              Aceptar
            </button>
            <button
              onClick={() => deleteDisease(disease._id)}
              className="action-button delete-button"
            >
              Eliminar
            </button>
          </>
        ))}

        {renderTable('Aprobadas', approvedDiseases, () => (
<p style={{ fontSize: '1rem', color: '#888' }}>Sin acciones</p>

)
)} 


       

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
       {/* Modal de rechazo */}
        <RejectionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleRejectionConfirm}
        />
    </div>
  );
}

export default DiseasesDashboard;
