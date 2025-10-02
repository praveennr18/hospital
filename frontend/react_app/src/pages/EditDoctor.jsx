import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import './RegisterDoctor.css';

export default function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, editDoctor } = useAdminData();
  const doctor = doctors.find(d => String(d.id) === String(id));
  // Split name for form
  const [form, setForm] = React.useState(doctor ? {
    ...doctor,
    firstName: doctor.name ? doctor.name.split(' ')[0] : '',
    lastName: doctor.name ? doctor.name.split(' ').slice(1).join(' ') : '',
  } : {});

  if (!doctor) return <AdminLayout><div>Doctor not found</div></AdminLayout>;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Merge first/last name
    const updated = {
      ...form,
      name: (form.firstName || '') + ' ' + (form.lastName || ''),
    };
    editDoctor(updated);
    navigate('/admin/doctors');
  }

  return (
    <AdminLayout active="doctors">
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/doctors')}>&larr; Back to Doctors</button>
        <div className="register-title-block">
          <div className="register-title">Edit Doctor</div>
          <div className="register-desc">Update doctor information below</div>
        </div>
      </div>
      <form className="register-doctor-form" onSubmit={handleSubmit}>
        <section className="form-section personal-info">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} />
            </div>
          </div>
        </section>
        <section className="form-section professional-info">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Specialization</label>
              <input name="specialty" value={form.specialty || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Years of Experience</label>
              <input name="experience" value={form.experience || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input name="license" value={form.license || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Qualifications</label>
              <input name="qualification" value={form.qualification || ''} onChange={handleChange} />
            </div>
            <div className="form-group" style={{flex: 'none'}}>
              <button type="button" className="add-btn">+</button>
            </div>
          </div>
        </section>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/doctors')}>Cancel</button>
          <button type="submit" className="register-btn">Update Doctor</button>
        </div>
      </form>
    </AdminLayout>
  );
}
