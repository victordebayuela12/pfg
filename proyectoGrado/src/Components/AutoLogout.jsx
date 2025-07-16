import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLogout = ({ logout }) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null); 

   
    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            logout();
            navigate('/login'); 
        }, 30 * 60 * 1000); 
    }, [logout, navigate]); 

    useEffect(() => {
       
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        resetTimer(); 

        return () => {
         
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resetTimer]); 

    return null; 
};

export default AutoLogout;
