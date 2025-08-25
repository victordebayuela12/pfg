import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { registerUser } from '../Services/authService';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'doctor', 
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const password = formData.password;
    const regexMayuscula = /[A-Z]/;
    const regexSimbolo = /[^A-Za-z0-9]/;

    if (password.length < 8 || !regexMayuscula.test(password) || !regexSimbolo.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.');
      return;
    }

    try {
      const response = await registerUser(formData);
      setSuccess('✅ Se ha solicitado el alta de registro correctamente.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const backendError = err?.error;
      if (backendError?.errors) {
        const messages = Object.values(backendError.errors).map(e => e.message).join('\n');
        setError(messages);
      } else {
        setError(backendError?.message || 'Hubo un problema al registrar el usuario.');
      }
    }
  };
  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Crear Cuenta</h1>
        <p className="register-description">
          Solicita tu alta en la plataforma completando este formulario
        </p>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Nombre"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <input
            type="text"
            placeholder="Apellidos"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          
          <button type="submit" className="form-button">Registrarse</button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <p className="form-footer">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
