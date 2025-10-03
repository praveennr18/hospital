import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DoctorManagement from './pages/DoctorManagement';
import PatientManagement from './pages/PatientManagement';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import EditPatient from './pages/EditPatient';
import EditDoctor from './pages/EditDoctor';
import { AdminDataProvider } from './pages/AdminDataContext';
import DoctorDashboard from './doctor/DoctorDashboard';
import Appointments from './pages/Appointments';
import AppointmentsManagement from './pages/AppointmentsManagement';
import apiClient from './api/client';

function AppRoutes({ loggedIn, setLoggedIn, userRole, setUserRole, adminLoggedIn, setAdminLoggedIn, onLogout }) {
    const navigate = useNavigate();
    // Login screens
    if (!loggedIn && !adminLoggedIn) {
        return (
            <Routes>
                <Route path="/login" element={<PatientLogin onLogin={(role) => {
                    setLoggedIn(true);
                    setUserRole(role);
                    if (role === 'Doctor') {
                        navigate('/doctor');
                    } else if (role === 'Admin') {
                        setLoggedIn(false);
                        setUserRole(null);
                        setAdminLoggedIn(true);
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }} setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/login" element={<AdminLogin onLogin={() => {
                    setAdminLoggedIn(true);
                    navigate('/admin');
                }} />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }
    // Admin routes
    if (adminLoggedIn) {
        return (
            <Routes>
                <Route path="/admin" element={<AdminDashboard setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/doctors" element={<DoctorManagement setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/doctors/edit/:id" element={<EditDoctor />} />
                <Route path="/admin/patients" element={<PatientManagement setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/patients/edit/:id" element={<EditPatient />} />
                <Route path="/admin/appointments" element={<AppointmentsManagement setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/register-patient" element={<RegisterPatient setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/register-doctor" element={<RegisterDoctor setAdminLoggedIn={setAdminLoggedIn} />} />
                <Route path="/admin/login" element={<AdminLogin onLogin={() => {
                    setAdminLoggedIn(true);
                    navigate('/admin');
                }} />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        );
    }
    // Doctor routes
    if (userRole === 'Doctor') {
        return (
            <Routes>
                <Route path="/doctor/*" element={<DoctorDashboard onLogout={onLogout} />} />
                <Route path="*" element={<Navigate to="/doctor" />} />
            </Routes>
        );
    }
    // Patient routes
    return (
        <Routes>
            <Route path="/" element={<PatientDashboard onLogout={onLogout} />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/login" element={<PatientLogin onLogin={(role) => {
                setLoggedIn(true);
                setUserRole(role);
                if (role === 'Doctor') {
                    navigate('/doctor');
                } else if (role === 'Admin') {
                    setLoggedIn(false);
                    setUserRole(null);
                    setAdminLoggedIn(true);
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }} setAdminLoggedIn={setAdminLoggedIn} />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    
    // Check for existing authentication on app load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const storedRole = localStorage.getItem('user_role');
        
        if (token && storedRole) {
            if (storedRole === 'admin') {
                setAdminLoggedIn(true);
            } else {
                setLoggedIn(true);
                setUserRole(storedRole === 'doctor' ? 'Doctor' : 'Patient');
            }
        }
    }, []);

    const handleLogout = () => {
        apiClient.logout();
        setLoggedIn(false);
        setUserRole(null);
        setAdminLoggedIn(false);
    };
    return (
        <AdminDataProvider>
            <Router>
                <AppRoutes
                    loggedIn={loggedIn}
                    setLoggedIn={setLoggedIn}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    adminLoggedIn={adminLoggedIn}
                    setAdminLoggedIn={setAdminLoggedIn}
                    onLogout={handleLogout}
                />
            </Router>
        </AdminDataProvider>
    );
}

export default App;
