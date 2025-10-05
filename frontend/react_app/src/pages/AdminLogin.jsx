import React, { useState } from 'react';
import './AdminLogin.css';
import logo from '../assets/healthcare_logo.png';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple check: username: admin, password: admin123
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-root">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div style={{textAlign:'center', marginBottom:12}}>
          <img src={logo} alt="HealthCare Pro Logo" style={{height:48, marginBottom:8}} />
        </div>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="admin-login-error">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
