import React from 'react';
import './Banner.css'; // Archivo de estilos para el banner
import bannerImage from '../resources/banner.webp'; // Ruta a la imagen del banner

function Banner() {
  return (
    <header className="banner-container">
      <img src={bannerImage} alt="Plataforma Médica" className="banner-image" />
    </header>
  );
}

export default Banner;
