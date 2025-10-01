import React, { useState } from 'react';
import './PatientLogin.css';

const roles = [
  { label: 'Patient', description: 'Patient Portal - View your medical information and appointments' },
  { label: 'Doctor', description: 'Doctor Portal - Manage appointments and patient records' },
  { label: 'Admin', description: 'Admin Portal - Manage users and system settings' },
];

import { useNavigate } from 'react-router-dom';

export default function PatientLogin({ onLogin, setAdminLoggedIn }) {
  const [selectedRole, setSelectedRole] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roles[selectedRole].label === 'Admin') {
      // Simple admin check: email: admin@admin.com, password: admin123
      if (email === 'admin@admin.com' && password === 'admin123') {
        if (setAdminLoggedIn) setAdminLoggedIn(true);
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
      return;
    }
    if (onLogin) onLogin(roles[selectedRole].label);
  };
  return (
    <div className="login-background">
      <div className="login-card">
        <div className="login-logo-box">
          <div className="login-logo"><span>\u23AF</span></div>
        </div>
        <h2 className="login-title">HealthCare Pro</h2>
        <p className="login-subtitle">Smart Appointment & Patient Management System</p>
        <div className="login-role-tabs">
          {roles.map((role, idx) => (
            <button
              key={role.label}
              className={idx === selectedRole ? 'login-active-tab' : 'login-tab'}
              onClick={() => setSelectedRole(idx)}
            >
              {role.label}
            </button>
          ))}
        </div>
        <div className="login-role-desc">{roles[selectedRole].description}</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            <span className="login-icon">&#128231;</span> Email Address
            <input
              className="login-input"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="login-label">
            <span className="login-icon">&#128274;</span> Password
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <div style={{color:'#e11d48',textAlign:'center',marginBottom:'0.5rem'}}>{error}</div>}
          <button className="login-signin-btn" type="submit">
            Sign In as {roles[selectedRole].label}
          </button>
        </form>
        <div className="login-forgot"><a href="#">Forgot your password?</a></div>
        <div className="login-new-patient">
          New Patient? Contact your healthcare provider or visit the front desk to get registered by an administrator.
        </div>
      </div>
    </div>
  );
}
