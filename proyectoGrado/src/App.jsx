import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import Navbar from './Components/Navbar';
import AutoLogout from './Components/AutoLogout';
import PrivateRoute from './Components/PrivateRoute';

import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AboutUs from './Pages/About';
import ForgotPassword from './Pages/ForgotPassword'; 
import ResetPassword from './Pages/ResetPassword';
import DiseaseDetails from './Pages/Disease';
import TreatmentDetails from './Pages/TreatmentDetail';
import UnityGame from './Pages/SeriousGame';
import ResetPasswordAuth from './Pages/ResetPasswordAuth';
import AdminDashboard from './Pages/AdminDashboard';
import DiseasesDashboard from './Pages/DiseasesDashboard';
import TreatmentsDashboard from './Pages/TreatmentsDashboard';

import CreatePatient from './Pages/CreatePatient';
import CreateDisease from './Pages/CreateDisease';
import MyDiseasesDashboard from './Pages/MyDiseasesDashboard';
import EditDisease from './Pages/EditDisease';

import CreateTreatment from './Pages/CreateTreatment';
import MyTreatmentsDashboard from './Pages/MyTreatmentsDashboard';
import EditTreatment from './Pages/EditTreatment';

import MyPatientsDashboard from './Pages/MyPatientsDashboard';

import './App.css';

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const location = useLocation();
const isAuthenticated = !!localStorage.getItem('jwtToken');

const hideNavbarPaths = ['/', '/login', '/register', '/forgot-password'];
const hideResetPasswordForGuest = location.pathname === '/reset-password' && !isAuthenticated;

const showNavbar = !hideNavbarPaths.includes(location.pathname) && !hideResetPasswordForGuest;


  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    setUserRole(null);
    window.location.reload();
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== userRole) {
      setUserRole(role);
    }
  }, [userRole]);

  return (
    <div className={`main-container ${!showNavbar ? 'centered-layout' : ''}`}>
      <AutoLogout logout={logout} />

      {showNavbar && (
        <div className="navbar-container">
          <Navbar />
        </div>
      )}

      <div className="content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={userRole ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={userRole ? <Navigate to="/" /> : <Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-passwordauth" element={<ResetPasswordAuth />} />
          <Route path="/disease/:id" element={<DiseaseDetails />} />
          <Route path="/treatment/:id" element={<TreatmentDetails />} />
          <Route path="/game" element={<UnityGame />} />

          {/* Rutas protegidas */}
          <Route path="/createPatient" element={
            <PrivateRoute role="doctor"><CreatePatient /></PrivateRoute>} />
          <Route path="/createDisease" element={
            <PrivateRoute role="doctor"><CreateDisease /></PrivateRoute>} />
          <Route path="/myDiseasesDashboard" element={
            <PrivateRoute role="doctor"><MyDiseasesDashboard /></PrivateRoute>} />
          <Route path="/edit-disease/:id" element={<EditDisease />} />

          <Route path="/createTreatment" element={
            <PrivateRoute role="doctor"><CreateTreatment /></PrivateRoute>} />
          <Route path="/mytreatments" element={<PrivateRoute role="doctor"><MyTreatmentsDashboard /></PrivateRoute>} />
          <Route path="/edit-treatment/:id" element={<EditTreatment />} />

          <Route path="/my-patients" element={<PrivateRoute role="doctor"><MyPatientsDashboard /></PrivateRoute>} />

          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/adminDisease" element={<PrivateRoute role="admin"><DiseasesDashboard /></PrivateRoute>} />
          <Route path="/treatmentsDash" element={<PrivateRoute role="admin"><TreatmentsDashboard /></PrivateRoute>} />

        
        
        </Routes>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
