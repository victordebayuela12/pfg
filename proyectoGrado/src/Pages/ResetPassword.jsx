import React, { useState } from 'react';
import './ResetPassword.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  console.log("Componente ResetPassword cargado");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  const isLoggedIn = !token && localStorage.getItem('jwtToken');

  const [oldPassword, setOldPassword] = useState('');
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

  const regexMayuscula = /[A-Z]/;
  const regexSimbolo = /[^A-Za-z0-9]/;

  if (newPassword.length < 8 || !regexMayuscula.test(newPassword) || !regexSimbolo.test(newPassword)) {
    setError('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setError('Las contraseñas no coinciden.');
    return;
  }

  try {
    let response;
    if (isLoggedIn) {
      response = await fetch('http://localhost:5000/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    } else {
      response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, type }),
      });
    }

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(data.message || 'Error al actualizar la contraseña.');
    }
  } catch (err) {
    console.error(err);
    setError('Error de conexión con el servidor.');
  }
};


  if (!token && !isLoggedIn) {
    return <p className="error-message">❌ No tienes acceso a esta página.</p>;
  }

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2 className="reset-title">Cambiar contraseña</h2>
        <p className="reset-description">
          {isLoggedIn
            ? 'Introduce tu contraseña actual y la nueva.'
            : 'Introduce y confirma tu nueva contraseña.'}
        </p>

        <form onSubmit={handleSubmit} className="reset-form">
          {isLoggedIn && (
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Contraseña actual"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

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
              className={`form-input ${
                confirmPassword && newPassword !== confirmPassword ? 'input-error' : ''
              }`}
              required
            />
          </div>

          <button type="submit" className="form-button">
            Guardar contraseña
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-footer">
          <a href="/login">Volver</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
