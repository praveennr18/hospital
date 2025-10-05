import React, { useState } from 'react';
import './DeleteAppointmentModal.css';

export default function DeleteAppointmentModal({ appointment, open, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  if (!open || !appointment) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this appointment.');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <span className="delete-modal-icon">⚠️</span>
          <span className="delete-modal-title">Delete Appointment</span>
        </div>
        <div className="delete-modal-warning">This action cannot be undone.</div>
        <div className="delete-modal-details">
          <div><b>Appointment:</b> {appointment.patientName || appointment.name}</div>
          <div><b>ID:</b> {appointment.id}</div>
        </div>
        <div className="delete-modal-reason-label">Reason for cancellation <span style={{color:'#d32f2f'}}>*</span></div>
        <textarea
          className="delete-modal-reason-input"
          placeholder="Please provide a reason for cancelling this appointment..."
          value={reason}
          onChange={e => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          maxLength={500}
        />
        <div className="delete-modal-reason-count">{reason.length}/500 characters</div>
        {error && <div className="delete-modal-error">{error}</div>}
        <div className="delete-modal-actions">
          <button className="delete-modal-cancel" onClick={handleCancel}>Cancel</button>
          <button className="delete-modal-confirm" onClick={handleConfirm}>Delete Appointment</button>
        </div>
      </div>
    </div>
  );
}
