import React, { useState } from 'react';
import './ConfirmDeleteModal.css';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, type, name, id, requireReason }) {
  const [reason, setReason] = useState('');
  if (!open) return null;
  return (
    <div className="cd-modal-overlay">
      <div className="cd-modal">
        <div className="cd-modal-header">
          <span className="cd-modal-icon">&#9888;</span>
          <span className="cd-modal-title">Delete {type}</span>
        </div>
        <div className="cd-modal-desc">This action cannot be undone.</div>
        <div className="cd-modal-info">
          <div><b>{type}:</b> {name}</div>
          <div><b>ID:</b> {id}</div>
        </div>
        {requireReason && (
          <div className="cd-modal-reason">
            <label htmlFor="cd-reason" style={{fontWeight:'bold'}}>Reason for cancellation <span style={{color:'#e57373'}}>*</span></label>
            <textarea
              id="cd-reason"
              className="cd-modal-reason-input"
              placeholder={`Please provide a reason for cancelling this ${type.toLowerCase()}...`}
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              required
            />
            <div style={{fontSize:'0.85rem',color:'#888'}}>{reason.length}/500 characters</div>
          </div>
        )}
        <div className="cd-modal-actions">
          <button className="cd-modal-btn" onClick={onClose}>Cancel</button>
          <button className="cd-modal-btn cd-modal-btn-danger" onClick={() => onConfirm(requireReason ? reason : undefined)} disabled={requireReason && !reason.trim()}>Delete {type}</button>
        </div>
      </div>
    </div>
  );
}
