import React, { useState } from 'react';
import axios from 'axios';
import './ResetPassword.css'; 

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('jwtToken');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  const regexMayuscula = /[A-Z]/;
  const regexSimbolo = /[^A-Za-z0-9]/;

  if (newPassword.length < 8 || !regexMayuscula.test(newPassword) || !regexSimbolo.test(newPassword)) {
    setError('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.');
    return;
  }

  if (newPassword !== confirm) {
    setError('Las contraseñas no coinciden.');
    return;
  }

  try {
    await axios.post(
      'http://localhost:5000/api/users/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess('✅ Contraseña actualizada correctamente.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirm('');
  } catch (err) {
    console.error(err);
    setError(
      err.response?.data?.message || '❌ Error al cambiar la contraseña.'
    );
  }
};

  return (
    <div className="change-password-container">
      <h2>🔒 Cambiar Contraseña</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" className="button-modern">
          Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
