import React from 'react';
import './Banner.css';
import bannerImage from '../resources/banner.webp'; 

function Banner() {
  return (
    <header className="banner-container">
      <img src={bannerImage} alt="Plataforma Médica" className="banner-image" />
    </header>
  );
}

export default Banner;
