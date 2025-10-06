import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import healthcareLogo from '../assets/healthcare-logo.svg';
import { authAPI } from '../services/api.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess('Verification code sent to your email!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.verifyResetCode(email, code);
      
      if (response.success) {
        setSuccess('Code verified successfully!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(email, code, newPassword, confirmPassword);
      
      if (response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleStartOver = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="forgot-password-root">
      <div className="forgot-password-card">
        {/* Logo & Branding */}
        <div className="forgot-logo-section">
          <div className="forgot-logo-icon">
            <img src={healthcareLogo} alt="HealthCare Pro" />
          </div>
          <h1 className="forgot-brand">HealthCare Pro</h1>
          <p className="forgot-tagline">Password Recovery</p>
        </div>

        {/* Progress Indicator */}
        <div className="forgot-progress">
          <div className={`forgot-progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="forgot-progress-circle">1</div>
            <span className="forgot-progress-label">Email</span>
          </div>
          <div className={`forgot-progress-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`forgot-progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="forgot-progress-circle">2</div>
            <span className="forgot-progress-label">Verify</span>
          </div>
          <div className={`forgot-progress-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`forgot-progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="forgot-progress-circle">3</div>
            <span className="forgot-progress-label">Reset</span>
          </div>
        </div>

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form className="forgot-form" onSubmit={handleEmailSubmit}>
            <div className="forgot-step-header">
              <h2>Enter Your Email</h2>
              <p>We'll send you a verification code to reset your password</p>
            </div>

            <div className="forgot-form-group">
              <label className="forgot-label">
                <span className="forgot-input-icon">✉️</span>
                Email Address
              </label>
              <input
                className="forgot-input"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <div className="forgot-error">{error}</div>}
            {success && <div className="forgot-success">{success}</div>}

            <button className="forgot-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <button type="button" className="forgot-back-btn" onClick={handleBackToLogin}>
              ← Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <form className="forgot-form" onSubmit={handleCodeSubmit}>
            <div className="forgot-step-header">
              <h2>Enter Verification Code</h2>
              <p>We sent a 4-digit code to <strong>{email}</strong></p>
            </div>

            <div className="forgot-form-group">
              <label className="forgot-label">
                <span className="forgot-input-icon">🔐</span>
                Verification Code
              </label>
              <input
                className="forgot-input forgot-code-input"
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength="4"
                required
                autoFocus
              />
            </div>

            {error && <div className="forgot-error">{error}</div>}
            {success && <div className="forgot-success">{success}</div>}

            <button className="forgot-submit-btn" type="submit" disabled={loading || code.length !== 4}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button type="button" className="forgot-back-btn" onClick={handleStartOver}>
              ← Start Over
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form className="forgot-form" onSubmit={handlePasswordSubmit}>
            <div className="forgot-step-header">
              <h2>Create New Password</h2>
              <p>Enter your new password below</p>
            </div>

            <div className="forgot-form-group">
              <label className="forgot-label">
                <span className="forgot-input-icon">🔒</span>
                New Password
              </label>
              <input
                className="forgot-input"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="forgot-form-group">
              <label className="forgot-label">
                <span className="forgot-input-icon">🔒</span>
                Confirm Password
              </label>
              <input
                className="forgot-input"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="forgot-error">{error}</div>}
            {success && <div className="forgot-success">{success}</div>}

            <button className="forgot-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button type="button" className="forgot-back-btn" onClick={handleStartOver}>
              ← Start Over
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="forgot-note">
          <strong>Note:</strong> Password reset is only available for Doctor and Patient accounts. 
          Admin users should contact the system administrator.
        </div>
      </div>
    </div>
  );
}
