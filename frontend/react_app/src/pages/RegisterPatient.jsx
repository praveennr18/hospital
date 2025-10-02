import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import './RegisterPatient.css';
import { useAdminData } from './AdminDataContext';

function RegisterPatient({ setAdminLoggedIn }) {
  const { addPatient, patients } = useAdminData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    blood: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    insuranceProvider: '',
    policyNumber: '',
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.gender || !form.blood) {
      setError('Please fill all required fields.');
      return;
    }
    // Add patient
    const newPatient = {
      id: patients.length ? Math.max(...patients.map(p => p.id)) + 1 : 1,
      name: form.firstName + ' ' + form.lastName,
      age: 2025 - parseInt(form.dob.split('-')[0]), // crude age calc
      gender: form.gender,
      blood: form.blood,
      email: form.email,
      phone: form.phone,
      lastVisit: '',
      street: form.street,
      city: form.city,
      state: form.state,
      zip: form.zip,
      emergencyName: form.emergencyName,
      emergencyRelationship: form.emergencyRelationship,
      emergencyPhone: form.emergencyPhone,
      insuranceProvider: form.insuranceProvider,
      policyNumber: form.policyNumber,
      status: 'Active',
    };
    addPatient(newPatient);
    navigate('/admin/patients');
  }

  return (
    <AdminLayout active="register-patient" setAdminLoggedIn={setAdminLoggedIn}>
      <form className="register-patient-form" onSubmit={handleSubmit}>
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <input type="text" name="gender" value={form.gender} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Blood Type *</label>
              <input type="text" name="blood" value={form.blood} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section address-info">
          <h3>Address Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address *</label>
              <input type="text" name="street" value={form.street} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input type="text" name="zip" value={form.zip} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relationship *</label>
              <input type="text" name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section insurance-info">
          <h3>Insurance Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Insurance Provider</label>
              <input type="text" name="insuranceProvider" value={form.insuranceProvider} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Policy Number</label>
              <input type="text" name="policyNumber" value={form.policyNumber} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Status</label>
              <input type="text" value="Active" readOnly />
            </div>
          </div>
        </section>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={()=>navigate('/admin/patients')}>Cancel</button>
          <button type="submit" className="register-btn">Register Patient</button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterPatient;
