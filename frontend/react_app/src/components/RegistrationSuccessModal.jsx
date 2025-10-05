import React, { useState } from 'react';
import './RegistrationSuccessModal.css';

export default function RegistrationSuccessModal({
  isOpen,
  title = 'Registration Successful',
  message,
  email,
  password,
  emailSent = true,
  onClose,
}) {
  const [copyState, setCopyState] = useState({ email: false, password: false });

  if (!isOpen) {
    return null;
  }

  const handleCopy = async (type, value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyState((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyState((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
  };

  return (
    <div className="reg-success-overlay" role="dialog" aria-modal="true">
      <div className="reg-success-modal">
        <button type="button" className="reg-success-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="reg-success-header">
          <div className="reg-success-icon">🎉</div>
          <h3>{title}</h3>
        </div>
        {message && <p className="reg-success-message">{message}</p>}
        <div className="reg-success-status">
          <span className={`reg-success-status-dot ${emailSent ? 'sent' : 'failed'}`} />
          <span>{emailSent ? 'Email sent successfully.' : 'Email delivery failed. Share credentials manually.'}</span>
        </div>
        <div className="reg-success-credentials">
          <div className="reg-success-field">
            <label>Username (Email)</label>
            <div className="reg-success-value-row">
              <span className="reg-success-value">{email || 'Not available'}</span>
              {email && (
                <button
                  type="button"
                  className="reg-success-copy"
                  onClick={() => handleCopy('email', email)}
                >
                  {copyState.email ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          <div className="reg-success-field">
            <label>Temporary Password</label>
            <div className="reg-success-value-row">
              <span className="reg-success-value">{password || 'Not available'}</span>
              {password && (
                <button
                  type="button"
                  className="reg-success-copy"
                  onClick={() => handleCopy('password', password)}
                >
                  {copyState.password ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="reg-success-actions">
          <button type="button" className="reg-success-confirm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
