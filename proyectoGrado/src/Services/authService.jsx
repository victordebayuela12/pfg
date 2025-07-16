import axios from 'axios';

const API_URL = 'http://localhost:5000/';


export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}api/users/register`, userData);
        console.log('Respuesta del backend:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error desde el servicio:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};


export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}auth/login`, credentials);
        const { token } = response.data;
        console.log(credentials)

        localStorage.setItem('token', token);
    
        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error.response?.data || error.message);
        throw error.response?.data || { error: 'Error desconocido.' };
    }
};


const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible. Inicia sesión nuevamente.');
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const getProtectedData = async (endpoint) => {
    try {
        const response = await axios.get(`${API_URL}/${endpoint}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos protegidos:', error.response?.data || error.message);
        throw error.response?.data || { error: 'Error desconocido.' };
    }
};
