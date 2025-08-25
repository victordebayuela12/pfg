import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyDiseasesDashboard.css';
import { Link, useNavigate } from 'react-router-dom';

function MyDiseasesDashboard() {
  const [pendingDiseases, setPendingDiseases] = useState([]);
  const [approvedDiseases, setApprovedDiseases] = useState([]);
  const [rejectedDiseases, setRejectedDiseases] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDescriptions, setModalDescriptions] = useState([]);

  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setError('No se encontró el ID del usuario.');
      return;
    }

    const fetchDiseases = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/diseaseversions/doctor/${userId}/pending`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/diseaseversions/doctor/${userId}/approved`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/diseaseversions/doctor/${userId}/rejected`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setPendingDiseases(pendingRes.data);
        setApprovedDiseases(approvedRes.data);
        setRejectedDiseases(rejectedRes.data);
        setError('');
      } catch (err) {
        console.error('Error al obtener enfermedades:', err);
        setError('Hubo un problema al cargar las enfermedades.');
      }
    };

    fetchDiseases();
  }, [userId, token]);
const renderFieldWithModal = (text,long) => {
  if (!text) return '—';

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
  const handleOpenModal = (descriptions) => {
    setModalDescriptions(descriptions);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalDescriptions([]);
  };

  const renderTable = (title, diseases, status) => (
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
               {status === 'rejected' && <th>Comentarios del rechazo</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease, index) => (
              <tr key={disease._id} className={index === diseases.length - 1 ? 'last-row' : ''}>
                <td title={disease.disease?.name}>
                  <Link to={`/disease/${disease._id}`} className="disease-link">
                    {disease.disease?.name || 'Sin nombre'}
                  </Link>
                </td>
                <td title={disease.resume}>{disease.resume}</td>
                <td>
                  {disease.descriptions.length > 0 ? (
                    <>
                      
                      <button onClick={() => handleOpenModal(disease.descriptions)} className="pill-button">
  Ver más 
</button>


                    </>
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
  <span>{renderFieldWithModal(t.name, 15)}</span>
</Link>

                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>Sin tratamientos</em>
                  )}
                </td>
              
                 {status === 'rejected' && (
                  
                    <td title={disease.rejectionComment}>
                      {disease.rejectionComment || 'Sin comentario'}
                    </td>)}

                  <td> <button
  className="action-button edit-button"
  onClick={() => navigate(`/edit-disease/${disease._id}`)}
>
  Editar
</button></td>

                  
                
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
        <h1>Mis Enfermedades</h1>
    
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {renderTable('Pendientes', pendingDiseases)}
        {renderTable('Aprobadas', approvedDiseases)}
        {renderTable('Rechazadas', rejectedDiseases, 'rejected')}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Descripciones</h3>
            <ul>
              {modalDescriptions.map((desc, i) => (
                <li key={i}>{desc.descripcion}</li>
              ))}
            </ul>
            <button onClick={handleCloseModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyDiseasesDashboard;
