import React, { useState } from 'react';
import './Appointments.css';

const appointments = [
  { date: 'Mar 25, 2024', time: '09:00', doctor: 'Dr. Smith', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 25, 2024', time: '10:30', doctor: 'Dr. Johnson', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 26, 2024', time: '14:00', doctor: 'Dr. Brown', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 24, 2024', time: '11:00', doctor: 'Dr. Wilson', type: 'procedure', dept: 'General Medicine', status: 'completed' },
  { date: 'Mar 27, 2024', time: '15:30', doctor: 'Dr. Lee', type: 'consultation', dept: 'General Medicine', status: 'scheduled' },
  { date: 'Mar 22, 2024', time: '10:00', doctor: 'Dr. Smith', type: 'consultation', dept: 'General Medicine', status: 'cancelled' },
  { date: 'Mar 23, 2024', time: '09:30', doctor: 'Dr. Johnson', type: 'follow-up', dept: 'General Medicine', status: 'no-show' },
  { date: 'Mar 21, 2024', time: '16:00', doctor: 'Dr. Brown', type: 'consultation', dept: 'General Medicine', status: 'cancelled' },
  { date: 'Apr 5, 2024', time: '11:30', doctor: 'Dr. Wilson', type: 'follow-up', dept: 'General Medicine', status: 'scheduled' },
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

  // Get unique statuses and types for dropdowns
  const statusOptions = Array.from(new Set(appointments.map(a => a.status)));
  const typeOptions = Array.from(new Set(appointments.map(a => a.type)));

  // Helper to parse date string to Date object
  const parseDate = (dateStr) => {
    // Handles 'Mar 25, 2024' format
    return new Date(Date.parse(dateStr));
  };

  // Date helpers
  const today = new Date();
  today.setHours(0,0,0,0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Filtering logic
  let filtered = appointments.filter(a => {
    // Search filter
    const searchText = search.toLowerCase();
    if (searchText && !(
      a.doctor.toLowerCase().includes(searchText) ||
      a.type.toLowerCase().includes(searchText) ||
      a.dept.toLowerCase().includes(searchText) ||
      a.status.toLowerCase().includes(searchText) ||
      a.date.toLowerCase().includes(searchText)
    )) return false;
    // Status filter
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    // Type filter
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    // Tab filter
    const apptDate = parseDate(a.date);
    if (tab === 'today') {
      if (apptDate.getTime() !== today.getTime()) return false;
    } else if (tab === 'week') {
      if (apptDate < weekStart || apptDate > weekEnd) return false;
    } else if (tab === 'upcoming') {
      if (apptDate <= today) return false;
    }
    return true;
  });
  return (
    <div className="appt-main">
      <div className="appt-header-row">
        <div>
          <div className="appt-header-title">Appointments</div>
          <div className="appt-header-desc">View and filter all appointments</div>
        </div>
        <button className="appt-schedule-btn">+ Schedule Appointment</button>
      </div>
      <div className="appt-filters-row">
        <input
          className="appt-search"
          placeholder="Filters: Search appointments..."
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
    </div>
  );
}
