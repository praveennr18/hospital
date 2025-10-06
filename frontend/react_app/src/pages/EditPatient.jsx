import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import './RegisterPatient.css';
import { adminAPI } from '../services/api.js';

const initialFormState = {
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
};

const buildFormState = (patient) => {
  if (!patient) {
    return { ...initialFormState };
  }

  const address = patient.address || {};
  const emergency = patient.emergency_contact || {};
  const insurance = patient.insurance || {};

  const rawName = (patient.name || '').trim();
  const nameParts = rawName ? rawName.split(' ') : [];
  const fallbackFirst = patient.first_name ?? (nameParts[0] || '');
  const fallbackLast = patient.last_name ?? (nameParts.slice(1).join(' '));

  return {
    ...initialFormState,
    firstName: fallbackFirst?.trim() || '',
    lastName: fallbackLast?.trim() || '',
    email: patient.email || '',
    phone: patient.phone || patient.phone_number || '',
    dob: patient.date_of_birth ? patient.date_of_birth.slice(0, 10) : '',
    gender: patient.gender_code || '',
    blood: patient.blood_group || patient.blood || '',
    street: address.street || '',
    city: address.city || '',
    state: address.state || '',
    zip: address.zip || '',
    emergencyName: emergency.name || '',
    emergencyRelationship: emergency.relationship || '',
    emergencyPhone: emergency.phone || '',
    insuranceProvider: insurance.provider || '',
    policyNumber: insurance.policy_number || '',
  };
};

const normalizePatientForContext = (patient) => {
  if (!patient) {
    return null;
  }

  const ageValue = typeof patient.age === 'number'
    ? patient.age
    : Number.isFinite(Number(patient.age))
      ? Number(patient.age)
      : '';

  const fullName = patient.name
    || [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim()
    || 'Unnamed Patient';

  return {
    id: patient.id || patient.patient_id,
    name: fullName,
    age: Number.isFinite(ageValue) ? ageValue : '',
    gender: patient.gender || patient.gender_code || 'N/A',
    blood: patient.blood_group || patient.blood || 'N/A',
    email: patient.email || 'N/A',
    phone: patient.phone || patient.phone_number || 'N/A',
    lastVisit: patient.last_visit || 'N/A',
  };
};

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editPatient } = useAdminData();

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

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientRecord, setPatientRecord] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchPatient = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminAPI.getPatient(id);
        if (!isActive) {
          return;
        }

        if (response.success) {
          const patientData = response.data?.patient ?? response.data;
          if (patientData) {
            setPatientRecord(patientData);
            setForm(buildFormState(patientData));
          } else {
            setError('Unable to load patient details.');
          }
        } else {
          setError(response.error || 'Failed to load patient details.');
        }
      } catch (err) {
        if (isActive) {
          setError('An unexpected error occurred while loading patient details.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchPatient();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    setError('');
    setSuccess('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.gender || !form.blood) {
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
      blood_group: form.blood,
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
      insurance: {
        provider: form.insuranceProvider,
        policy_number: form.policyNumber,
      },
    };

    setSaving(true);

    try {
      const response = await adminAPI.updatePatient(id, payload);

      if (response.success) {
        const updatedPatient = response.data?.patient ?? response.data;
        if (updatedPatient) {
          setPatientRecord(updatedPatient);
          setForm(buildFormState(updatedPatient));
          const normalized = normalizePatientForContext(updatedPatient);
          if (normalized) {
            editPatient(normalized);
          }
        }

        setSuccess('Patient profile updated successfully.');
        setTimeout(() => navigate('/admin/patients'), 1200);
      } else {
        setError(response.error || 'Failed to update patient profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating the patient.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="register-loading">Loading patient details...</div>;
    }

    if (!patientRecord) {
      return (
        <div className="register-loading register-error">{error || 'Patient not found.'}</div>
      );
    }

    return (
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
        {error && !loading && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/patients')}>Cancel</button>
          <button type="submit" className="register-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Update Patient'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AdminLayout active="patients">
      <div className="register-header">
        <button className="back-btn" onClick={() => navigate('/admin/patients')}>&larr; Back to Patient Panel</button>
        <div className="register-title-block">
          <div className="register-title">Edit Patient</div>
          <div className="register-desc">Update patient information below</div>
        </div>
      </div>
      {renderContent()}
    </AdminLayout>
  );
}

export default EditPatient;
