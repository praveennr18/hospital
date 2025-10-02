import React from 'react';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';

export default function AdminDashboard({ setAdminLoggedIn }) {
  const { patients, doctors, appointments } = useAdminData();
  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  // Appointments with date matching today
  const todaysAppointments = appointments.filter(a => {
    let d = new Date(a.date);
    if (isNaN(d)) {
      const parts = a.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (parts) {
        d = new Date(`${parts[3]}-${('0'+parts[1]).slice(-2)}-${('0'+parts[2]).slice(-2)}`);
      }
    }
    return d.toISOString().slice(0, 10) === todayStr;
  });

  return (
    <AdminLayout active="dashboard" setAdminLoggedIn={setAdminLoggedIn}>
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-header-desc">Overview of hospital operations and metrics</div>
      </header>
      <div className="admin-cards-row">
        <div className="admin-card">
          <div className="admin-card-title">Total Patients</div>
          <div className="admin-card-value">{patients.length}</div>
          <div className="admin-card-desc">Registered patients</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Today's Appointments</div>
          <div className="admin-card-value">{todaysAppointments.length}</div>
          <div className="admin-card-desc">Scheduled today</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Total Doctors</div>
          <div className="admin-card-value">{doctors.length}</div>
          <div className="admin-card-desc">Medical staff</div>
        </div>
      </div>
      <div className="admin-schedule">
        <div className="admin-schedule-title">Today's Schedule</div>
        <div className="admin-schedule-desc">Appointments scheduled for today</div>
        <div className="admin-schedule-list">
          {todaysAppointments.length === 0 ? (
            <div className="admin-schedule-item">No appointments scheduled for today.</div>
          ) : (
            todaysAppointments.map((a, i) => (
              <div className={`admin-schedule-item ${i%2===0?'blue':'green'}`}> {/* Color alternates for demo */}
                <div className="admin-schedule-time">{a.time}</div>
                <div className="admin-schedule-patient">{a.patient}</div>
                <div className="admin-schedule-type">{a.type}</div>
                <div className="admin-schedule-doctor">{a.doctor}</div>
                <div className={`admin-schedule-status ${a.status.toLowerCase()}`}>{a.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
