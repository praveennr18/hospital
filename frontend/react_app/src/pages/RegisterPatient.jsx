import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import './RegisterPatient.css';
import { useAdminData } from './AdminDataContext';
import { adminAPI } from '../services/api.js';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';

function RegisterPatient({ setAdminLoggedIn }) {
  const { addPatient } = useAdminData();
  const navigate = useNavigate();
  const genderOptions = useMemo(() => ([
    { value: '', label: 'Select gender' },
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ]), []);

  const bloodTypeOptions = useMemo(() => ([
    { value: '', label: 'Select blood type' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ]), []);

  const relationshipOptions = useMemo(() => ([
    { value: '', label: 'Select relationship' },
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ]), []);

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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({
    open: false,
    email: '',
    password: '',
    emailSent: true,
    message: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.gender || !form.blood) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const patientData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.dob,
        gender: form.gender,
        blood_group: form.blood,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip
        },
        emergency_contact: {
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone
        },
        insurance: {
          provider: form.insuranceProvider,
          policy_number: form.policyNumber
        }
      };

      const response = await adminAPI.registerPatient(patientData);
      
      if (response.success) {
        const payload = response.data?.patient;
        const credentials = response.data?.credentials;
        const emailSent = response.data?.email_sent !== false;

        if (payload) {
          const rawAge = payload.age;
          const ageValue = Number.isFinite(rawAge)
            ? rawAge
            : Number.isFinite(Number(rawAge))
              ? Number(rawAge)
              : '';
          addPatient({
            id: payload.id || payload.patient_id,
            name: payload.name || `${form.firstName} ${form.lastName}`.trim(),
            age: ageValue,
            gender: payload.gender || form.gender,
            blood: payload.blood_group || payload.blood || form.blood,
            email: payload.email || form.email,
            phone: payload.phone || payload.phone_number || form.phone,
            lastVisit: payload.last_visit || 'N/A',
          });
        }
        const successMessage = emailSent
          ? `Patient registered successfully! Login credentials have been emailed to ${credentials?.email || form.email}.`
          : 'Patient registered successfully! Email delivery failed, please share the credentials manually.';
        setSuccess(successMessage);
        setModalData({
          open: true,
          email: credentials?.email || form.email,
          password: credentials?.password || '',
          emailSent,
          message: successMessage,
        });
      } else {
        setError(response.error || 'Failed to register patient');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout active="register-patient" setAdminLoggedIn={setAdminLoggedIn}>
      <RegistrationSuccessModal
        isOpen={modalData.open}
        email={modalData.email}
        password={modalData.password}
        emailSent={modalData.emailSent}
        message={modalData.message}
        onClose={() => {
          setModalData((prev) => ({ ...prev, open: false }));
          navigate('/admin/patients');
        }}
      />
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
              <select name="gender" value={form.gender} onChange={handleChange}>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type *</label>
              <select name="blood" value={form.blood} onChange={handleChange}>
                {bloodTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
                    {option.label}
                  </option>
                ))}
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
              <select name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange}>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
                    {option.label}
                  </option>
                ))}
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
        </section>
        {success && <div className="form-success">{success}</div>}
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={()=>navigate('/admin/patients')}>Cancel</button>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterPatient;
