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

    try {
      const response = await registerUser(formData);
      alert(response.message);
      navigate('/login');
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

        <p className="form-footer">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
