import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyTreatmentsDashboard.css';
import { Link,useNavigate } from 'react-router-dom';

function MyTreatmentsDashboard() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [error, setError] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDescriptions, setModalDescriptions] = useState([]);

  const token = localStorage.getItem('jwtToken');
  const doctorId = localStorage.getItem('userId');
const navigate = useNavigate();

  useEffect(() => {
    if (!doctorId) {
      setError('No se encontró el ID del usuario.');
      return;
    }

    const fetchTreatments = async () => {
      try {
        const [resPending, resApproved, resRejected] = await Promise.all([
          axios.get(`http://localhost:5000/api/treatments/doctor/${doctorId}/pending`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/treatments/doctor/${doctorId}/approved`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/treatments/doctor/${doctorId}/rejected`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setPending(resPending.data);
        setApproved(resApproved.data);
        setRejected(resRejected.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar tratamientos');
      }
    };

    fetchTreatments();
  }, [doctorId, token]);

  const openModal = (text) => {
    setModalContent(text);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent('');
    setIsModalOpen(false);
  };
  const handleOpenDescriptions = (descriptions) => {
  setModalDescriptions(descriptions);
  setIsModalOpen(true);
};

  const renderFieldWithModal = (text,long) => {
  if (!text) return '—';

  const hasNewline = text.includes('\n');
  const isLong = text.length > long;
  const shouldTruncate = isLong || hasNewline;
  const preview = text.slice(0, long).replace(/\n/g, ' '); 

  return (
    <>
      <span title={text}>
        {preview}
        {shouldTruncate && '...'}
      </span>
    </>
  );
};


  const renderTable = (title, list) => (
    <div className="admin-list">
      <h2>{title}</h2>
      {list.length > 0 ? (
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Beneficios</th>
              <th>Riesgos</th>
              <th>Descripciones</th>
              

              {title === 'Rechazados' && <th>Comentario</th>}
               <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((treatment) => (
              <tr key={treatment._id}>
                <td>
                  <Link to={`/treatment/${treatment._id}`} className="disease-link">
                    {renderFieldWithModal(treatment.name,20)}
                  </Link>
                </td>
                <td className="beneficios">{renderFieldWithModal(treatment.benefits)}</td>
<td className="riesgos">{renderFieldWithModal(treatment.risks)}</td>
                <td>
                
  {treatment.descriptions?.length > 0 ? (
    <button
      className="pill-button"
      onClick={() => handleOpenDescriptions(treatment.descriptions)}
    >
      Ver más
    </button>
  ) : (
    <span>Sin descripciones</span>
  )}
</td>

              

                {title === 'Rechazados' && (
                  
                    <td>{renderFieldWithModal(treatment.rejection?.comment || '')}</td>)}
                    
                    <td> <button
  className="action-button edit-button"
  onClick={() => navigate(`/edit-treatment/${treatment._id}`)}
>
  Editar
</button></td>
                  
              
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
        <h1>Mis Tratamientos</h1>
        <p>Aquí puedes ver los tratamientos que has creado y su estado.</p>
        {error && <p className="error-message">{error}</p>}
        {renderTable('Pendientes', pending)}
        {renderTable('Aprobados', approved)}
        {renderTable('Rechazados', rejected)}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Descripciones</h3>
            {modalDescriptions.length > 0 ? (
              <ul>
                {modalDescriptions.map((desc, idx) => (
                  <li key={idx}>{desc.descripcion}</li>
                ))}
              </ul>
            ) : (
              <p>No hay descripciones disponibles.</p>
            )}
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyTreatmentsDashboard;
