// Dummy data for dropdowns
const patientsList = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'Robert Williams',
  'Jessica Davis',
];
const doctorsList = [
  'Dr. Smith',
  'Dr. Patel',
  'Dr. Lee',
  'Dr. Brown',
];
const departmentsList = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
];
const timeslotsList = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:30', '16:00', '16:30',
];
const appointmentTypes = [
  'consultation',
  'follow-up',
  'procedure',
];
import React, { useState } from 'react';
import './DoctorAppointments.css';

const initialAppointments = [
  { date: 'Mar 25, 2024', time: '09:00', patient: 'Sarah Johnson', type: 'follow-up', dept: 'General Medicine', status: 'completed' },
  { date: 'Mar 25, 2024', time: '10:30', patient: 'Michael Chen', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 26, 2024', time: '14:00', patient: 'Emily Rodriguez', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 24, 2024', time: '11:00', patient: 'Robert Williams', type: 'procedure', dept: 'General Medicine', status: 'completed' },
  { date: 'Mar 27, 2024', time: '15:30', patient: 'Jessica Davis', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 22, 2024', time: '10:00', patient: 'Sarah Johnson', type: 'consultation', dept: 'General Medicine', status: 'cancelled' },
  { date: 'Mar 23, 2024', time: '09:30', patient: 'Michael Chen', type: 'follow-up', dept: 'General Medicine', status: 'no-show' },
];

const typeColors = {
  'follow-up': 'type-follow',
  'consultation': 'type-consult',
  'procedure': 'type-proc',
};
const statusColors = {
  'scheduled': 'status-scheduled',
  'completed': 'status-completed',
  'cancelled': 'status-cancelled',
  'no-show': 'status-noshow',
};

export default function DoctorAppointments() {
  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedForm, setSchedForm] = useState({
    patient: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    type: '',
    reason: '',
  });
  const [schedError, setSchedError] = useState({});

  const openScheduleModal = () => {
    setSchedForm({ patient: '', department: '', doctor: '', date: '', time: '', type: '', reason: '' });
    setSchedError({});
    setShowScheduleModal(true);
  };
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSchedError({});
  };
  const handleSchedChange = (field, value) => {
    setSchedForm(f => ({ ...f, [field]: value }));
    setSchedError(e => ({ ...e, [field]: '' }));
  };
  const validateSched = () => {
    const err = {};
    if (!schedForm.patient) err.patient = 'Required';
    if (!schedForm.department) err.department = 'Required';
    if (!schedForm.doctor) err.doctor = 'Required';
    if (!schedForm.date) err.date = 'Required';
    if (!schedForm.time) err.time = 'Required';
    if (!schedForm.type) err.type = 'Required';
    if (!schedForm.reason.trim()) err.reason = 'Required';
    setSchedError(err);
    return Object.keys(err).length === 0;
  };
  const handleSchedule = () => {
    if (!validateSched()) return;
    setAppointments(appts => [
      ...appts,
      {
        date: schedForm.date,
        time: schedForm.time,
        patient: schedForm.patient,
        type: schedForm.type,
        dept: schedForm.department,
        status: 'scheduled',
        doctor: schedForm.doctor,
        reason: schedForm.reason,
      },
    ]);
    closeScheduleModal();
  };
  const [tab, setTab] = useState('all');
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelIdx, setCancelIdx] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Helper functions for date filtering
  function isToday(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }
  function isThisWeek(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d >= startOfWeek && d <= endOfWeek;
  }
  function isUpcoming(dateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    return d > today;
  }

  // Filtered appointments with tab logic
  const filteredAppointments = appointments.filter(appt => {
    // Convert date string to ISO if needed
    let apptDate = appt.date;
    // Try to parse as ISO, fallback to parsing as 'MMM DD, YYYY'
    let d = new Date(apptDate);
    if (isNaN(d)) {
      // Try parsing as 'Mar 25, 2024'
      const parts = apptDate.match(/([A-Za-z]+) (\d{1,2}), (\d{4})/);
      if (parts) {
        d = new Date(`${parts[3]}-${('0'+(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[1])+1)).slice(-2)}-${('0'+parts[2]).slice(-2)}`);
      }
    }
    // Tab filtering
    if (tab === 'today' && !isToday(d)) return false;
    if (tab === 'week' && !isThisWeek(d)) return false;
    if (tab === 'upcoming' && !isUpcoming(d)) return false;
    // Search, status, type filters
    const matchesSearch = appt.patient.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : appt.status === statusFilter;
    const matchesType = typeFilter === 'all' ? true : appt.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatus = (idx, newStatus) => {
    setAppointments(appts => appts.map((appt, i) => i === idx ? { ...appt, status: newStatus } : appt));
  };

  const openCancelModal = (idx) => {
    setCancelIdx(idx);
    setCancelReason('');
    setReasonError('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelIdx(null);
    setCancelReason('');
    setReasonError('');
  };

  const confirmCancel = () => {
    if (!cancelReason.trim()) {
      setReasonError('Please provide a reason for cancelling this appointment.');
      return;
    }
    handleStatus(cancelIdx, 'cancelled');
    closeCancelModal();
  };

  return (
    <>
      <div className="doc-app-main">
        <div className="doc-app-header-row">
          <div>
            <div className="doc-app-header-title">Appointments</div>
            <div className="doc-app-header-desc">View and filter all appointments</div>
          </div>
          <button className="doc-app-schedule-btn" onClick={openScheduleModal}>+ Schedule Appointment</button>
      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="doc-app-modal-overlay">
          <div className="doc-app-modal" style={{maxWidth: 500, width: '100%', padding: 28}}>
            <div className="doc-app-modal-header">
              <span className="doc-app-modal-icon" style={{color:'#3b5bdb',fontSize:'1.5rem'}}>&#128197;</span>
              <span className="doc-app-modal-title" style={{color:'#222',fontWeight:600,fontSize:'1.18rem'}}>Schedule New Appointment</span>
              <button className="doc-app-modal-close" onClick={closeScheduleModal}>&times;</button>
            </div>
            <div style={{color:'#6c757d',fontSize:'1rem',marginBottom:18}}>Fill in the details below to schedule your appointment. We'll confirm your request shortly.</div>
            <form onSubmit={e=>{e.preventDefault();handleSchedule();}}>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">&#128100; Select Patient <span style={{color:'red'}}>*</span></label>
                <select className="doc-app-modal-textarea" value={schedForm.patient} onChange={e=>handleSchedChange('patient',e.target.value)}>
                  <option value="">Choose a patient</option>
                  {patientsList.map(p=>(<option key={p} value={p}>{p}</option>))}
                </select>
                {schedError.patient && <div className="doc-app-modal-error">{schedError.patient}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">&#129658; Department <span style={{color:'red'}}>*</span></label>
                <select className="doc-app-modal-textarea" value={schedForm.department} onChange={e=>handleSchedChange('department',e.target.value)}>
                  <option value="">Select department</option>
                  {departmentsList.map(d=>(<option key={d} value={d}>{d}</option>))}
                </select>
                {schedError.department && <div className="doc-app-modal-error">{schedError.department}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">&#128104;&#8205;&#127891; Preferred Doctor <span style={{color:'red'}}>*</span></label>
                <select className="doc-app-modal-textarea" value={schedForm.doctor} onChange={e=>handleSchedChange('doctor',e.target.value)}>
                  <option value="">Select a doctor</option>
                  {doctorsList.map(d=>(<option key={d} value={d}>{d}</option>))}
                </select>
                {schedError.doctor && <div className="doc-app-modal-error">{schedError.doctor}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">&#128197; Appointment Date <span style={{color:'red'}}>*</span></label>
                <input className="doc-app-modal-textarea" type="date" value={schedForm.date} onChange={e=>handleSchedChange('date',e.target.value)} placeholder="dd-mm-yyyy" style={{color:schedForm.date?'#222':'#888'}} />
                {schedError.date && <div className="doc-app-modal-error">{schedError.date}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">&#128337; Preferred Time <span style={{color:'red'}}>*</span></label>
                <select className="doc-app-modal-textarea" value={schedForm.time} onChange={e=>handleSchedChange('time',e.target.value)}>
                  <option value="">Select time slot</option>
                  {timeslotsList.map(t=>(<option key={t} value={t}>{t}</option>))}
                </select>
                {schedError.time && <div className="doc-app-modal-error">{schedError.time}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">Appointment Type <span style={{color:'red'}}>*</span></label>
                <select className="doc-app-modal-textarea" value={schedForm.type} onChange={e=>handleSchedChange('type',e.target.value)}>
                  <option value="">Select appointment type</option>
                  {appointmentTypes.map(t=>(<option key={t} value={t}>{t}</option>))}
                </select>
                {schedError.type && <div className="doc-app-modal-error">{schedError.type}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label className="doc-app-modal-label">Reason for Visit <span style={{color:'red'}}>*</span></label>
                <textarea className="doc-app-modal-textarea" value={schedForm.reason} onChange={e=>handleSchedChange('reason',e.target.value)} placeholder="Please describe your symptoms or reason for the appointment..." rows={2} maxLength={500} />
                <div className="doc-app-modal-charcount">{schedForm.reason.length}/500 characters</div>
                {schedError.reason && <div className="doc-app-modal-error">{schedError.reason}</div>}
              </div>
              <div className="doc-app-modal-actions">
                <button type="button" className="doc-app-modal-keep" onClick={closeScheduleModal}>Cancel</button>
                <button type="submit" className="doc-app-modal-cancel" style={{background:'linear-gradient(90deg,#3b5bdb 0%,#a259ff 100%)',color:'#fff'}}>Schedule Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
        <div className="doc-app-filters-row">
          <span className="doc-app-filters-label">Filters:</span>
          <input
            className="doc-app-search"
            placeholder="Search by patient name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="doc-app-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
          <select
            className="doc-app-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="follow-up">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
          </select>
        </div>
        <div className="doc-app-card">
          <div className="doc-app-tab-bar">
            <button className={tab==='all' ? 'active' : ''} onClick={()=>setTab('all')}>All</button>
            <button className={tab==='today' ? 'active' : ''} onClick={()=>setTab('today')}>Today</button>
            <button className={tab==='week' ? 'active' : ''} onClick={()=>setTab('week')}>Week</button>
            <button className={tab==='upcoming' ? 'active' : ''} onClick={()=>setTab('upcoming')}>Upcoming</button>
          </div>
          <div className="doc-app-table-wrap">
            <table className="doc-app-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt, idx) => {
                  // Find the real index in appointments for actions
                  const realIdx = appointments.findIndex(a => a === appt);
                  return (
                    <tr key={realIdx}>
                      <td>
                        <div>{appt.date}</div>
                        <div className="doc-app-time">@ {appt.time}</div>
                      </td>
                      <td><span className="doc-app-patient-icon">👤</span> {appt.patient}</td>
                      <td><span className={`doc-app-type-pill ${typeColors[appt.type]}`}>{appt.type}</span></td>
                      <td>{appt.dept}</td>
                      <td><span className={`doc-app-status-pill ${statusColors[appt.status]}`}>{appt.status}</span></td>
                      <td>
                        {appt.status === 'scheduled' && <>
                          <button className="doc-app-action-btn action-complete" onClick={() => handleStatus(realIdx, 'completed')}>Complete</button>
                          <button className="doc-app-action-btn action-noshow" onClick={() => handleStatus(realIdx, 'no-show')}>No Show</button>
                          <button className="doc-app-action-btn action-cancel" onClick={() => openCancelModal(realIdx)}>&#10005; Cancel</button>
                        </>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="doc-app-modal-overlay">
          <div className="doc-app-modal">
            <div className="doc-app-modal-header">
              <span className="doc-app-modal-icon">&#9888;</span>
              <span className="doc-app-modal-title">Cancel Appointment</span>
              <button className="doc-app-modal-close" onClick={closeCancelModal}>&times;</button>
            </div>
            <div className="doc-app-modal-sub">This action cannot be undone.</div>
            <div className="doc-app-modal-info">
              <div><b>Patient:</b> {cancelIdx !== null && appointments[cancelIdx].patient}</div>
              <div><b>Appointment:</b> {cancelIdx !== null && `${appointments[cancelIdx].date} ${appointments[cancelIdx].time}`}</div>
              <div><b>ID:</b> #{cancelIdx !== null ? cancelIdx + 1 : ''}</div>
            </div>
            <div className="doc-app-modal-label">Reason for cancellation <span style={{color:'red'}}>*</span></div>
            <textarea
              className="doc-app-modal-textarea"
              placeholder="Please provide a reason for cancelling this appointment..."
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setReasonError(''); }}
              maxLength={500}
              rows={3}
            />
            <div className="doc-app-modal-charcount">{cancelReason.length}/500 characters</div>
            {reasonError && <div className="doc-app-modal-error">{reasonError}</div>}
            <div className="doc-app-modal-actions">
              <button className="doc-app-modal-keep" onClick={closeCancelModal}>Keep Appointment</button>
              <button className="doc-app-modal-cancel" onClick={confirmCancel}>Cancel Appointment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
