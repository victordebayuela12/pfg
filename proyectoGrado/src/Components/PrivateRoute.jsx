import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ role, children }) => {
    const userRole = localStorage.getItem('role');

    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    if (role !== userRole) {
        return <Navigate to="/About" replace />;
    }

    return children;
};

export default PrivateRoute;
