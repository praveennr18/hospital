import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorAvailability from './DoctorAvailability';

const todaySchedule = [
  { time: '09:00 AM', name: 'John Smith', type: 'Consultation', color: 'consult' },
  { time: '10:30 AM', name: 'Mary Johnson', type: 'Follow-up', color: 'follow' },
  { time: '02:00 PM', name: 'David Wilson', type: 'Check-up', color: 'check' },
  { time: '03:30 PM', name: 'Sarah Davis', type: 'Procedure', color: 'procedure' },
];

export default function DoctorDashboard({ onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="doc-layout">
      <aside className="doc-sidebar">
        <div className="doc-logo-row">
          <span className="doc-logo-icon">&#8963;</span>
          <span className="doc-logo-text">HealthCare Pro</span>
        </div>
        <nav className="doc-nav">
          <button className="doc-nav-link" onClick={()=>navigate('/doctor')}>Dashboard</button>
          <button className="doc-nav-link" onClick={()=>navigate('/doctor/appointments')}>Appointments</button>
          <button className="doc-nav-link" onClick={()=>navigate('/doctor/patients')}>Patients</button>
          <button className="doc-nav-link" onClick={()=>navigate('/doctor/availability')}>Availability</button>
        </nav>
        <div className="doc-sidebar-bottom">
          <div className="doc-user">Welcome, Dr. Sarah Wilson</div>
          <button className="doc-logout" onClick={onLogout}>&#x1F6AA; Logout</button>
        </div>
      </aside>
      <main className="doc-main">
        <Routes>
          <Route path="" element={
            <>
              <div className="doc-header-row">
                <div>
                  <div className="doc-header-title">Doctor Dashboard</div>
                  <div className="doc-header-desc">Manage your patients and schedule</div>
                </div>
                <div className="doc-header-tags">
                  <span className="doc-tag doc-tag-green">Cardiology</span>
                  <span className="doc-tag doc-tag-blue">Doctor</span>
                </div>
              </div>
              <div className="doc-summary-row">
                <div className="doc-summary-card">
                  <div className="doc-summary-icon"><span role="img" aria-label="patients">👥</span></div>
                  <div className="doc-summary-main">8</div>
                  <div className="doc-summary-label">Today's Patients</div>
                  <div className="doc-summary-desc">Scheduled appointments</div>
                </div>
              </div>
              <div className="doc-schedule-card">
                <div className="doc-schedule-header">
                  <span className="doc-schedule-title">Today's Schedule</span>
                  <span className="doc-schedule-desc">Your appointments for today</span>
                </div>
                <div className="doc-schedule-list">
                  {todaySchedule.map((appt, idx) => (
                    <div key={idx} className={`doc-appt-row doc-appt-${appt.color}`}>
                      <div className="doc-appt-time">
                        <span className={`doc-appt-time-icon doc-appt-time-icon-${appt.color}`}></span>
                        <span className="doc-appt-time-text">{appt.time}</span>
                      </div>
                      <div className="doc-appt-name">{appt.name}</div>
                      <div className={`doc-appt-type-pill doc-appt-type-pill-${appt.color}`}>{appt.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          } />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="availability" element={<DoctorAvailability />} />
        </Routes>
      </main>
    </div>
  );
}
