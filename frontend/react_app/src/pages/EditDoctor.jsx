import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import './RegisterDoctor.css';
import { adminAPI } from '../services/api.js';

const genderOptions = [
  { value: '', label: 'Select gender' },
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
  { value: '', label: 'Select relationship' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Child', label: 'Child' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Relative', label: 'Relative' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Caregiver', label: 'Caregiver' },
  { value: 'Other', label: 'Other' },
];

const initialFormState = {
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
};

const mapGenderCodeToValue = (code) => {
  if (!code) {
    return '';
  }
  const mapping = {
    M: 'male',
    F: 'female',
    O: 'other',
  };
  return mapping[code.toUpperCase()] || '';
};

const sanitizeDoctorName = (name = '') => {
  if (name.startsWith('Dr.')) {
    return name.slice(3).trim();
  }
  return name.trim();
};

const buildFormState = (doctor) => {
  if (!doctor) {
    return { ...initialFormState };
  }

  const parsedName = sanitizeDoctorName(doctor.name || '');
  const nameParts = parsedName ? parsedName.split(' ') : [];
  const fallbackFirst = doctor.first_name ?? (nameParts[0] || '');
  const fallbackLast = doctor.last_name ?? (nameParts.slice(1).join(' '));

  const address = doctor.address || {};
  const emergency = doctor.emergency_contact || {};

  const specializationValue = doctor.specialization_code || doctor.specialization || doctor.specialty || '';
  const departmentValue = doctor.department || specializationToDepartment[specializationValue] || '';

  const experienceValue = doctor.experience ?? doctor.years_of_experience;

  return {
    ...initialFormState,
    firstName: fallbackFirst?.trim() || '',
    lastName: fallbackLast?.trim() || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    dob: doctor.date_of_birth ? doctor.date_of_birth.slice(0, 10) : '',
    gender: mapGenderCodeToValue(doctor.gender_code),
    specialty: specializationValue,
    department: departmentValue,
    experience: experienceValue !== undefined && experienceValue !== null ? String(experienceValue) : '',
    license: doctor.license_number || '',
    qualification: doctor.qualification || '',
    street: address.street || '',
    city: address.city || '',
    state: address.state || '',
    zip: address.zip || '',
    emergencyName: emergency.name || '',
    emergencyRelationship: emergency.relationship || '',
    emergencyPhone: emergency.phone || '',
  };
};

const normalizeDoctorForContext = (doctor) => {
  if (!doctor) {
    return null;
  }

  const experienceValue = typeof doctor.experience === 'number'
    ? doctor.experience
    : Number.isFinite(Number(doctor.experience))
      ? Number(doctor.experience)
      : Number.isFinite(Number(doctor.years_of_experience))
        ? Number(doctor.years_of_experience)
        : 0;

  const baseName = sanitizeDoctorName(doctor.name || '')
    || [doctor.first_name, doctor.last_name].filter(Boolean).join(' ').trim()
    || 'Unnamed Doctor';

  return {
    id: doctor.doctor_id || doctor.id || doctor.user_id,
    doctorId: doctor.doctor_id || doctor.id || doctor.user_id,
    name: doctor.name || `Dr. ${baseName}`.trim(),
    email: doctor.email || 'N/A',
    phone: doctor.phone || 'N/A',
    specialty: doctor.specialization || doctor.specialty || 'General Medicine',
    department: doctor.department || specializationToDepartment[doctor.specialization_code] || 'General Medicine',
    experience: Number.isFinite(experienceValue) ? experienceValue : 0,
    status: doctor.status || (doctor.status_boolean ? 'Active' : 'Inactive') || 'Active',
  };
};

function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editDoctor } = useAdminData();

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorRecord, setDoctorRecord] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchDoctor = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminAPI.getDoctor(id);
        if (!isActive) {
          return;
        }

        if (response.success) {
          const doctorData = response.data?.doctor ?? response.data;
          if (doctorData) {
            setDoctorRecord(doctorData);
            setForm(buildFormState(doctorData));
          } else {
            setError('Unable to load doctor details.');
          }
        } else {
          setError(response.error || 'Failed to load doctor details.');
        }
      } catch (err) {
        if (isActive) {
          setError('An unexpected error occurred while loading doctor details.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDoctor();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === 'specialty') {
        const mappedDepartment = specializationToDepartment[value];
        if (mappedDepartment) {
          updated.department = mappedDepartment;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    setError('');
    setSuccess('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.specialty || !form.department || !form.license) {
      setError('Please fill all required fields.');
      return;
    }

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.dob,
      gender: form.gender,
      specialization: form.specialty,
      department: form.department,
      years_of_experience: form.experience,
      license_number: form.license,
      qualification: form.qualification,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
      emergency_contact: {
        name: form.emergencyName,
        relationship: form.emergencyRelationship,
        phone: form.emergencyPhone,
      },
    };

    setSaving(true);

    try {
      const response = await adminAPI.updateDoctor(id, payload);

      if (response.success) {
        const updatedDoctor = response.data?.doctor ?? response.data;
        if (updatedDoctor) {
          setDoctorRecord(updatedDoctor);
          setForm(buildFormState(updatedDoctor));
          const normalized = normalizeDoctorForContext(updatedDoctor);
          if (normalized) {
            editDoctor(normalized);
          }
        }

        setSuccess('Doctor profile updated successfully.');
        setTimeout(() => navigate('/admin/doctors'), 1200);
      } else {
        setError(response.error || 'Failed to update doctor profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating the doctor.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="register-loading">Loading doctor details...</div>;
    }

    if (!doctorRecord) {
      return (
        <div className="register-loading register-error">{error || 'Doctor not found.'}</div>
      );
    }

    return (
      <form className="register-doctor-form" onSubmit={handleSubmit}>
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
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone *</label>
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
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
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
              <label>Specialization *</label>
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
              <label>Department *</label>
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
              <input type="number" name="experience" value={form.experience} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>License Number *</label>
              <input type="text" name="license" value={form.license} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Qualifications</label>
              <input type="text" name="qualification" value={form.qualification} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 'none' }}>
              <button type="button" className="add-btn" disabled>
                +
              </button>
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
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.value === ''}>
                    {option.label}
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
        {success && <div className="form-success">{success}</div>}
        {error && !loading && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/doctors')}>
            Cancel
          </button>
          <button type="submit" className="register-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Update Doctor'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AdminLayout active="doctors">
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/doctors')}>&larr; Back to Doctors</button>
        <div className="register-title-block">
          <div className="register-title">Edit Doctor</div>
          <div className="register-desc">Update doctor information below</div>
        </div>
      </div>
      {renderContent()}
    </AdminLayout>
  );
}

export default EditDoctor;
