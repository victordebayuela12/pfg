import React, { useState } from 'react';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    setMessage(data.message || 'Algo ha salido mal.');
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2 className="forgot-title">Recuperar contraseña</h2>
        <p className="forgot-description">
          Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit} className="forgot-form">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-input"
          />
          <button type="submit" className="forgot-button">
            Enviar enlace
          </button>
          <a href='/login'>Volver a inicio de sesión</a>
          {message && <p className="forgot-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
