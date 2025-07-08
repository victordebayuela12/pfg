import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [rejectedDoctors, setRejectedDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/doctors/pending'),
        axios.get('http://localhost:5000/api/users/doctors/approved'),
        axios.get('http://localhost:5000/api/users/doctors/rejected')
      ]);

      setPendingDoctors(pendingRes.data);
      setApprovedDoctors(approvedRes.data);
      setRejectedDoctors(rejectedRes.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar médicos:', err);
      setError('Hubo un problema al cargar los médicos.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/doctors/${id}/status`,
        { status }
      );
      setSuccess(`Médico ${status === 'approved' ? 'aprobado' : 'rechazado'} con éxito.`);
      fetchDoctors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Hubo un problema al actualizar el estado del médico.');
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/doctors/${id}`);
      setSuccess('Médico eliminado con éxito.');
      fetchDoctors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al eliminar médico:', err);
      setError('Hubo un problema al eliminar al médico.');
    }
  };

 const renderTable = (title, doctors, actions, showActions = true) => (
  <div className="admin-list">
    <h2>{title}</h2>
    {doctors.length > 0 ? (
      <table className="modern-table">
        
       <thead>
  <tr>
    <th className="nombre-col">Nombre</th>
    <th className="apellidos-col">Apellidos</th>
    <th className="email-col">Email</th>
    {showActions && <th>Acciones</th>}
  </tr>
</thead>
<tbody>
  {doctors.map((doc) => (
    <tr key={doc._id}>
      <td className="nombre-col">{doc.name}</td>
      <td className="apellidos-col">{doc.surname}</td>
      <td className="email-col" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset' }}>
  {doc.email}
</td>

      {showActions && (
        <td className="actions-column">
          {actions(doc)}
        </td>
      )}
    </tr>
  ))}
</tbody>
      </table>
    ) : (
      <p>No hay médicos {title.toLowerCase()}.</p>
    )}
  </div>
);


  return (
    <div className="admin-container">
      <div className="admin-box">
        <h1>Gestión de Médicos</h1>
        <p>Aprueba, rechaza o elimina médicos registrados en la plataforma.</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {renderTable('Pendientes', pendingDoctors, (doctor) => (
          <>
            <button
              className="action-button approve-button"
              onClick={() => updateStatus(doctor._id, 'approved')}
            >
              Aprobar
            </button>
            <button
              className="action-button reject-button"
              onClick={() => updateStatus(doctor._id, 'rejected')}
            >
              Rechazar
            </button>
          </>
        ))}

        {renderTable('Rechazados', rejectedDoctors, (doctor) => (
          <>
            <button
              className="action-button approve-button"
              onClick={() => updateStatus(doctor._id, 'approved')}
            >
              Aceptar
            </button>
            <button
              className="action-button delete-button"
              onClick={() => deleteDoctor(doctor._id)}
            >
              Eliminar
            </button>
          </>
        ))}

        {renderTable('Aprobados', approvedDoctors, (doctor) => (
            <button
                className="action-button delete-button"
                onClick={() => deleteDoctor(doctor._id)}
            >
                Eliminar
            </button>
            ))}

      </div>
    </div>
  );
}

export default AdminDashboard;
