import React from 'react';
import AdminLayout from './AdminLayout';
import './RegisterDoctor.css';

import { useNavigate } from 'react-router-dom';
function RegisterDoctor({ setAdminLoggedIn }) {
  const navigate = useNavigate();
  return (
    <AdminLayout active="register-doctor" setAdminLoggedIn={setAdminLoggedIn}>
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/doctors')}>&larr; Back to Doctors</button>
        <div className="register-title-block">
          <div className="register-title">Register New Doctor</div>
          <div className="register-desc">Enter doctor information below</div>
        </div>
      </div>
      <form className="register-doctor-form">
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="text" placeholder="dd-mm-yyyy" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <input type="text" value="Male" readOnly />
            </div>
          </div>
        </section>
        <section className="form-section professional-info">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" placeholder="e.g. Cardiologist, Neurologist" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select><option>Select Department</option></select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Years of Experience</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Qualifications</label>
              <input type="text" placeholder="Add qualification (e.g., MD, PhD)" />
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
              <input type="text" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input type="text" />
            </div>
          </div>
        </section>
        <section className="form-section emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" />
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
        <div className="form-actions">
          <button type="button" className="cancel-btn">Cancel</button>
          <button type="submit" className="register-btn">Register Doctor</button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default RegisterDoctor;
