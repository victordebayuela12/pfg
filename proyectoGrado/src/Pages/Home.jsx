import React, { useEffect } from 'react';
import './Home.css';
import logoImage from '../resources/Logo.png';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('role'); 

    if (token && role) {
      if (role === 'doctor') {
        navigate('/myDiseasesDashboard');
      } else if (role === 'patient') {
        navigate('/game');
      } else if (role === 'admin') {
        navigate('/adminDisease');
      }
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="home-left">
        <div className="home-logo-container">
          <img src={logoImage} alt="Logo Médico" className="home-logo" />
          <div className="home-logo-reflection" />
        </div>
      </div>

      <div className="home-right">
        <main className="home-main">
          <section className="home-box">
            <h1 className="home-title">Un espacio común para doctores y pacientes.</h1>
            <p className="home-description">
              Esta plataforma facilita la creación y gestión de enfermedades y tratamientos por parte del personal médico, y ofrece a los pacientes una forma sencilla de acceder a su información médica personalizada.
              Inicia sesión o regístrate para comenzar.
            </p>
            <div className="home-actions">
              <Link to="/login">
                <button className="home-button primary">Iniciar sesión</button>
              </Link>
              <Link to="/register">
                <button className="home-button secondary">Registrarse</button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
