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
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ username: '', temp_password: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.gender || !form.blood) {
      setError('Please fill all required fields.');
      return;
    }
    // Prepare patient data for backend
    const patientData = {
      user: {
        username: form.email, // or you can use another unique value
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        role: 'patient'
      },
      dob: form.dob,
      phone: form.phone,
      gender: form.gender,
      blood: form.blood,
      address: form.street,
      city: form.city,
      state: form.state,
      zip: form.zip,
      emergency_name: form.emergencyName,
      emergency_relationship: form.emergencyRelationship,
      emergency_phone: form.emergencyPhone,
      insurance_provider: form.insuranceProvider,
      policy_number: form.policyNumber,
      status: 'Active',
    };
    try {
      const result = await addPatient(patientData);
      if (result && result.username && result.temp_password) {
        setPopupData({ username: result.username, temp_password: result.temp_password });
        setShowPopup(true);
      } else {
        navigate('/admin/patients');
      }
    } catch (err) {
      setError(err.message || 'Failed to register patient.');
    }
  }

  return (
    <AdminLayout active="register-patient" setAdminLoggedIn={setAdminLoggedIn}>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <h2>Patient Registered Successfully</h2>
            <p><strong>User ID (Email):</strong> {popupData.username}</p>
            <p><strong>Temporary Password:</strong> {popupData.temp_password}</p>
            <p>Share these credentials with the patient. They must change their password on first login.</p>
            <button onClick={() => { setShowPopup(false); navigate('/admin/patients'); }}>OK</button>
          </div>
        </div>
      )}
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
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type *</label>
              <select name="blood" value={form.blood} onChange={handleChange} required>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
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
              <select name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange} required>
                <option value="">Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
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
              <select name="status" value={form.status || 'Active'} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
