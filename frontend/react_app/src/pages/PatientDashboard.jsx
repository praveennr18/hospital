import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';

const initialAppointments = [
  {
    doctor: 'Dr. Sarah Wilson',
    department: 'Cardiology Department',
    date: '2024-11-15',
    time: '10:30',
    status: 'Follow-up',
    statusType: 'followup',
  },
  {
    doctor: 'Dr. Michael Johnson',
    department: 'Neurology Department',
    date: '2024-11-20',
    time: '14:00',
    status: 'Consultation',
    statusType: 'consultation',
  },
];

export default function PatientDashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [medicalHistory, setMedicalHistory] = useState([
    'Hypertension',
    'Diabetes Type 2',
  ]);
  const [medicalInput, setMedicalInput] = useState('');

  const [allergies, setAllergies] = useState([
    'Penicillin',
    'Peanuts',
  ]);
  const [allergyInput, setAllergyInput] = useState('');

  const [medications, setMedications] = useState([
    'Metformin 500mg',
    'Lisinopril 10mg',
  ]);
  const [medicationInput, setMedicationInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    department: '',
    doctor: '',
    date: '',
    time: '',
    type: '',
    reason: '',
  });
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const navigate = useNavigate();

  const departmentsList = [
    'Cardiology Department',
    'Neurology Department',
    'General Medicine',
    'Orthopedics',
    'Dermatology',
  ];
  const doctorsList = [
    'Dr. Sarah Wilson',
    'Dr. Michael Johnson',
    'Dr. Smith',
    'Dr. Johnson',
    'Dr. Brown',
    'Dr. Lee',
    'Dr. Wilson',
  ];
  const timeslotsList = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:30', '16:00', '16:30',
  ];
  const appointmentTypes = [
    'follow-up',
    'consultation',
    'procedure',
  ];

  const handleAddMedical = () => {
    const value = medicalInput.trim();
    if (value && !medicalHistory.includes(value)) {
      setMedicalHistory([...medicalHistory, value]);
      setMedicalInput('');
    }
  };

  const handleDeleteMedical = (item) => {
    setMedicalHistory(medicalHistory.filter((m) => m !== item));
  };

  const handleAddAllergy = () => {
    const value = allergyInput.trim();
    if (value && !allergies.includes(value)) {
      setAllergies([...allergies, value]);
      setAllergyInput('');
    }
  };

  const handleDeleteAllergy = (item) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

  const handleAddMedication = () => {
    const value = medicationInput.trim();
    if (value && !medications.includes(value)) {
      setMedications([...medications, value]);
      setMedicationInput('');
    }
  };

  const handleDeleteMedication = (item) => {
    setMedications(medications.filter((m) => m !== item));
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    setAppointmentsList([
      ...appointmentsList,
      {
        doctor: form.doctor,
        department: form.department,
        date: form.date,
        time: form.time,
        status: form.type.charAt(0).toUpperCase() + form.type.slice(1),
        statusType: form.type,
        reason: form.reason,
      }
    ]);
    setShowModal(false);
    setForm({ department: '', doctor: '', date: '', time: '', type: '', reason: '' });
  };

  return (
    <div className="pdash-root">
      <aside className="pdash-sidebar">
        <div className="pdash-logo">
          <span className="pdash-logo-icon">&#8963;</span>
          <span className="pdash-logo-text">HealthCare Pro</span>
        </div>
        <nav className="pdash-nav">
          <button className="pdash-nav-link active" onClick={() => navigate('/')}>Dashboard</button>
          <button className="pdash-nav-link" onClick={() => navigate('/appointments')}>Appointments</button>
        </nav>
        <div className="pdash-sidebar-bottom">
          <div className="pdash-user">Welcome, John Doe</div>
          <button className="pdash-logout" onClick={onLogout}>&#x1F6AA; Logout</button>
        </div>
      </aside>
      <main className="pdash-main">
        <header className="pdash-header">
          <div>
            <h2>Welcome, Sarah!</h2>
            <div className="pdash-header-desc">Manage your health information and appointments</div>
          </div>
        </header>
        <div className="pdash-tabs">
          <button className={`pdash-tab${tab==='overview' ? ' active' : ''}`} onClick={()=>setTab('overview')}>Overview</button>
          <button className={`pdash-tab${tab==='medical' ? ' active' : ''}`} onClick={()=>setTab('medical')}>Medical History</button>
          <button className={`pdash-tab${tab==='appointments' ? ' active' : ''}`} onClick={()=>setTab('appointments')}>Appointments</button>
        </div>
        {tab === 'appointments' && (
          <div className="pdash-appt-tab">
            <div className="pdash-appt-header-row">
              <div className="pdash-appt-header-title">Your Appointments</div>
              <button className="pdash-schedule-btn" style={{marginLeft:'auto'}} onClick={()=>setShowModal(true)}>+ Schedule Appointment</button>
            </div>
            <div className="pdash-appt-header-desc">Manage your upcoming appointments</div>
            <div className="pdash-appt-list">
              {appointmentsList.map((appt, i) => (
                <div className="pdash-appt-card" key={i}>
                  <div className="pdash-appt-icon">&#128138;</div>
                  <div className="pdash-appt-info">
                    <div className="pdash-appt-doctor">{appt.doctor}</div>
                    <div className="pdash-appt-dept">{appt.department}</div>
                    <div className="pdash-appt-datetime">
                      <span>{appt.date}</span> <span>{appt.time}</span>
                    </div>
                  </div>
                  <div className={`pdash-appt-status ${appt.statusType}`}>{appt.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'overview' && (
          <div className="pdash-overview-row">
            <div className="pdash-overview-left">
              <div className="pdash-card pdash-personal-info">
                <div className="pdash-card-title"><span role="img" aria-label="info">&#128100;</span> Personal Information</div>
                <div className="pdash-card-desc">Your personal details (managed by administrator)</div>
                <div className="pdash-info-grid">
                  <div>
                    <label>Full Name</label>
                    <input value="Sarah Johnson" readOnly />
                  </div>
                  <div>
                    <label>Date of Birth</label>
                    <input value="3/15/1985" readOnly />
                  </div>
                  <div>
                    <label>Gender</label>
                    <input value="Female" readOnly />
                  </div>
                  <div>
                    <label>Blood Type</label>
                    <input value="A+" readOnly />
                  </div>
                  <div>
                    <label>&#128231; Email</label>
                    <input value="sarah.johnson@email.com" readOnly />
                  </div>
                  <div>
                    <label>&#128222; Phone</label>
                    <input value="(555) 123-4567" readOnly />
                  </div>
                </div>
                <div className="pdash-info-section">
                  <label>Insurance Information</label>
                  <input value="Blue Cross Blue Shield - Policy #BC123456789" readOnly />
                </div>
                <div className="pdash-info-section">
                  <label>&#127968; Address</label>
                  <input value="123 Main St, Springfield, IL 62701" readOnly />
                </div>
                <div className="pdash-info-note">To update personal information, please contact the administration office.</div>
                <button className="pdash-schedule-btn-wide" onClick={() => setShowModal(true)}>&#128197; Schedule Appointment</button>
              </div>
            </div>
            <div className="pdash-overview-right">
              <div className="pdash-card pdash-health-summary">
                  <div className="pdash-card-title"><span role="img" aria-label="heart">&#10084;&#65039;</span> Health Summary</div>
                  <div className="pdash-summary-row">
                    <div className="pdash-summary-box pdash-summary-allergy">
                      <div className="pdash-summary-num">{allergies.length}</div>
                      <div className="pdash-summary-label">Known Allergies</div>
                    </div>
                    <div className="pdash-summary-box pdash-summary-med">
                      <div className="pdash-summary-num">{medications.length}</div>
                      <div className="pdash-summary-label">Current Medications</div>
                    </div>
                    <div className="pdash-summary-box pdash-summary-history">
                      <div className="pdash-summary-num">{medicalHistory.length}</div>
                      <div className="pdash-summary-label">Medical History</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'medical' && (
          <div className="pdash-medical-row">
            <div className="pdash-card pdash-medical-history">
              <div className="pdash-card-title"><span role="img" aria-label="history">&#128138;</span> Medical History</div>
              <div className="pdash-card-desc">Add and manage your medical history</div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.7rem'}}>
                <input
                  className="pdash-input"
                  placeholder="Add medical record..."
                  value={medicalInput}
                  onChange={e => setMedicalInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddMedical(); }}
                />
                <button className="pdash-add-btn" type="button" onClick={handleAddMedical}>+</button>
              </div>
              <div className="pdash-medical-list pdash-medical-list-green">
                {medicalHistory.map((item) => (
                  <div className="pdash-medical-item" key={item}>
                    {item} <span className="pdash-trash" style={{cursor:'pointer'}} onClick={() => handleDeleteMedical(item)}>&#128465;</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pdash-card pdash-allergies">
              <div className="pdash-card-title"><span role="img" aria-label="allergy">&#9888;&#65039;</span> Allergies</div>
              <div className="pdash-card-desc">Track your known allergies</div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.7rem'}}>
                <input
                  className="pdash-input"
                  placeholder="Add allergy..."
                  value={allergyInput}
                  onChange={e => setAllergyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddAllergy(); }}
                />
                <button className="pdash-add-btn" type="button" onClick={handleAddAllergy}>+</button>
              </div>
              <div className="pdash-medical-list pdash-medical-list-red">
                {allergies.map((item) => (
                  <div className="pdash-medical-item" key={item}>
                    {item} <span className="pdash-trash" style={{cursor:'pointer'}} onClick={() => handleDeleteAllergy(item)}>&#128465;</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pdash-card pdash-meds">
              <div className="pdash-card-title"><span role="img" aria-label="meds">&#128138;</span> Current Medications</div>
              <div className="pdash-card-desc">Manage your current medications</div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.7rem'}}>
                <input
                  className="pdash-input"
                  placeholder="Add medication..."
                  value={medicationInput}
                  onChange={e => setMedicationInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddMedication(); }}
                />
                <button className="pdash-add-btn" type="button" onClick={handleAddMedication}>+</button>
              </div>
              <div className="pdash-medical-list pdash-medical-list-purple">
                {medications.map((item) => (
                  <div className="pdash-medical-item" key={item}>
                    {item} <span className="pdash-trash" style={{cursor:'pointer'}} onClick={() => handleDeleteMedication(item)}>&#128465;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="doc-app-modal-overlay">
            <div className="doc-app-modal">
              <div className="doc-app-modal-header">
                <span className="doc-app-modal-title"><span className="icon">&#128197;</span> Schedule New Appointment</span>
                <button className="doc-app-modal-close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="doc-app-modal-desc">Fill in the details below to schedule your appointment. We'll confirm your request shortly.</div>
              <form className="doc-app-modal-form" onSubmit={handleSchedule}>
                <label className="doc-app-modal-label">&#129658; Department *</label>
                <select name="department" value={form.department} onChange={handleFormChange} required>
                  <option value="">Select department</option>
                  {departmentsList.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <label className="doc-app-modal-label">&#128104;&#8205;&#127891; Preferred Doctor *</label>
                <select name="doctor" value={form.doctor} onChange={handleFormChange} required>
                  <option value="">Select doctor</option>
                  {doctorsList.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
                <label className="doc-app-modal-label">&#128197; Appointment Date *</label>
                <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
                <label className="doc-app-modal-label">&#128337; Preferred Time *</label>
                <select name="time" value={form.time} onChange={handleFormChange} required>
                  <option value="">Select time slot</option>
                  {timeslotsList.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <label className="doc-app-modal-label">Appointment Type *</label>
                <select name="type" value={form.type} onChange={handleFormChange} required>
                  <option value="">Select appointment type</option>
                  {appointmentTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                </select>
                <label className="doc-app-modal-label">Reason for Visit *</label>
                <textarea name="reason" value={form.reason} onChange={handleFormChange} required placeholder="Please describe your symptoms or reason for the appointment..." />
                <div className="doc-app-modal-actions">
                  <button type="button" className="doc-app-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="doc-app-modal-submit">Schedule Appointment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
