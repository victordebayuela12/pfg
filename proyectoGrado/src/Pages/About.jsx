import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-box">
        <h1>Sobre Nosotros</h1>
        <p>
          Esta plataforma ha sido desarrollada como parte de un Proyecto de Fin de Grado en Ingeniería de Software.
          Creemos en la innovación y en el uso de tecnología avanzada para facilitar la gestión y el monitoreo en el ámbito de la salud.
        </p>
        <p>
          Su objetivo es mejorar la comunicación médico-paciente mediante un sistema que permite a los doctores registrar enfermedades, proponer tratamientos y gestionar pacientes,
          y a los pacientes acceder de forma clara y sencilla a su información médica.
        </p>
        <a href="/">Volver al Inicio</a>
      </div>
    </div>
  );
};

export default About;
