import './AdminDashboard.css';
import './AdminLayout.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/healthcare_logo.png';
import { authAPI } from '../services/api.js';

export default function AdminLayout({ children, active, setAdminLoggedIn }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Failed to logout admin:', error);
    }
    if (setAdminLoggedIn) setAdminLoggedIn(false);
    navigate('/login');
  };
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logo} alt="HealthCare Pro Logo" style={{height:32, marginRight:8, verticalAlign:'middle'}} />
          HealthCare Pro
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-link${active==='dashboard' ? ' active' : ''}`} onClick={() => navigate('/admin')}>Dashboard</button>
          <button className={`admin-nav-link${active==='doctors' ? ' active' : ''}`} onClick={() => navigate('/admin/doctors')}>Doctors</button>
          <button className={`admin-nav-link${active==='patients' ? ' active' : ''}`} onClick={() => navigate('/admin/patients')}>Patients</button>
          <button className={`admin-nav-link${active==='appointments' ? ' active' : ''}`} onClick={() => navigate('/admin/appointments')}>Appointments</button>
        </nav>
        <div className="admin-sidebar-bottom-fixed">
          <div className="admin-quick-actions">
            <button className="admin-action-btn blue" onClick={() => navigate('/admin/register-patient')}>Register Patient</button>
            <button className="admin-action-btn green" onClick={() => navigate('/admin/register-doctor')}>Register Doctor</button>
          </div>
          <div className="admin-sidebar-footer">
            <span>Welcome, Admin</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
