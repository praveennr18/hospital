import React from 'react';
import './DeleteDoctorModal.css';

export default function DeleteDoctorModal({ doctor, open, onCancel, onConfirm }) {
  if (!open || !doctor) return null;
  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <span className="delete-modal-icon">⚠️</span>
          <span className="delete-modal-title">Delete Doctor</span>
        </div>
        <div className="delete-modal-warning">This action cannot be undone.</div>
        <div className="delete-modal-details">
          <div><b>Doctor:</b> {doctor.name}</div>
          <div><b>ID:</b> {doctor.id}</div>
        </div>
        <div className="delete-modal-actions">
          <button className="delete-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="delete-modal-confirm" onClick={onConfirm}>Delete Doctor</button>
        </div>
      </div>
    </div>
  );
}
