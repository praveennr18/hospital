import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import './RegisterPatient.css';

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, editPatient } = useAdminData();
  const patient = patients.find(p => String(p.id) === String(id));
  const [form, setForm] = React.useState(patient || {});

  if (!patient) return <AdminLayout><div>Patient not found</div></AdminLayout>;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    editPatient(form);
    navigate('/admin/patients');
  }

  return (
    <AdminLayout active="patients">
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/patients')}>&larr; Back to Patient Panel</button>
        <div className="register-title-block">
          <div className="register-title">Edit Patient</div>
          <div className="register-desc">Update patient information below</div>
        </div>
      </div>
      <form className="register-patient-form" onSubmit={handleSubmit}>
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" value={form.firstName || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" value={form.lastName || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" value={form.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input name="dob" value={form.dob || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <input name="gender" value={form.gender || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <input name="blood" value={form.blood || ''} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section address-info">
          <h3>Address Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address *</label>
              <input name="street" value={form.street || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input name="city" value={form.city || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input name="state" value={form.state || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input name="zip" value={form.zip || ''} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="emergencyName" value={form.emergencyName || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relationship *</label>
              <input name="emergencyRelationship" value={form.emergencyRelationship || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="emergencyPhone" value={form.emergencyPhone || ''} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section insurance-info">
          <h3>Insurance Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Insurance Provider</label>
              <input name="insuranceProvider" value={form.insuranceProvider || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Policy Number</label>
              <input name="policyNumber" value={form.policyNumber || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Status</label>
              <input name="status" value={form.status || ''} onChange={handleChange} />
            </div>
          </div>
        </section>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/patients')}>Cancel</button>
          <button type="submit" className="register-btn">Update Patient</button>
        </div>
      </form>
    </AdminLayout>
  );
}
