import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../resources/Logo.png';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleNav = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      document.body.classList.toggle('menu-open', newState);
      return newState;
    });
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate('/');
    window.location.reload();
  };

 const handleAccountDeletion = async () => {
  if (role === "admin") {
    alert("⚠️ Los administradores no pueden eliminar su cuenta directamente.");
    setShowDeleteModal(false);
    return;
  }

  const token = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId");

  let endpoint = role === "patient"
    ? `http://localhost:5000/api/patients/${userId}`
    : `http://localhost:5000/api/users/doctors/${userId}`;

  try {
    await axios.delete(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Tu cuenta ha sido eliminada.");
    localStorage.clear();
    navigate("/");
    window.location.reload();
  } catch (err) {
    console.error("❌ Error al eliminar cuenta:", err);
    alert("No se pudo dar de baja el usuario.");
  }
};


  useEffect(() => {
    const updateRole = () => {
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', updateRole);
    return () => {
      window.removeEventListener('storage', updateRole);
    };
  }, []);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, [location]);

  return (
    <div>
      {/* Icono del logo */}
      <div className="navbar-icon" onClick={handleToggleNav}>
        <img src={logo} alt="Logo" className={isRotating ? 'rotate' : ''} />
      </div>

      {/* Menú lateral */}
      <nav className={`navbar ${isMenuOpen ? 'show' : ''}`}>
        <ul>
            <li>
                <button onClick={handleLogout} className="logout-button" >
                  Cerrar sesión
                </button>
              </li>
          {role === 'doctor' && (
            <>
              <li><Link to="/createPatient">Crear Paciente</Link></li>
              <li><Link to="/my-patients">Mis Pacientes</Link></li>
              <li><Link to="/createDisease">Crear Enfermedad</Link></li>
              <li><Link to="/MyDiseasesDashboard">Mis Enfermedades Creadas</Link></li>
              <li><Link to="/createTreatment">Crear Tratamiento</Link></li>
              <li><Link to="/mytreatments">Mis Tratamientos Creados</Link></li>
            </>
          )}

          {role === 'patient' && (
            <li><Link to="/game">Dashboard Pacientes</Link></li>
          )}

          {role === 'admin' && (
            <>
              <li><Link to="/admin">Dashboard Médicos</Link></li>
              <li><Link to="/adminDisease">Dashboard Enfermedades</Link></li>
              <li><Link to="/treatmentsDash">Dashboard Tratamientos</Link></li>
            </>
          )}

          <li><Link to="/about">Contacto</Link></li>

          {role && (
            <>
              <li><Link to="/reset-password">Cambiar contraseña</Link></li>

              <li>
  <button onClick={() => setShowDeleteModal(true)} className="logout-button danger-delete distinct-button">
    🗑️ Darse de baja
  </button>
</li>


              
            </>
          )}
        </ul>
      </nav>

      {/* Modal de confirmación de baja */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Seguro que deseas darte de baja?</h3>
            <p>Esta acción eliminará tu cuenta de forma permanente.</p>
            <div className="modal-button-group">
              <button className="confirm-button" onClick={handleAccountDeletion}>
                Sí, eliminar mi cuenta
              </button>
              <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
