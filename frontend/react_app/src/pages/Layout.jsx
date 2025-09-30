import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PatientDashboard.css';

export default function Layout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="pdash-root">
      <aside className="pdash-sidebar">
        <div className="pdash-logo">
          <span className="pdash-logo-icon">&#8963;</span>
          <span className="pdash-logo-text">HealthCare Pro</span>
        </div>
        <nav className="pdash-nav">
          <button className={`pdash-nav-link${location.pathname==='/' ? ' active' : ''}`} onClick={() => navigate('/')}>Dashboard</button>
          <button className={`pdash-nav-link${location.pathname==='/appointments' ? ' active' : ''}`} onClick={() => navigate('/appointments')}>Appointments</button>
        </nav>
        <div className="pdash-sidebar-bottom">
          <div className="pdash-user">Welcome, John Doe</div>
          {onLogout && <button className="pdash-logout" onClick={onLogout}>&#x1F6AA; Logout</button>}
        </div>
      </aside>
      <main className="pdash-main">
        {children}
      </main>
    </div>
  );
}
