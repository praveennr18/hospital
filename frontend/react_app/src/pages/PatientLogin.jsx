import React, { useState } from 'react';
import './PatientLogin.css';
import logo from '../assets/healthcare_logo.png';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const roles = [
  { label: 'Patient', description: 'Patient Portal - View your medical information and appointments' },
  { label: 'Doctor', description: 'Doctor Portal - Manage appointments and patient records' },
  { label: 'Admin', description: 'Admin Portal - Manage users and system settings' },
];

export default function PatientLogin({ onLogin, setAdminLoggedIn }) {
  const [selectedRole, setSelectedRole] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginTriedWithEmail = false;
    let loginError = null;
    let response = null;
    // Try login with entered value as username
    try {
      response = await apiClient.login(email, password);
    } catch (err) {
      loginError = err;
    }
    // If failed and value looks like an email, or if not, try as email
    if ((!response || !response.access) && email.indexOf('@') === -1) {
      try {
        response = await apiClient.login(email + '@admin.com', password);
        loginTriedWithEmail = true;
      } catch (err2) {
        loginError = err2;
      }
    }
    try {
      if (response && response.access) {
        // Get user details to determine role
        try {
          const userResponse = await apiClient.getCurrentUser();
          const userRole = userResponse.role;
          // Store user info in localStorage
          localStorage.setItem('user_role', userRole);
          localStorage.setItem('user_id', userResponse.id);
          // Route based on role
          if (userRole === 'admin') {
            if (setAdminLoggedIn) setAdminLoggedIn(true);
            navigate('/admin');
          } else if (userRole === 'doctor') {
            if (onLogin) onLogin('Doctor');
            navigate('/doctor');
          } else if (userRole === 'patient') {
            if (onLogin) onLogin('Patient');
            navigate('/');
          } else {
            setError('Invalid user role');
          }
        } catch (userError) {
          console.error('Failed to get user details:', userError);
          setError('Failed to get user information');
        }
      } else {
        setError((loginError && loginError.message) || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-background">
      <div className="login-card">
        <div className="login-logo-box">
          <img src={logo} alt="HealthCare Pro Logo" style={{height:48, marginBottom:8}} />
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
            <span className="login-icon">&#128231;</span> Username or Email
            <input
              className="login-input"
              type="text"
              placeholder="Enter your username or email"
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
          <button className="login-signin-btn" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : `Sign In as ${roles[selectedRole].label}`}
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
