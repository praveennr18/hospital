import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/healthcare-logo.svg';
import './PatientDashboard.css';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { patientAPI } from '../services/api.js';

const DEFAULT_SUMMARY = {
  known_allergies: 0,
  current_medications: 0,
  medical_history: 0,
};

const normalizeCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const sanitizeSummary = (summary = {}) => ({
  known_allergies: normalizeCount(summary?.known_allergies),
  current_medications: normalizeCount(summary?.current_medications),
  medical_history: normalizeCount(summary?.medical_history),
});

const formatDisplay = (value) => {
  if (!value) return '';
  return value
    .toString()
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const normalizeMedicalHistory = (item = {}) => ({
  id: item.id ?? item.record_id ?? null,
  condition: item.condition ?? 'Not specified',
});

const normalizeAllergy = (item = {}) => ({
  id: item.id ?? null,
  allergen: item.allergen ?? 'Not specified',
});

const normalizeMedication = (item = {}) => ({
  id: item.id ?? null,
  medication_name: item.medication_name ?? 'Not specified',
  dosage: item.dosage ?? '',
});

const normalizeAppointment = (item = {}) => {
  const doctor = item.doctor ?? {};
  const doctorName =
    doctor.name ||
    [doctor.title, doctor.first_name, doctor.last_name].filter(Boolean).join(' ') ||
    'Assigned Doctor';
  const department = doctor.department || doctor.specialization || 'General Medicine';

  return {
    id: item.id ?? `${doctorName}-${item.date ?? ''}-${item.time ?? ''}`,
    doctorName,
    department,
    date: item.date ?? '—',
    time: item.time ?? '',
    type: item.type || formatDisplay(item.status) || 'Consultation',
    status: item.status ?? 'scheduled',
    reason: item.reason ?? '',
  };
};

export default function PatientDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [patientInfo, setPatientInfo] = useState(null);
  const [healthSummary, setHealthSummary] = useState(DEFAULT_SUMMARY);

  const [medicalHistory, setMedicalHistory] = useState([]);
  const [medicalInput, setMedicalInput] = useState('');
  const [medicalBusy, setMedicalBusy] = useState(false);

  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergyBusy, setAllergyBusy] = useState(false);

  const [medications, setMedications] = useState([]);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationBusy, setMedicationBusy] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const patientName = patientInfo?.name || patientInfo?.full_name || 'Patient';
  const greetingName = patientName.split(' ')[0] || 'there';

  const updateSummaryCount = useCallback((key, delta) => {
    setHealthSummary((prev) => {
      const base = { ...DEFAULT_SUMMARY, ...(prev || {}) };
      return {
        ...base,
        [key]: Math.max(0, (base[key] ?? 0) + delta),
      };
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setFeedback(null);

    try {
      const [profileRes, medicalRes, allergyRes, medicationRes, appointmentRes] = await Promise.all([
        patientAPI.getProfile(),
        patientAPI.getMedicalHistory(),
        patientAPI.getAllergies(),
        patientAPI.getMedications(),
        patientAPI.getAppointments(),
      ]);

      if (profileRes.success) {
        const profileData = profileRes.data ?? {};
        setPatientInfo(profileData.patient_info ?? null);
        setHealthSummary(sanitizeSummary(profileData.health_summary));
      } else {
        setPatientInfo(null);
        setHealthSummary(DEFAULT_SUMMARY);
        setLoadError(profileRes.error || 'Unable to load patient profile.');
      }

      if (medicalRes.success) {
        const data = medicalRes.data?.medical_history ?? medicalRes.data ?? [];
        setMedicalHistory(Array.isArray(data) ? data.map(normalizeMedicalHistory) : []);
      } else {
        console.error('Failed to load medical history:', medicalRes.error);
        setMedicalHistory([]);
      }

      if (allergyRes.success) {
        const data = allergyRes.data?.allergies ?? allergyRes.data ?? [];
        setAllergies(Array.isArray(data) ? data.map(normalizeAllergy) : []);
      } else {
        console.error('Failed to load allergies:', allergyRes.error);
        setAllergies([]);
      }

      if (medicationRes.success) {
        const data = medicationRes.data?.medications ?? medicationRes.data ?? [];
        setMedications(Array.isArray(data) ? data.map(normalizeMedication) : []);
      } else {
        console.error('Failed to load medications:', medicationRes.error);
        setMedications([]);
      }

      if (appointmentRes.success) {
        const data = appointmentRes.data?.appointments ?? appointmentRes.data ?? [];
        setAppointments(Array.isArray(data) ? data.map(normalizeAppointment) : []);
      } else {
        console.error('Failed to load appointments:', appointmentRes.error);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to load patient dashboard:', error);
      setPatientInfo(null);
      setHealthSummary(DEFAULT_SUMMARY);
      setMedicalHistory([]);
      setAllergies([]);
      setMedications([]);
      setAppointments([]);
      setLoadError('Unable to load patient dashboard at this time.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refreshAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    let success = false;

    try {
      const response = await patientAPI.getAppointments();
      if (response.success) {
        const data = response.data?.appointments ?? response.data ?? [];
        setAppointments(Array.isArray(data) ? data.map(normalizeAppointment) : []);
        success = true;
      } else {
        console.error('Failed to refresh appointments:', response.error);
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to load appointments.',
        });
      }
    } catch (error) {
      console.error('Failed to refresh appointments:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to load appointments.',
      });
    } finally {
      setAppointmentsLoading(false);
    }

    return success;
  }, []);

  const handleAddMedicalHistory = async () => {
    const value = medicalInput.trim();
    if (!value || medicalBusy) return;

    setMedicalBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.addMedicalHistory({ condition: value });
      if (response.success) {
        const newEntry = normalizeMedicalHistory(response.data);
        setMedicalHistory((prev) => [newEntry, ...prev]);
        setMedicalInput('');
        updateSummaryCount('medical_history', 1);
        setFeedback({ type: 'success', message: 'Medical history entry added.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to add medical history entry.',
        });
      }
    } catch (error) {
      console.error('Failed to add medical history:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to add medical history entry.',
      });
    } finally {
      setMedicalBusy(false);
    }
  };

  const handleDeleteMedicalHistory = async (id) => {
    if (!id || medicalBusy) return;

    setMedicalBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.deleteMedicalHistory(id);
      if (response.success) {
        setMedicalHistory((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          if (updated.length !== prev.length) {
            updateSummaryCount('medical_history', -1);
          }
          return updated;
        });
        setFeedback({ type: 'success', message: 'Medical history entry removed.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to remove medical history entry.',
        });
      }
    } catch (error) {
      console.error('Failed to remove medical history:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to remove medical history entry.',
      });
    } finally {
      setMedicalBusy(false);
    }
  };

  const handleAddAllergy = async () => {
    const value = allergyInput.trim();
    if (!value || allergyBusy) return;

    setAllergyBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.addAllergy({ allergen: value });
      if (response.success) {
        const newEntry = normalizeAllergy(response.data);
        setAllergies((prev) => [newEntry, ...prev]);
        setAllergyInput('');
        updateSummaryCount('known_allergies', 1);
        setFeedback({ type: 'success', message: 'Allergy added.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to add allergy.',
        });
      }
    } catch (error) {
      console.error('Failed to add allergy:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to add allergy.',
      });
    } finally {
      setAllergyBusy(false);
    }
  };

  const handleDeleteAllergy = async (id) => {
    if (!id || allergyBusy) return;

    setAllergyBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.deleteAllergy(id);
      if (response.success) {
        setAllergies((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          if (updated.length !== prev.length) {
            updateSummaryCount('known_allergies', -1);
          }
          return updated;
        });
        setFeedback({ type: 'success', message: 'Allergy removed.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to remove allergy.',
        });
      }
    } catch (error) {
      console.error('Failed to remove allergy:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to remove allergy.',
      });
    } finally {
      setAllergyBusy(false);
    }
  };

  const handleAddMedication = async () => {
    const name = medicationName.trim();
    const dosage = medicationDosage.trim();
    if (!name || medicationBusy) return;

    setMedicationBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.addMedication({
        medication_name: name,
        dosage: dosage || 'As prescribed',
      });

      if (response.success) {
        const newMedication = normalizeMedication(response.data);
        setMedications((prev) => [newMedication, ...prev]);
        setMedicationName('');
        setMedicationDosage('');
        updateSummaryCount('current_medications', 1);
        setFeedback({ type: 'success', message: 'Medication added.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to add medication.',
        });
      }
    } catch (error) {
      console.error('Failed to add medication:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to add medication.',
      });
    } finally {
      setMedicationBusy(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!id || medicationBusy) return;

    setMedicationBusy(true);
    setFeedback(null);

    try {
      const response = await patientAPI.deleteMedication(id);
      if (response.success) {
        setMedications((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          if (updated.length !== prev.length) {
            updateSummaryCount('current_medications', -1);
          }
          return updated;
        });
        setFeedback({ type: 'success', message: 'Medication removed.' });
      } else {
        setFeedback({
          type: 'error',
          message: response.error || 'Unable to remove medication.',
        });
      }
    } catch (error) {
      console.error('Failed to remove medication:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to remove medication.',
      });
    } finally {
      setMedicationBusy(false);
    }
  };

  const handleOpenModal = () => {
    setFeedback(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAppointmentScheduled = async () => {
    const success = await refreshAppointments();
    if (success) {
      setFeedback({ type: 'success', message: 'Appointment scheduled successfully.' });
    }
  };

  return (
    <div className="pdash-root">
      <aside className="pdash-sidebar">
        <div className="pdash-logo">
          <img src={logo} alt="HealthCare Pro Logo" />
          <span className="pdash-logo-text">HealthCare Pro</span>
        </div>
        <nav className="pdash-nav">
          <button className="pdash-nav-link active" type="button" onClick={() => navigate('/')}>Dashboard</button>
          <button className="pdash-nav-link" type="button" onClick={() => navigate('/appointments')}>Appointments</button>
        </nav>
        <div className="pdash-sidebar-bottom">
          <div className="pdash-user">Welcome, {patientName}</div>
          <button className="pdash-logout" type="button" onClick={onLogout}>
            &#x1F6AA; Logout
          </button>
        </div>
      </aside>
      <main className="pdash-main">
        <header className="pdash-header">
          <div>
            <h2>Welcome, {greetingName}!</h2>
            <div className="pdash-header-desc">Manage your health information and appointments</div>
          </div>
        </header>

        {loadError && <div className="pdash-error-banner">{loadError}</div>}

        {feedback?.message && (
          <div className={`pdash-feedback ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="pdash-tabs">
          <button
            type="button"
            className={`pdash-tab${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`pdash-tab${activeTab === 'medical' ? ' active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            Medical History
          </button>
          <button
            type="button"
            className={`pdash-tab${activeTab === 'appointments' ? ' active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
        </div>

        {loading ? (
          <div className="pdash-loading">Loading your dashboard...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="pdash-overview-row">
                <div className="pdash-overview-left">
                  <div className="pdash-card pdash-personal-info">
                    <div className="pdash-card-title"><span role="img" aria-label="info">👤</span> Personal Information</div>
                    <div className="pdash-card-desc">Your personal details (managed by the administration)</div>
                    <div className="pdash-info-grid">
                      <div>
                        <label>Full Name</label>
                        <input value={patientInfo?.name || patientInfo?.full_name || 'Not provided'} readOnly />
                      </div>
                      <div>
                        <label>Date of Birth</label>
                        <input value={patientInfo?.date_of_birth || 'Not provided'} readOnly />
                      </div>
                      <div>
                        <label>Gender</label>
                        <input value={patientInfo?.gender || 'Not specified'} readOnly />
                      </div>
                      <div>
                        <label>Blood Type</label>
                        <input value={patientInfo?.blood_group || 'Not specified'} readOnly />
                      </div>
                      <div>
                        <label>✉️ Email</label>
                        <input value={patientInfo?.email || 'Not provided'} readOnly />
                      </div>
                      <div>
                        <label>☎️ Phone</label>
                        <input value={patientInfo?.phone || 'Not provided'} readOnly />
                      </div>
                    </div>
                    <div className="pdash-info-section">
                      <label>Insurance Information</label>
                      <input value={patientInfo?.insurance_info || 'Not provided'} readOnly />
                    </div>
                    <div className="pdash-info-section">
                      <label>🏠 Address</label>
                      <input value={patientInfo?.address || 'Not provided'} readOnly />
                    </div>
                    <div className="pdash-info-note">
                      {patientInfo?.note || 'To update personal information, please contact the administration office.'}
                    </div>
                    <button className="pdash-schedule-btn-wide" type="button" onClick={handleOpenModal}>
                      📅 Schedule Appointment
                    </button>
                  </div>
                </div>
                <div className="pdash-overview-right">
                  <div className="pdash-card pdash-health-summary">
                    <div className="pdash-card-title"><span role="img" aria-label="heart">❤️</span> Health Summary</div>
                    <div className="pdash-summary-row">
                      <div className="pdash-summary-box pdash-summary-allergy">
                        <div className="pdash-summary-num">{healthSummary.known_allergies}</div>
                        <div className="pdash-summary-label">Known Allergies</div>
                      </div>
                      <div className="pdash-summary-box pdash-summary-med">
                        <div className="pdash-summary-num">{healthSummary.current_medications}</div>
                        <div className="pdash-summary-label">Current Medications</div>
                      </div>
                      <div className="pdash-summary-box pdash-summary-history">
                        <div className="pdash-summary-num">{healthSummary.medical_history}</div>
                        <div className="pdash-summary-label">Medical History</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="pdash-medical-row">
                <div className="pdash-card pdash-medical-history">
                  <div className="pdash-card-title"><span role="img" aria-label="history">💊</span> Medical History</div>
                  <div className="pdash-card-desc">Add and manage your medical history</div>
                  <div className="pdash-input-row">
                    <input
                      className="pdash-input"
                      placeholder="Add medical record..."
                      value={medicalInput}
                      onChange={(e) => setMedicalInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMedicalHistory(); }}
                      disabled={medicalBusy}
                    />
                    <button
                      className="pdash-add-btn"
                      type="button"
                      onClick={handleAddMedicalHistory}
                      disabled={medicalBusy}
                      title="Add medical history entry"
                    >
                      +
                    </button>
                  </div>
                  {medicalHistory.length === 0 ? (
                    <div className="pdash-empty-state">No medical history recorded yet.</div>
                  ) : (
                    <div className="pdash-medical-list pdash-medical-list-green">
                      {medicalHistory.map((item, index) => (
                        <div className="pdash-medical-item" key={item.id || `${item.condition}-${index}`}>
                          <span>{item.condition}</span>
                          <span
                            className="pdash-trash"
                            role="button"
                            tabIndex={0}
                            onClick={() => item.id && handleDeleteMedicalHistory(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && item.id) {
                                handleDeleteMedicalHistory(item.id);
                              }
                            }}
                            aria-label={`Remove ${item.condition}`}
                          >
                            🗑️
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pdash-card pdash-allergies">
                  <div className="pdash-card-title"><span role="img" aria-label="allergy">⚠️</span> Allergies</div>
                  <div className="pdash-card-desc">Track your known allergies</div>
                  <div className="pdash-input-row">
                    <input
                      className="pdash-input"
                      placeholder="Add allergy..."
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddAllergy(); }}
                      disabled={allergyBusy}
                    />
                    <button
                      className="pdash-add-btn"
                      type="button"
                      onClick={handleAddAllergy}
                      disabled={allergyBusy}
                      title="Add allergy"
                    >
                      +
                    </button>
                  </div>
                  {allergies.length === 0 ? (
                    <div className="pdash-empty-state">No allergies recorded yet.</div>
                  ) : (
                    <div className="pdash-medical-list pdash-medical-list-red">
                      {allergies.map((item, index) => (
                        <div className="pdash-medical-item" key={item.id || `${item.allergen}-${index}`}>
                          <span>{item.allergen}</span>
                          <span
                            className="pdash-trash"
                            role="button"
                            tabIndex={0}
                            onClick={() => item.id && handleDeleteAllergy(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && item.id) {
                                handleDeleteAllergy(item.id);
                              }
                            }}
                            aria-label={`Remove ${item.allergen}`}
                          >
                            🗑️
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pdash-card pdash-meds">
                  <div className="pdash-card-title"><span role="img" aria-label="meds">💊</span> Current Medications</div>
                  <div className="pdash-card-desc">Manage your current medications</div>
                  <div className="pdash-input-row">
                    <input
                      className="pdash-input"
                      style={{ flex: 1 }}
                      placeholder="Medication name..."
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMedication(); }}
                      disabled={medicationBusy}
                    />
                    <input
                      className="pdash-input"
                      style={{ flex: 0.7 }}
                      placeholder="Dosage (e.g., 500mg)"
                      value={medicationDosage}
                      onChange={(e) => setMedicationDosage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMedication(); }}
                      disabled={medicationBusy}
                    />
                    <button
                      className="pdash-add-btn"
                      type="button"
                      onClick={handleAddMedication}
                      disabled={medicationBusy}
                      title="Add medication"
                    >
                      +
                    </button>
                  </div>
                  {medications.length === 0 ? (
                    <div className="pdash-empty-state">No medications recorded yet.</div>
                  ) : (
                    <div className="pdash-medical-list pdash-medical-list-purple">
                      {medications.map((item, index) => (
                        <div className="pdash-medical-item" key={item.id || `${item.medication_name}-${index}`}>
                          <span>
                            {item.medication_name}
                            {item.dosage ? ` – ${item.dosage}` : ''}
                          </span>
                          <span
                            className="pdash-trash"
                            role="button"
                            tabIndex={0}
                            onClick={() => item.id && handleDeleteMedication(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && item.id) {
                                handleDeleteMedication(item.id);
                              }
                            }}
                            aria-label={`Remove ${item.medication_name}`}
                          >
                            🗑️
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="pdash-appt-tab">
                <div className="pdash-appt-header-row">
                  <div className="pdash-appt-header-title">Your Appointments</div>
                  <div className="pdash-appt-actions">
                    <button
                      className="pdash-refresh-btn"
                      type="button"
                      onClick={refreshAppointments}
                      disabled={appointmentsLoading}
                    >
                      {appointmentsLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                    <button
                      className="pdash-schedule-btn"
                      type="button"
                      onClick={handleOpenModal}
                    >
                      + Schedule Appointment
                    </button>
                  </div>
                </div>
                <div className="pdash-appt-header-desc">Manage your upcoming appointments</div>
                <div className="pdash-appt-list">
                  {appointmentsLoading && (
                    <div className="pdash-loading-inline">
                      {appointments.length ? 'Refreshing appointments…' : 'Loading appointments…'}
                    </div>
                  )}
                  {!appointmentsLoading && appointments.length === 0 && (
                    <div className="pdash-empty-state">No appointments scheduled yet.</div>
                  )}
                  {appointments.length > 0 && appointments.map((appointment, index) => {
                    const typeClass = (appointment.type || '').toLowerCase().replace(/[^a-z]/g, '') || 'consultation';
                    return (
                      <div className="pdash-appt-card" key={appointment.id || `appointment-${index}`}>
                        <div className="pdash-appt-icon">🗓️</div>
                        <div className="pdash-appt-info">
                          <div className="pdash-appt-doctor">{appointment.doctorName}</div>
                          <div className="pdash-appt-dept">{appointment.department}</div>
                          <div className="pdash-appt-datetime">
                            <span>{appointment.date}</span>
                            {appointment.time && <span> · {appointment.time}</span>}
                          </div>
                          {appointment.reason && (
                            <div className="pdash-appt-meta">Reason: {appointment.reason}</div>
                          )}
                          <div className="pdash-appt-meta pdash-appt-status-text">
                            Status: {formatDisplay(appointment.status)}
                          </div>
                        </div>
                        <div className={`pdash-appt-status ${typeClass}`}>
                          {formatDisplay(appointment.type)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <ScheduleAppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleAppointmentScheduled}
        userRole="patient"
      />
    </div>
  );
}
