import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Appointments.css';

const departmentsList = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
];
const doctorsList = [
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

const appointments = [
  { date: '2024-03-25', time: '09:00', doctor: 'Dr. Smith', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
  { date: '2024-03-25', time: '10:30', doctor: 'Dr. Johnson', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: '2024-03-26', time: '14:00', doctor: 'Dr. Brown', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
  { date: '2024-03-24', time: '11:00', doctor: 'Dr. Wilson', type: 'procedure', dept: 'General Medicine', status: 'completed' },
  { date: '2024-03-27', time: '15:30', doctor: 'Dr. Lee', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: '2024-03-22', time: '10:00', doctor: 'Dr. Smith', type: 'consultation', dept: 'General Medicine', status: 'cancelled' },
  { date: '2024-03-23', time: '09:30', doctor: 'Dr. Johnson', type: 'follow-up', dept: 'General Medicine', status: 'no-show' },
  { date: '2024-03-21', time: '16:00', doctor: 'Dr. Brown', type: 'consultation', dept: 'General Medicine', status: 'cancelled' },
  { date: '2024-04-05', time: '11:30', doctor: 'Dr. Wilson', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
];

const typeColors = {
  'follow-up': 'appt-type-follow',
  'consultation': 'appt-type-consult',
  'procedure': 'appt-type-proc',
};
const statusColors = {
  'scheduled': 'appt-status-scheduled',
  'completed': 'appt-status-completed',
  'cancelled': 'appt-status-cancelled',
  'no-show': 'appt-status-noshow',
};

export default function Appointments() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    department: '',
    doctor: '',
    date: '',
    time: '',
    type: '',
    reason: '',
  });
  const [appointmentsList, setAppointmentsList] = useState(appointments);
  const navigate = useNavigate();

  const statusOptions = Array.from(new Set(appointments.map(a => a.status)));
  const typeOptions = Array.from(new Set(appointments.map(a => a.type)));

  const parseDate = (dateStr) => {
    // Accepts formats like 'Mar 25, 2024' and '2024-03-25'
    if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      // ISO format from input[type=date]
      return new Date(dateStr + 'T00:00:00');
    }
    return new Date(Date.parse(dateStr));
  };
  const today = new Date(); today.setHours(0,0,0,0);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

  // Filtering logic
  let filtered = appointmentsList.filter(a => {
    // Doctor name filter (search input)
    const doctorSearch = search.trim().toLowerCase();
    if (doctorSearch && !a.doctor.toLowerCase().includes(doctorSearch)) return false;
    // Status filter
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    // Type filter
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    // Tab filter
    const apptDate = parseDate(a.date);
    // Normalize to midnight for comparison
    const apptDateMidnight = new Date(apptDate); apptDateMidnight.setHours(0,0,0,0);
    if (tab === 'today') {
      if (apptDateMidnight.getTime() !== today.getTime()) return false;
    } else if (tab === 'week') {
      if (apptDateMidnight < weekStart || apptDateMidnight > weekEnd) return false;
    } else if (tab === 'upcoming') {
      if (apptDateMidnight <= today) return false;
    }
    return true;
  });

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSchedule = (e) => {
    e.preventDefault();
    // Add new appointment to the list
    setAppointmentsList([
      ...appointmentsList,
      {
        date: form.date,
        time: form.time,
        doctor: form.doctor,
        type: form.type,
        dept: form.department,
        status: 'scheduled',
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
          <button className="pdash-nav-link" onClick={() => navigate('/')}>Dashboard</button>
          <button className="pdash-nav-link active">Appointments</button>
        </nav>
        <div className="pdash-sidebar-bottom">
          <div className="pdash-user">Welcome, John Doe</div>
          <button className="pdash-logout" onClick={() => navigate('/login')}>&#x1F6AA; Logout</button>
        </div>
      </aside>
      <main className="pdash-main">
        <div className="appt-header-row">
          <div>
            <div className="appt-header-title">Appointments</div>
            <div className="appt-header-desc">View and filter all appointments</div>
          </div>
          <button className="appt-schedule-btn" onClick={() => setShowModal(true)}>+ Schedule Appointment</button>
        </div>
        <div className="appt-filters-row">
          <input
            className="appt-search"
            placeholder="Search appointments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="appt-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
          <select
            className="appt-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {typeOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="appt-card">
          <div className="appt-tab-bar">
            <button className={tab==='all' ? 'active' : ''} onClick={()=>setTab('all')}>All</button>
            <button className={tab==='today' ? 'active' : ''} onClick={()=>setTab('today')}>Today</button>
            <button className={tab==='week' ? 'active' : ''} onClick={()=>setTab('week')}>Week</button>
            <button className={tab==='upcoming' ? 'active' : ''} onClick={()=>setTab('upcoming')}>Upcoming</button>
          </div>
          <table className="appt-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center',color:'#888'}}>No appointments found.</td></tr>
              ) : (
                filtered.map((a, i) => (
                  <tr key={i}>
                    <td><span className="appt-date">{a.date}</span><br /><span className="appt-time">&#128337; {a.time}</span></td>
                    <td><span className="appt-doc-icon">&#128100;</span> {a.doctor}</td>
                    <td><span className={`appt-type-badge ${typeColors[a.type]}`}>{a.type}</span></td>
                    <td>{a.dept}</td>
                    <td><span className={`appt-status-badge ${statusColors[a.status]}`}>{a.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
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
    </div>
  );
}
