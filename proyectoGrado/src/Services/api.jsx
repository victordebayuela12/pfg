import axios from 'axios';

// Configuración de Axios
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Cambia si usas otra URL para tu backend
});

export default API;
