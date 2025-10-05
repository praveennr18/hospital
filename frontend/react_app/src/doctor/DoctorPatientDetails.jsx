import React, { useEffect, useMemo, useState } from 'react';
import './DoctorPatientDetails.css';
import { useDoctorData } from './DoctorDataContext.jsx';

const formatEmergencyContact = (contact) => {
  if (!contact) return 'Not provided';
  const name = contact.name || 'Not provided';
  const phone = contact.phone || 'Not provided';
  return `${name} • ${phone}`;
};

export default function DoctorPatientDetails({ patientId, onBack }) {
  const { loadPatientDetail } = useDoctorData();
  const [tab, setTab] = useState('overview');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await loadPatientDetail(patientId, { forceRefresh: true });
        if (isMounted) {
          setDetail(response);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || 'Failed to load patient details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [loadPatientDetail, patientId]);

  const patient = detail?.patient;
  const medicalHistory = detail?.medical_history || [];
  const allergies = detail?.allergies || [];
  const medications = detail?.current_medications || [];

  const overviewInfo = useMemo(() => {
    const personal = patient?.personal_info || {};
    return {
      name: personal.full_name || patient?.name || 'Not provided',
      dob: personal.date_of_birth || 'Not provided',
      gender: patient?.gender || 'Not specified',
      blood: personal.blood_type || 'Unknown',
      email: personal.email || 'Not provided',
      phone: personal.phone || 'Not provided',
      insurance: personal.insurance_info || 'Not provided',
      address: personal.address || 'Not provided',
      emergency: formatEmergencyContact(personal.emergency_contact),
    };
  }, [patient]);

  if (loading) {
    return (
      <div className="doc-patdet-loading">
        <div className="doc-patdet-spinner" />
        <p>Loading patient details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doc-patdet-error">
        <p>{error}</p>
        <button className="doc-patdet-back" type="button" onClick={onBack}>
          &larr; Back to Patients
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="doc-patdet-error">
        <p>Patient record is unavailable.</p>
        <button className="doc-patdet-back" type="button" onClick={onBack}>
          &larr; Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="doc-patdet-main">
      <div className="doc-patdet-header-row">
        <button className="doc-patdet-back" type="button" onClick={onBack}>
          &larr; Back to Patients
        </button>
        <div>
          <div className="doc-patdet-title">{patient.name || 'Patient Name'}</div>
          <div className="doc-patdet-sub">
            Patient ID: {patient.patient_id || patient.id || '—'} &bull; {patient.age || 'Unknown age'} &bull;{' '}
            {(patient.gender || '').toString().toLowerCase() || 'gender not specified'}
          </div>
        </div>
      </div>
      <div className="doc-patdet-tabs">
        <div
          className={tab === 'overview' ? 'doc-patdet-tab active' : 'doc-patdet-tab'}
          onClick={() => setTab('overview')}
        >
          Overview
        </div>
        <div
          className={tab === 'history' ? 'doc-patdet-tab active' : 'doc-patdet-tab'}
          onClick={() => setTab('history')}
        >
          Medical History
        </div>
      </div>
      {tab === 'overview' ? (
        <div className="doc-patdet-content" style={{ display: 'flex', gap: '32px' }}>
          <div className="doc-patdet-info-card" style={{ flex: 1 }}>
            <div className="doc-patdet-info-title" style={{ color: '#1971c2', fontWeight: 600 }}>
              &#128100; Personal Information
            </div>
            <div className="doc-patdet-info-desc">Patient's personal details</div>
            <div className="doc-patdet-info-grid">
              <div>
                <label>Full Name</label>
                <input value={overviewInfo.name} readOnly />
              </div>
              <div>
                <label>Date of Birth</label>
                <input value={overviewInfo.dob} readOnly />
              </div>
              <div>
                <label>Gender</label>
                <input value={overviewInfo.gender} readOnly />
              </div>
              <div>
                <label>Blood Type</label>
                <input value={overviewInfo.blood} readOnly />
              </div>
              <div>
                <label>&#9993; Email</label>
                <input value={overviewInfo.email} readOnly />
              </div>
              <div>
                <label>&#128222; Phone</label>
                <input value={overviewInfo.phone} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>Insurance Information</label>
                <input value={overviewInfo.insurance} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>&#127968; Address</label>
                <input value={overviewInfo.address} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>Emergency Contact</label>
                <input value={overviewInfo.emergency} readOnly />
              </div>
            </div>
          </div>
          <div
            className="doc-patdet-health-card"
            style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
          >
            <div className="doc-patdet-health-title" style={{ color: '#e03131', fontWeight: 600 }}>
              &#10084; Health Summary
            </div>
            <div className="doc-patdet-health-boxes" style={{ display: 'flex', gap: '18px', marginTop: '18px' }}>
              <div
                className="doc-patdet-health-box"
                style={{ background: '#fff0f0', color: '#e03131', border: '1.5px solid #ffe3e3', flex: 1 }}
              >
                <div className="doc-patdet-health-num" style={{ fontWeight: 'bold', fontSize: '2rem', color: '#e03131' }}>
                  {patient.health_summary?.known_allergies ?? allergies.length}
                </div>
                <div className="doc-patdet-health-label">Known Allergies</div>
              </div>
              <div
                className="doc-patdet-health-box"
                style={{ background: '#e6fcf5', color: '#2b8a3e', border: '1.5px solid #c3fae8', flex: 1 }}
              >
                <div className="doc-patdet-health-num" style={{ fontWeight: 'bold', fontSize: '2rem', color: '#2b8a3e' }}>
                  {patient.health_summary?.current_medications ?? medications.length}
                </div>
                <div className="doc-patdet-health-label">Current Medications</div>
              </div>
              <div
                className="doc-patdet-health-box"
                style={{ background: '#e7f5ff', color: '#1971c2', border: '1.5px solid #d0ebff', flex: 1 }}
              >
                <div className="doc-patdet-health-num" style={{ fontWeight: 'bold', fontSize: '2rem', color: '#1971c2' }}>
                  {patient.health_summary?.medical_history ?? medicalHistory.length}
                </div>
                <div className="doc-patdet-health-label">Medical History</div>
              </div>
            </div>
            <div className="doc-patdet-last-visit">
              Last completed visit: {patient.last_visit || 'No visits recorded'}
            </div>
          </div>
        </div>
      ) : (
        <div className="doc-patdet-history-main">
          <div className="doc-patdet-history-card">
            <div className="doc-patdet-history-title" style={{ color: '#1971c2', fontWeight: 600 }}>
              &#10084; Medical History
            </div>
            <div className="doc-patdet-history-desc">Patient's medical conditions and health history</div>
            <div className="doc-patdet-history-conditions-row">
              {medicalHistory.length ? (
                medicalHistory.map((entry) => (
                  <div
                    className="doc-patdet-history-cond"
                    key={entry.id}
                    style={{ background: '#fff0f0', color: '#e03131', border: '1.5px solid #ffe3e3' }}
                  >
                    <span className="doc-patdet-history-cond-icon">&#10084;</span> {entry.condition}{' '}
                    <small>({entry.diagnosed_date || entry.diagnosed_date_iso || '—'})</small>
                  </div>
                ))
              ) : (
                <div className="doc-patdet-history-empty">No medical history recorded.</div>
              )}
            </div>
            <hr className="doc-patdet-history-hr" />
            <div className="doc-patdet-history-section">
              <div className="doc-patdet-history-section-title" style={{ color: '#e03131', fontWeight: 600 }}>
                &#9888; Allergies
              </div>
              <div className="doc-patdet-history-allergies-row">
                {allergies.length ? (
                  allergies.map((item) => (
                    <div
                      className="doc-patdet-history-allergy"
                      key={item.id}
                      style={{ background: '#fff0f0', color: '#e03131', border: '1.5px solid #ffe3e3' }}
                    >
                      <span className="doc-patdet-history-allergy-icon">&#9888;</span> {item.allergen}
                      <small>{item.severity ? ` • ${item.severity}` : ''}</small>
                    </div>
                  ))
                ) : (
                  <div className="doc-patdet-history-empty">No recorded allergies.</div>
                )}
              </div>
            </div>
            <hr className="doc-patdet-history-hr" />
            <div className="doc-patdet-history-section">
              <div className="doc-patdet-history-section-title" style={{ color: '#2b8a3e', fontWeight: 600 }}>
                &#128137; Current Medications
              </div>
              <div className="doc-patdet-history-meds-row">
                {medications.length ? (
                  medications.map((med) => (
                    <div
                      className="doc-patdet-history-med"
                      key={med.id}
                      style={{ background: '#e6fcf5', color: '#2b8a3e', border: '1.5px solid #c3fae8' }}
                    >
                      <span className="doc-patdet-history-med-icon">&#128137;</span> {med.medication_name}
                      <small>{med.dosage ? ` • ${med.dosage}` : ''} {med.frequency ? `(${med.frequency})` : ''}</small>
                    </div>
                  ))
                ) : (
                  <div className="doc-patdet-history-empty">No active medications listed.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}