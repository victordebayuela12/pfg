import React, { useState } from 'react';
import './ResetPassword.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
    console.log("Componente ResetPassword cargado");

 



  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const type = searchParams.get('type');

    console.log("Token:", token);
  console.log("Tipo:", type);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, type })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000); // redirige tras 3s
      } else {
        setError(data.message || 'Error al actualizar la contraseña.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  if (!token || !type) {
    return <p className="error-message">❌ Enlace de recuperación no válido.</p>;
  }

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2 className="reset-title">Nueva contraseña</h2>
        <p className="reset-description">
          Introduce y confirma tu nueva contraseña.
        </p>
        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`form-input ${confirmPassword && newPassword !== confirmPassword ? 'input-error' : ''}`}
              required
            />
          </div>

          <button type="submit" className="form-button">Guardar contraseña</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="form-footer">
          <a href="/login">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
