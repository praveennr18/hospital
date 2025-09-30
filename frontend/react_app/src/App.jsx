import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentsPage from './pages/AppointmentsPage';

import AdminDashboard from './pages/AdminDashboard';
import DoctorManagement from './pages/DoctorManagement';
import PatientManagement from './pages/PatientManagement';
import AppointmentsManagement from './pages/AppointmentsManagement';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import EditPatient from './pages/EditPatient';
import EditDoctor from './pages/EditDoctor';
import { AdminDataProvider } from './pages/AdminDataContext';

function AppRoutes({ loggedIn, setLoggedIn, adminLoggedIn, setAdminLoggedIn }) {
	const navigate = useNavigate();
	// If not logged in as either, show login selection
		if (!loggedIn && !adminLoggedIn) {
			// Only show PatientLogin (with admin toggle inside)
			return (
				<Routes>
					<Route path="/*" element={<PatientLogin onLogin={() => setLoggedIn(true)} setAdminLoggedIn={setAdminLoggedIn} />} />
				</Routes>
			);
		}
	// Admin dashboard
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
						<Route path="*" element={<Navigate to="/admin" />} />
					</Routes>
				);
			}
	// Patient dashboard
	return (
		<Routes>
			<Route path="/" element={<PatientDashboard onLogout={() => { setLoggedIn(false); navigate('/'); }} />} />
			<Route path="/appointments" element={<AppointmentsPage />} />
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}

function App() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [adminLoggedIn, setAdminLoggedIn] = useState(false);
	return (
		<AdminDataProvider>
			<Router>
				<AppRoutes
					loggedIn={loggedIn}
					setLoggedIn={setLoggedIn}
					adminLoggedIn={adminLoggedIn}
					setAdminLoggedIn={setAdminLoggedIn}
				/>
			</Router>
		</AdminDataProvider>
	);
}

export default App;
