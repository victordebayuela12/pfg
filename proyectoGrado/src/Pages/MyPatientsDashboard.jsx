import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyPatientsDashboard.css';
import { Link } from 'react-router-dom';

function MyPatientsDashboard() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [approvedVersions, setApprovedVersions] = useState({});

  const token = localStorage.getItem('jwtToken');

  // ✅ Llamada para obtener la versión aprobada según disease._id
  const fetchApprovedVersion = async (diseaseId) => {
    if (!diseaseId || approvedVersions[diseaseId]) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/diseases/${diseaseId}/approved-version`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?._id) {
        setApprovedVersions((prev) => ({
          ...prev,
          [diseaseId]: response.data._id,
        }));
      }
    } catch (err) {
      console.warn(`No se encontró versión aprobada para la enfermedad ${diseaseId}`);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients/my-patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data || [];
        setPatients(data);

        // 🔁 Buscar las versiones aprobadas de cada enfermedad
        data.forEach((patient) => {
          if (patient.disease?._id) {
            fetchApprovedVersion(patient.disease._id);
          }
        });
      } catch (err) {
        console.error('Error al obtener los pacientes:', err);
        setError('❌ No se pudieron cargar tus pacientes.');
      }
    };
    fetchPatients();
  }, [token]);

  return (
    <div className="admin-container">
      <div className="admin-box">
        <div className="admin-section">
          <h1 className="section-title">👥 Mis Pacientes</h1>
          {error && <p className="error-message">{error}</p>}
          {patients.length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Enfermedad</th>
                  <th>Tratamientos</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const diseaseId = patient.disease?._id;
                  const approvedId = approvedVersions[diseaseId];

                  return (
                    <tr key={patient._id}>
                      <td><p className="table-cell">{patient.name}</p></td>
                      <td><p className="table-cell">{patient.email}</p></td>
                      <td>
                      <p className="table-cell">
                        {approvedId ? (
                          <Link to={`/disease/${approvedId}`} className="disease-link">

                            {patient.disease?.name || 'Ver enfermedad'}
                          </Link>
                        ) : (
                          <span>{patient.disease?.name || 'Sin asignar'}</span>
                        )}
                      </p>
                    </td>
                      <td>
                        <div className="description-preview">
                          {Array.isArray(patient.treatments) && patient.treatments.length > 0 ? (
                            patient.treatments.map((t, i) => (
                              <p key={i} className="table-cell">
                                <Link to={`/treatment/${t._id}`} className="disease-link">
                                  {t.name}
                                </Link>
                              </p>
                            ))
                          ) : (
                            <p className="table-cell">Sin tratamientos</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="info-text">No hay pacientes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPatientsDashboard;
