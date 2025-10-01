import React from 'react';
import './AppointmentsManagement.css';
import AdminLayout from './AdminLayout';
import './AppointmentsManagement.css';

const appointments = [
  { id: 1, patient: 'Sarah Johnson', patientInitials: 'SJ', doctor: 'Dr. Smith', date: '3/25/2024', time: '09:00', type: 'Follow-Up', status: 'Scheduled' },
  { id: 2, patient: 'Michael Chen', patientInitials: 'MC', doctor: 'Dr. Johnson', date: '3/25/2024', time: '10:30', type: 'Consultation', status: 'Scheduled' },
  { id: 3, patient: 'Emily Rodriguez', patientInitials: 'ER', doctor: 'Dr. Brown', date: '3/26/2024', time: '14:00', type: 'Follow-Up', status: 'Scheduled' },
  { id: 4, patient: 'Robert Williams', patientInitials: 'RW', doctor: 'Dr. Wilson', date: '3/24/2024', time: '11:00', type: 'Procedure', status: 'Completed' },
  { id: 5, patient: 'Jessica Davis', patientInitials: 'JD', doctor: 'Dr. Lee', date: '3/27/2024', time: '15:30', type: 'Consultation', status: 'Scheduled' },
  { id: 6, patient: 'Sarah Johnson', patientInitials: 'SJ', doctor: 'Dr. Smith', date: '3/22/2024', time: '10:00', type: 'Consultation', status: 'Cancelled' },
  { id: 7, patient: 'Michael Chen', patientInitials: 'MC', doctor: 'Dr. Johnson', date: '3/23/2024', time: '09:30', type: 'Follow-Up', status: 'No-Show' },
  { id: 8, patient: 'Emily Rodriguez', patientInitials: 'ER', doctor: 'Dr. Brown', date: '3/21/2024', time: '16:00', type: 'Consultation', status: 'Cancelled' },
  { id: 9, patient: 'Robert Williams', patientInitials: 'RW', doctor: 'Dr. Wilson', date: '4/5/2024', time: '11:30', type: 'Follow-Up', status: 'Scheduled' },
  { id: 10, patient: 'Jessica Davis', patientInitials: 'JD', doctor: 'Dr. Lee', date: '4/10/2024', time: '13:00', type: 'Consultation', status: 'Scheduled' },
];

const statusClass = status => {
  switch (status) {
    case 'Scheduled': return 'status scheduled';
    case 'Completed': return 'status completed';
    case 'Cancelled': return 'status cancelled';
    case 'No-Show': return 'status noshow';
    default: return 'status';
  }
};

function AppointmentsManagement({ setAdminLoggedIn }) {
  const [showModal, setShowModal] = React.useState(false);
  const [appointmentsState, setAppointmentsState] = React.useState(appointments);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const [tab, setTab] = React.useState('All');
  const statusOptions = Array.from(new Set(appointmentsState.map(a => a.status)));
  const typeOptions = Array.from(new Set(appointmentsState.map(a => a.type)));

  // Helper to parse date string (assume format: YYYY-MM-DD or similar)
  function parseDate(dateStr) {
    // Try to parse as ISO, fallback to Date constructor
    return new Date(dateStr);
  }

  // Date filter logic
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  function isToday(dateStr) {
    return dateStr === todayStr;
  }
  function isThisWeek(dateStr) {
    const d = parseDate(dateStr);
    return d >= startOfWeek && d <= endOfWeek;
  }
  function isUpcoming(dateStr) {
    const d = parseDate(dateStr);
    return d > now;
  }

  // Tab filter logic
  function tabFilter(a) {
    if (tab === 'All') return true;
    if (tab === 'Today') return isToday(a.date);
    if (tab === 'Week') return isThisWeek(a.date);
    if (tab === 'Upcoming') return isUpcoming(a.date);
    return true;
  }

  // Filtered lists for counts
  const filteredAll = appointmentsState.filter(a => {
    const matchesSearch = a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id).includes(search);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  const filteredToday = filteredAll.filter(a => isToday(a.date));
  const filteredWeek = filteredAll.filter(a => isThisWeek(a.date));
  const filteredUpcoming = filteredAll.filter(a => isUpcoming(a.date));
  const filtered = filteredAll.filter(tabFilter);

  // Modal form state
  const [form, setForm] = React.useState({
    patient: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    type: '',
    reason: '',
  });
  const [formError, setFormError] = React.useState('');

  // Dummy patient/doctor/type/department options (replace with real data if available)
  const patientOptions = [
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'Robert Williams',
    'Jessica Davis',
  ];
  const doctorOptions = [
    'Dr. Brown',
    'Dr. Smith',
    'Dr. Lee',
    'Dr. Patel',
  ];
  const departmentOptions = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'General Medicine',
  ];
  const typeOptionsForm = [
    'Consultation',
    'Follow-Up',
    'Procedure',
  ];

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    // Validate
    if (!form.patient || !form.department || !form.doctor || !form.date || !form.time || !form.type || !form.reason) {
      setFormError('Please fill all required fields.');
      return;
    }
    // Add new appointment
    const newId = appointmentsState.length ? Math.max(...appointmentsState.map(a => a.id)) + 1 : 1;
    const newAppointment = {
      id: newId,
      patient: form.patient,
      patientInitials: getInitials(form.patient),
      doctor: form.doctor,
      date: form.date,
      time: form.time,
      type: form.type,
      status: 'Scheduled',
      department: form.department,
      reason: form.reason,
    };
    setAppointmentsState([newAppointment, ...appointmentsState]);
    setShowModal(false);
    setForm({ patient: '', department: '', doctor: '', date: '', time: '', type: '', reason: '' });
    setFormError('');
  }
  return (
    <AdminLayout active="appointments" setAdminLoggedIn={setAdminLoggedIn}>
      <div className="appointments-mgmt-container">
        <div className="appointments-mgmt-header">
          <div>
            <h1>Appointment Management</h1>
            <p>Monitor and manage all appointments across the system</p>
          </div>
          <button className="schedule-btn" onClick={() => setShowModal(true)}>+ Schedule Appointment</button>
        </div>
        <div className="appointments-mgmt-card">
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Schedule New Appointment</h2>
                <form className="appt-form" onSubmit={handleFormSubmit}>
                  <label>
                    <span>Patient *</span>
                    <select name="patient" value={form.patient} onChange={handleFormChange} required>
                      <option value="">Choose a patient</option>
                      {patientOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Department *</span>
                    <select name="department" value={form.department} onChange={handleFormChange} required>
                      <option value="">Select department</option>
                      {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Preferred Doctor *</span>
                    <select name="doctor" value={form.doctor} onChange={handleFormChange} required>
                      <option value="">Select a doctor</option>
                      {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Appointment Date *</span>
                    <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
                  </label>
                  <label>
                    <span>Preferred Time *</span>
                    <input name="time" type="time" value={form.time} onChange={handleFormChange} required />
                  </label>
                  <label>
                    <span>Appointment Type *</span>
                    <select name="type" value={form.type} onChange={handleFormChange} required>
                      <option value="">Select appointment type</option>
                      {typeOptionsForm.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Reason for Visit *</span>
                    <textarea name="reason" value={form.reason} onChange={handleFormChange} required placeholder="Please describe your symptoms or reason for the appointment..." />
                  </label>
                  {formError && <div className="form-error">{formError}</div>}
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="schedule-btn-modal">Schedule Appointment</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="appointments-mgmt-card-header">
            <div>
              <h2>Appointment Overview</h2>
              <span>View and filter all appointments in the system</span>
            </div>
          </div>
          <div className="appointments-mgmt-filters">
            <input
              className="search-input"
              placeholder="Search by patient, doctor, or appointment ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="appointments-mgmt-tabs">
            <button className={`tab${tab === 'All' ? ' active' : ''}`} onClick={() => setTab('All')}>All ({filteredAll.length})</button>
            <button className={`tab${tab === 'Today' ? ' active' : ''}`} onClick={() => setTab('Today')}>Today ({filteredToday.length})</button>
            <button className={`tab${tab === 'Week' ? ' active' : ''}`} onClick={() => setTab('Week')}>Week ({filteredWeek.length})</button>
            <button className={`tab${tab === 'Upcoming' ? ' active' : ''}`} onClick={() => setTab('Upcoming')}>Upcoming ({filteredUpcoming.length})</button>
          </div>
          <div className="appointments-mgmt-table-wrapper">
            <table className="appointments-mgmt-table">
              <thead>
                <tr>
                  <th>Appointment</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td>
                      <span className="patient-avatar">{a.patientInitials}</span>
                      {a.patient}
                    </td>
                    <td>{a.doctor}</td>
                    <td>
                      <span className="date-icon">&#128197;</span>
                      {a.date}<br /><span className="appt-time">{a.time}</span>
                    </td>
                    <td><span className="appt-type">{a.type}</span></td>
                    <td><span className={statusClass(a.status)}>{a.status}</span></td>
                    <td>
                      {a.status === 'Scheduled' ? (
                        <button className="cancel-btn">&#10006; Cancel</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AppointmentsManagement;