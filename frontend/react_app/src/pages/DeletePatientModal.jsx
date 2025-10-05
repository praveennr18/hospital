import React from 'react';
import './DeletePatientModal.css';

export default function DeletePatientModal({ patient, open, onCancel, onConfirm }) {
  if (!open || !patient) return null;
  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <span className="delete-modal-icon">⚠️</span>
          <span className="delete-modal-title">Delete Patient</span>
        </div>
        <div className="delete-modal-warning">This action cannot be undone.</div>
        <div className="delete-modal-details">
          <div><b>Patient:</b> {patient.name}</div>
          <div><b>ID:</b> {patient.id}</div>
        </div>
        <div className="delete-modal-actions">
          <button className="delete-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="delete-modal-confirm" onClick={onConfirm}>Delete Patient</button>
        </div>
      </div>
    </div>
  );
}
