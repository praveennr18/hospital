import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import './RegisterDoctor.css';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from './AdminDataContext';

function RegisterDoctor({ setAdminLoggedIn }) {
  const { addDoctor, doctors } = useAdminData();
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
    status: 'Active',
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.specialty || !form.department) {
      setError('Please fill all required fields.');
      return;
    }
    const newDoctor = {
      user: {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        role: 'doctor',
      },
      specialty: form.specialty,
      department: form.department,
      experience: form.experience,
      license: form.license,
      qualifications: form.qualification,
      address: form.street,
      city: form.city,
      state: form.state,
      zip: form.zip,
      emergency_name: form.emergencyName,
      emergency_relationship: form.emergencyRelationship,
      emergency_phone: form.emergencyPhone,
      status: form.status,
    };
    addDoctor(newDoctor);
    navigate('/admin/doctors');
  }

  return (
    <AdminLayout active="register-doctor" setAdminLoggedIn={setAdminLoggedIn}>
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
              <input type="text" name="gender" value={form.gender} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section professional-info">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" name="specialty" value={form.specialty} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} />
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
              <input type="text" name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange} />
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
              <input type="text" value="09:00" readOnly />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="text" value="17:00" readOnly />
            </div>
            <div className="form-group">
              <label>Slot Duration (minutes)</label>
              <select><option>30 in minutes</option></select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <input type="text" value="Active" readOnly />
            </div>
          </div>
        </section>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={()=>navigate('/admin/doctors')}>Cancel</button>
          <button type="submit" className="register-btn">Register Doctor</button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterDoctor;
