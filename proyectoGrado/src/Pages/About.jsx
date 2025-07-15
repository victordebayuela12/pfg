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
          El desarrollo ha sido realizado de forma individual, abarcando tanto el diseño como la implementación de la plataforma web y el videojuego educativo asociado. El proyecto combina conocimientos de desarrollo frontend y backend,
           bases de datos y diseño centrado en el usuario, integrando también aspectos éticos y comunicativos del entorno médico.
        </p>
        <a href="/">Volver al Inicio</a>
      </div>
    </div>
  );
};

export default About;
