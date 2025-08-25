import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Disease.css'; 
import RejectionModal from '../Components/RejectionModal'; 
import { calcularIFSZ, interpretarIFSZ } from "../Utils/IFSZ";
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

    
    const serverMessage = err.response?.data?.message;
    setError(serverMessage || 'No se pudo cambiar el estado de la enfermedad.');
   
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
          {diseaseVersion.resume && (() => {
  const score = calcularIFSZ(diseaseVersion.resume);
  const { grado, color } = interpretarIFSZ(score);
  return (
   <p className="ifsz-centered">
  <strong></strong>{" "}
  <span style={{ color, fontWeight: "bold" }}>
    {score.toFixed(2)} ({grado})
  </span>
</p>
  );
})()}
        </div>
        
        <div className="section-box">
          <h3 className="section-title">📄 Descripciones</h3>
          <div className="card-grid">
            {diseaseVersion.descriptions.map((desc, index) => (
              <div key={index} className="card">
                <p className="description-text">{desc.descripcion}</p>
                {desc.image && <img src={desc.image} alt="Descripción" />}
              </div>
            ))}
          </div>
        </div>
        {diseaseVersion.descriptions.length > 0 && (() => {
  const textoTotal = diseaseVersion.descriptions.map(d => d.descripcion).join(" ");
  const score = calcularIFSZ(textoTotal);
  const { grado, color } = interpretarIFSZ(score);
  return (
    <div style={{ marginTop: "10px" }}>
      <h4></h4>
      <p>
        <span style={{ color, fontWeight: "bold" }}>
          {score.toFixed(2)} ({grado})
        </span>
      </p>
    </div>
  );
})()}


        <div className="section-box">
          <h3 className="section-subtitle">💊 Tratamientos</h3>
          {diseaseVersion.treatments.map((treatment, index) => {
  const scoreBen = calcularIFSZ(treatment.benefits);
  const scoreRisk = calcularIFSZ(treatment.risks);
  const { grado: gradoBen, color: colorBen } = interpretarIFSZ(scoreBen);
  const { grado: gradoRisk, color: colorRisk } = interpretarIFSZ(scoreRisk);

  const textoDesc = treatment.descriptions.map(d => d.descripcion).join(" ");
  const scoreDescTotal = calcularIFSZ(textoDesc);
  const { grado: gradoDescTotal, color: colorDescTotal } = interpretarIFSZ(scoreDescTotal);

  return (
    <div key={index} className="treatment-card">
      <h4>{treatment.name}</h4>
      <p><strong>Beneficios:</strong> {treatment.benefits}</p>
      <p>
        <strong></strong>{" "}
        <span style={{ color: colorBen, fontWeight: "bold" }}>
          {scoreBen.toFixed(2)} ({gradoBen})
        </span>
      </p>
      <p><strong>Riesgos:</strong> {treatment.risks}</p>
      <p>
        <strong></strong>{" "}
        <span style={{ color: colorRisk, fontWeight: "bold" }}>
          {scoreRisk.toFixed(2)} ({gradoRisk})
        </span>
      </p>

      <div className="card-grid">
        {treatment.descriptions.map((desc, i) => {
          const score = calcularIFSZ(desc.descripcion);
          const { grado, color } = interpretarIFSZ(score);
          return (
            <div key={i} className="card">
              <p>{desc.descripcion}</p>
              {desc.image && <img src={desc.image} alt="Descripción tratamiento" />}
              
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "10px" }}>
        <h4></h4>
        <p>
          <span style={{ color: colorDescTotal, fontWeight: "bold" }}>
            {scoreDescTotal.toFixed(2)} ({gradoDescTotal})
          </span>
        </p>
      </div>
    </div>
  );
})}

        </div>
        {diseaseVersion.status === 'rejected' && diseaseVersion.rejectionComment && (
  <p className="rejection-comment">
    <strong>Motivo del rechazo:</strong> {diseaseVersion.rejectionComment}
  </p>
)}


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
