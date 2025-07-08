import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../resources/Logo.png';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const location = useLocation();
    const navigate = useNavigate();

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
        localStorage.clear(); // Limpiar el rol del almacenamiento local
        setRole(null); // Actualizar el estado del rol
        navigate('/'); // Redirigir al usuario a la página principal
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
            {/* Ícono de la barra */
            <div className="navbar-icon" onClick={handleToggleNav}>
            <img src={logo} alt="Logo" className={isRotating ? 'rotate' : ''} />
        </div>}
            

            {/* Barra de navegación */}
            <nav className={`navbar ${isMenuOpen ? 'show' : ''}`}>
           
                <ul>
                    
       
                    {role === 'doctor' && <li><Link to="/createPatient">Crear Paciente</Link></li>}
                    {role=== 'doctor' && <li> <Link to="/my-patients"> Mis Pacientes</Link></li>}
                    {role === 'doctor' && <li><Link to="/createDisease">Crear Enfermedad</Link></li>}
                    {role === 'doctor' && <li><Link to="/MyDiseasesDashboard">Mis Enfermedades Creadas</Link></li>}
                    {role === 'doctor' && <li><Link to="/createTreatment">Crear Tratamiento</Link></li>}
                    {role === 'doctor' && <li><Link to="/mytreatments">Mis Tratamientos Creados</Link></li>}
                    {role === 'patient' && <li><Link to="/game">Dashboard Pacientes</Link></li>}
                    {role === 'admin' && <li><Link to="/admin">Dashboard Medicos</Link></li>}
                    {role === 'admin' && <li><Link to="/adminDisease">Dashboard Enfermedades</Link></li>}
                    {role === 'admin' && <li><Link to="/treatmentsDash">Dashboard Tratamientos</Link></li>}
                    <li><Link to="/about">Contacto</Link></li>
                    {role && (
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                Cerrar sesión
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;
