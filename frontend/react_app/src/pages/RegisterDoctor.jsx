import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import './RegisterDoctor.css';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from './AdminDataContext';
import { adminAPI } from '../services/api.js';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const specializationOptions = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'emergency_medicine', label: 'Emergency Medicine' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'radiology', label: 'Radiology' },
];

const departmentOptions = specializationOptions.map(({ label }) => ({
  value: `${label} Department`,
  label: `${label} Department`,
}));

const specializationToDepartment = specializationOptions.reduce((acc, { value, label }) => {
  acc[value] = `${label} Department`;
  return acc;
}, {});

const relationshipOptions = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Guardian',
  'Relative',
  'Friend',
  'Caregiver',
  'Other',
];

function RegisterDoctor({ setAdminLoggedIn }) {
  const { addDoctor } = useAdminData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    specialty: '',
    department: '',
    experience: '',
    license: '',
    qualification: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
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
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'specialty') {
        const mappedDepartment = specializationToDepartment[value];
        if (mappedDepartment) {
          updated.department = mappedDepartment;
        }
      }

      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.specialty || !form.department) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const doctorData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        specialty: form.specialty,
        department: form.department,
        experience: form.experience,
        license_number: form.license,
        qualification: form.qualification,
        gender: form.gender,
        date_of_birth: form.dob,
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
        status: 'Active'
      };

      const response = await adminAPI.registerDoctor(doctorData);
      
      if (response.success) {
        const payload = response.data?.doctor;
        const credentials = response.data?.credentials;
        const emailSent = response.data?.email_sent !== false;

        if (payload) {
          const experienceValue = Number.isFinite(payload.experience)
            ? payload.experience
            : Number.isFinite(Number(payload.experience))
              ? Number(payload.experience)
              : Number.isFinite(Number(payload.years_of_experience))
                ? Number(payload.years_of_experience)
                : '';

          addDoctor({
            id: payload.doctor_id || payload.id || payload.user_id,
            name: payload.name || `${form.firstName} ${form.lastName}`.trim(),
            email: payload.email || form.email,
            phone: payload.phone || form.phone,
            specialty: payload.specialization || payload.specialty || form.specialty,
            department: payload.department || form.department,
            experience: experienceValue,
            status: payload.status || 'Active',
          });
        }

        const successMessage = emailSent
          ? `Doctor registered successfully! Login credentials have been emailed to ${credentials?.email || form.email}.`
          : 'Doctor registered successfully! Email delivery failed, please share the credentials manually.';
        setSuccess(successMessage);
        setModalData({
          open: true,
          email: credentials?.email || form.email,
          password: credentials?.password || '',
          emailSent,
          message: successMessage,
        });
      } else {
        setError(response.error || 'Failed to register doctor');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout active="register-doctor" setAdminLoggedIn={setAdminLoggedIn}>
      <RegistrationSuccessModal
        isOpen={modalData.open}
        email={modalData.email}
        password={modalData.password}
        emailSent={modalData.emailSent}
        message={modalData.message}
        onClose={() => {
          setModalData((prev) => ({ ...prev, open: false }));
          navigate('/admin/doctors');
        }}
      />
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/doctors')}>&larr; Back to Doctors</button>
        <div className="register-title-block">
          <div className="register-title">Register New Doctor</div>
          <div className="register-desc">Enter doctor information below</div>
        </div>
      </div>
      <form className="register-doctor-form" onSubmit={handleSubmit}>
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section className="form-section professional-info">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Specialization</label>
              <select name="specialty" value={form.specialty} onChange={handleChange}>
                <option value="">Select specialization</option>
                {specializationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select department</option>
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Years of Experience</label>
              <input type="text" name="experience" value={form.experience} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input type="text" name="license" value={form.license} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Qualifications</label>
              <input type="text" name="qualification" value={form.qualification} onChange={handleChange} />
            </div>
            <div className="form-group" style={{flex: 'none'}}>
              <button type="button" className="add-btn">+</button>
            </div>
          </div>
        </section>
        <section className="form-section address-info">
          <h3>Address</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="street" value={form.street} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input type="text" name="zip" value={form.zip} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select
                name="emergencyRelationship"
                value={form.emergencyRelationship}
                onChange={handleChange}
              >
                <option value="">Select relationship</option>
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section schedule-settings">
          <h3>Schedule Settings</h3>
          <div className="form-row days-row">
            <label>Working Days</label>
            <div className="days-btns">
              <button type="button" className="day-btn active">Mon</button>
              <button type="button" className="day-btn active">Tue</button>
              <button type="button" className="day-btn active">Wed</button>
              <button type="button" className="day-btn active">Thu</button>
              <button type="button" className="day-btn active">Fri</button>
              <button type="button" className="day-btn">Sat</button>
              <button type="button" className="day-btn">Sun</button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input type="text" value="09:00 AM" readOnly />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="text" value="05:00 PM" readOnly />
            </div>
          </div>
        </section>
        {success && <div className="form-success">{success}</div>}
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={()=>navigate('/admin/doctors')}>Cancel</button>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Doctor'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterDoctor;
