import React, { useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { formatTimeTo12Hour } from '../utils/time.js';

const zeroPad = (value) => value.toString().padStart(2, '0');

const toDateKey = (date) =>
  `${date.getFullYear()}-${zeroPad(date.getMonth() + 1)}-${zeroPad(date.getDate())}`;

const toReadableDate = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const parseAppointmentDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    const cloned = new Date(value.getTime());
    cloned.setHours(0, 0, 0, 0);
    return cloned;
  }

  const tryParse = (input) => {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
    return null;
  };

  let parsed = tryParse(value);
  if (parsed) return parsed;

  const slashMatch = typeof value === 'string' && value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    parsed = tryParse(`${year}-${zeroPad(month)}-${zeroPad(day)}`);
    if (parsed) return parsed;
  }

  return null;
};

export default function AdminDashboard({ setAdminLoggedIn }) {
  const [showModal, setShowModal] = useState(false);
  const { patients, doctors, appointments, addAppointment } = useAdminData();
  const today = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);

  const todayKey = useMemo(() => toDateKey(today), [today]);

  const todaysAppointments = useMemo(() => {
    return appointments
      .map((appointment) => {
        const parsedDate = parseAppointmentDate(appointment.date);
        if (!parsedDate) {
          return null;
        }

        return {
          original: appointment,
          dateKey: toDateKey(parsedDate),
        };
      })
      .filter((entry) => entry && entry.dateKey === todayKey)
      .map(({ original }) => original);
  }, [appointments, todayKey]);

  const todayReadable = useMemo(() => toReadableDate(today), [today]);

  return (
    <AdminLayout active="dashboard" setAdminLoggedIn={setAdminLoggedIn}>
      <header className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <div className="admin-header-desc">Overview of hospital operations and metrics</div>
        </div>
        <button 
          className="admin-schedule-btn"
          onClick={() => setShowModal(true)}
        >
          Schedule Appointment
        </button>
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
          <div className="admin-card-desc">On {todayReadable}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Total Doctors</div>
          <div className="admin-card-value">{doctors.length}</div>
          <div className="admin-card-desc">Medical staff</div>
        </div>
      </div>
      <div className="admin-schedule">
        <div className="admin-schedule-header">
          <div className="admin-schedule-title">Today's Schedule</div>
          <div className="admin-schedule-date">{todayReadable}</div>
        </div>
        <div className="admin-schedule-list">
          {todaysAppointments.length === 0 ? (
            <div className="admin-schedule-empty">
              <p>No appointments scheduled for today.</p>
              <button
                type="button"
                className="admin-empty-action-btn"
                onClick={() => setShowModal(true)}
              >
                Schedule First Appointment
              </button>
            </div>
          ) : (
            todaysAppointments.map((a, i) => (
              <div key={a.id || i} className={`admin-schedule-item ${i%2===0?'blue':'green'}`}> {/* Color alternates for demo */}
                <div className="admin-schedule-time">{formatTimeTo12Hour(a.time) || '—'}</div>
                <div className="admin-schedule-patient">{a.patient}</div>
                <div className="admin-schedule-type">{a.type}</div>
                <div className="admin-schedule-doctor">{a.doctor}</div>
                <div className={`admin-schedule-status ${(a.status || '').toLowerCase()}`}>{a.status || '—'}</div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {showModal && (
        <ScheduleAppointmentModal
          isOpen={showModal}
          userRole="admin"
          onClose={() => setShowModal(false)}
          onSuccess={(appointment) => {
            if (appointment) {
              addAppointment({
                id: appointment.id ?? Date.now(),
                patient: appointment.patient_name || appointment.patient || 'Unknown Patient',
                patientInitials: (appointment.patient_name || appointment.patient || 'UP')
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase(),
                doctor: appointment.doctor_name || appointment.doctor || 'Unknown Doctor',
                date: appointment.appointment_date || appointment.date || todayKey,
                time: formatTimeTo12Hour(appointment.preferred_time || appointment.time) || '—',
                type: appointment.appointment_type || appointment.type || 'Consultation',
                status: appointment.status || 'Scheduled',
              });
            }
            setShowModal(false);
          }}
        />
      )}
    </AdminLayout>
  );
}
