import React from 'react';
import AdminLayout from './AdminLayout';
import './RegisterPatient.css';

function RegisterPatient({ setAdminLoggedIn }) {
  return (
    <AdminLayout active="register-patient" setAdminLoggedIn={setAdminLoggedIn}>
      <form className="register-patient-form">
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="text" placeholder="dd-mm-yyyy" />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <input type="text" value="Male" readOnly />
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <input type="text" value="O+" readOnly />
            </div>
          </div>
        </section>
        <section className="form-section address-info">
          <h3>Address Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address *</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input type="text" />
            </div>
          </div>
        </section>
        <section className="form-section emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Relationship *</label>
              <select><option>Select relationship</option></select>
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" />
            </div>
          </div>
        </section>
        <section className="form-section insurance-info">
          <h3>Insurance Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Insurance Provider</label>
              <input type="text" placeholder="e.g. Blue Cross Blue Shield" />
            </div>
            <div className="form-group">
              <label>Policy Number</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Status</label>
              <input type="text" value="Active" readOnly />
            </div>
          </div>
        </section>
        <div className="form-actions">
          <button type="button" className="cancel-btn">Cancel</button>
          <button type="submit" className="register-btn">Register Patient</button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterPatient;
