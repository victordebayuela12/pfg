import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLogout = ({ logout }) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null); // useRef para manejar el timeout

    // Función para reiniciar el temporizador, envuelta en useCallback
    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            logout(); // Cierra sesión
            navigate('/login'); // Redirigir al login
        }, 30 * 60 * 1000); // 30 minutos de inactividad
    }, [logout, navigate]); // Se asegura de no cambiar en cada render

    useEffect(() => {
        // Detectar eventos de actividad del usuario
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        resetTimer(); // Inicializa el temporizador

        return () => {
            // Limpiar eventos y timeout al desmontar el componente
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resetTimer]); // Ahora `resetTimer` está correctamente en la lista de dependencias

    return null; // No renderiza nada en la UI
};

export default AutoLogout;
