import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './TreatmentDetail.css';
import RejectionModal from '../Components/RejectionModal';

function TreatmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [treatment, setTreatment] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`http://localhost:5000/api/treatments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTreatment(response.data);
      } catch (err) {
        console.error('Error al obtener los detalles:', err);
        setError('No se pudieron cargar los detalles del tratamiento.');
      }
    };
    fetchTreatment();
  }, [id]);

  const handleStatusChange = async (status, comment = '') => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.patch(
        `http://localhost:5000/api/treatments/${id}/status`,
        { status, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/treatments');
    } catch (err) {
      console.error(`Error al cambiar el estado a ${status}:`, err);
      setError('No se pudo cambiar el estado del tratamiento.');
    }
  };

  if (!treatment) return <div className="treatment-details-container">Cargando...</div>;

  return (
    <div className="treatment-details-container">
      <div className="treatment-details-box">
        <h1 className="treatment-title">💊 Detalles del Tratamiento</h1>
        {error && <p className="error-message">{error}</p>}

        <div className="resume-box">
          <h2>{treatment.name}</h2>
          <p><strong>Beneficios:</strong> {treatment.benefits}</p>
          <p><strong>Riesgos:</strong> {treatment.risks}</p>
        </div>

        <div className="section-box">
          <h3 className="section-title">📄 Descripciones</h3>
          <div className="card-grid">
            {treatment.descriptions.map((desc, index) => (
              <div key={index} className="card">
                <p>{desc.descripcion}</p>
                {desc.image && <img src={desc.image} alt={`Descripción ${index + 1}`} />}
              </div>
            ))}
          </div>
        </div>

        {role === 'admin' && treatment.status === 'pending' && (
          <div className="button-group-centered">
            <button className="button-uniform approve-button" onClick={() => handleStatusChange('approved')}>
              ✅ Aprobar
            </button>
            <button className="button-uniform reject-button" onClick={() => setIsModalOpen(true)}>
              ❌ Rechazar
            </button>
          </div>
        )}
</div>
        <RejectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(comment) => {
            handleStatusChange('rejected', comment);
            setIsModalOpen(false);
          }}
        />
      
    </div>
  );
}

export default TreatmentDetail;
