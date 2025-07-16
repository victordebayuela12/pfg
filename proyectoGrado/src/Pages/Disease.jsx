import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Disease.css'; 
import RejectionModal from '../Components/RejectionModal'; 

function DiseaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diseaseVersion, setDiseaseVersion] = useState(null);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDiseaseVersion = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(`http://localhost:5000/api/diseaseVersions/version/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDiseaseVersion(response.data);
      } catch (err) {
        console.error('Error al obtener los detalles:', err);
        setError('No se pudieron cargar los detalles de la enfermedad.');
      }
    };
    fetchDiseaseVersion();
  }, [id]);

  const handleStatusChange = async (status, comment = '') => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.patch(
        `http://localhost:5000/api/diseaseVersions/${id}/status/${status}`,
        { rejectionComment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/adminDisease'); 
    } catch (err) {
      console.error(`Error al cambiar el estado a ${status}:`, err);
      setError('No se pudo cambiar el estado de la enfermedad.');
    }
  };

  if (!diseaseVersion) return <div className="create-disease-container">Cargando...</div>;

  return (
    <div className="create-disease-container">
      <div className="create-disease-box">
        <h1 className="section-title">🧬 Detalles de la Enfermedad</h1>
        {error && <p className="error-message">{error}</p>}

        <div className="info-box">
          <h2 className="disease-title">{diseaseVersion.disease?.name}</h2>
          <p className="disease-resume">
            <strong>Resumen:</strong> {diseaseVersion.resume}
          </p>
        </div>

        <div className="section-box">
          <h3 className="section-title">📄 Descripciones</h3>
          <div className="card-grid">
            {diseaseVersion.descriptions.map((desc, index) => (
              <div key={index} className="card">
                <p>{desc.descripcion}</p>
                {desc.image && <img src={desc.image} alt="Descripción" />}
              </div>
            ))}
          </div>
        </div>

        <div className="section-box">
          <h3 className="section-subtitle">💊 Tratamientos</h3>
          {diseaseVersion.treatments.map((treatment, index) => (
            <div key={index} className="treatment-card">
              <h4>{treatment.name}</h4>
              <p><strong>Beneficios:</strong> {treatment.benefits}</p>
              <p><strong>Riesgos:</strong> {treatment.risks}</p>
              <div className="card-grid">
                {treatment.descriptions.map((desc, i) => (
                  <div key={i} className="card">
                    <p>{desc.descripcion}</p>
                    {desc.image && <img src={desc.image} alt="Descripción tratamiento" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {role === 'admin' && diseaseVersion.status === 'pending' && (
          <div className="button-group-centered">
            <button
              className="button-uniform approve-button"
              onClick={() => handleStatusChange('approved')}
            >
              ✅ Aprobar
            </button>
            <button
              className="button-uniform reject-button"
              onClick={() => setIsModalOpen(true)}
            >
              ❌ Rechazar
            </button>
          </div>
        )}
      </div>

      <RejectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async (comment) => {
          await handleStatusChange('rejected', comment);
        
        }}
      />
    </div>
  );
}

export default DiseaseDetails;
