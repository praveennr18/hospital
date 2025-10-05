import React, { useCallback, useState } from 'react';
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
import { authAPI } from './services/api';

function AppRoutes({ loggedIn, setLoggedIn, userRole, setUserRole, adminLoggedIn, setAdminLoggedIn }) {
    const navigate = useNavigate();

    const clearAllAuthState = useCallback(() => {
        setLoggedIn(false);
        setUserRole(null);
        setAdminLoggedIn(false);
    }, [setAdminLoggedIn, setLoggedIn, setUserRole]);

    const handleLogoutCommon = useCallback(
        async ({ redirectTo = '/login' } = {}) => {
            try {
                const response = await authAPI.logout();
                if (!response.success) {
                    console.warn('Logout request failed:', response.error || response.message);
                }
            } catch (error) {
                console.error('Unexpected logout error:', error);
            } finally {
                clearAllAuthState();
                navigate(redirectTo);
            }
        },
        [clearAllAuthState, navigate]
    );

    const handlePatientLogout = useCallback(() => handleLogoutCommon(), [handleLogoutCommon]);

    const handleDoctorLogout = useCallback(() => handleLogoutCommon({ redirectTo: '/login' }), [handleLogoutCommon]);

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
                <Route path="/doctor/*" element={<DoctorDashboard onLogout={handleDoctorLogout} />} />
                <Route path="*" element={<Navigate to="/doctor" />} />
            </Routes>
        );
    }
    // Patient routes
    return (
        <Routes>
            <Route path="/" element={<PatientDashboard onLogout={handlePatientLogout} />} />
            <Route path="/appointments" element={<Appointments onLogout={handlePatientLogout} />} />
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

    const routes = (
        <AppRoutes
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            userRole={userRole}
            setUserRole={setUserRole}
            adminLoggedIn={adminLoggedIn}
            setAdminLoggedIn={setAdminLoggedIn}
        />
    );

    return (
        <Router>
            {adminLoggedIn ? (
                <AdminDataProvider>
                    {routes}
                </AdminDataProvider>
            ) : (
                routes
            )}
        </Router>
    );
}

export default App;
