import React, { useMemo, useState } from 'react';
import logo from '../assets/healthcare_logo.png';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorAvailability from './DoctorAvailability';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { DoctorDataProvider, useDoctorData } from './DoctorDataContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/doctor' },
  { id: 'appointments', label: 'Appointments', path: '/doctor/appointments' },
  { id: 'patients', label: 'Patients', path: '/doctor/patients' },
  { id: 'availability', label: 'Availability', path: '/doctor/availability' },
];

const deriveScheduleState = (schedule = []) =>
  schedule.map((item) => {
    const rawType = (item.typeCode || item.type || 'consultation').toLowerCase();
    let typeVariant = 'consult';
    if (rawType.includes('follow')) typeVariant = 'follow';
    else if (rawType.includes('procedure')) typeVariant = 'procedure';
    else if (rawType.includes('check')) typeVariant = 'check';

    return {
      id: item.id,
      timeDisplay: item.timeDisplay || item.time || '',
      patientName: item.patient?.name || 'Unknown Patient',
      type: item.type || 'Consultation',
      statusLabel: item.statusLabel || 'Scheduled',
      typeVariant,
    };
  });

function DoctorDashboardShell({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    doctorInfo,
    todayStats,
    todaySchedule,
    dashboardLoading,
    errors,
    refreshDashboard,
  } = useDoctorData();
  const [showModal, setShowModal] = useState(false);

  const scheduleEntries = useMemo(() => deriveScheduleState(todaySchedule), [todaySchedule]);

  const activePath = location.pathname.replace(/\/$/, '');

  return (
    <div className="doc-layout">
      <aside className="doc-sidebar">
        <div className="doc-logo-row">
          <img
            src={logo}
            alt="HealthCare Pro Logo"
            style={{ height: 32, marginRight: 8, verticalAlign: 'middle' }}
          />
          <span className="doc-logo-text">HealthCare Pro</span>
        </div>
        <nav className="doc-nav">
          {NAV_ITEMS.map((item) => {
            const normalizedPath = item.path.replace(/\/$/, '');
            const isActive =
              normalizedPath === '/doctor'
                ? activePath === '/doctor'
                : activePath.startsWith(normalizedPath);
            return (
              <button
                key={item.id}
                type="button"
                className={`doc-nav-link${isActive ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="doc-sidebar-bottom">
          <div className="doc-user">
            Welcome, {currentUser?.first_name || doctorInfo?.name || 'Doctor'}
          </div>
          <button className="doc-logout" onClick={onLogout} type="button">
            &#x1F6AA; Logout
          </button>
        </div>
      </aside>
      <main className="doc-main">
        <Routes>
          <Route
            path=""
            element={
              <>
                <div className="doc-header-row">
                  <div>
                    <div className="doc-header-title">Doctor Dashboard</div>
                    <div className="doc-header-desc">
                      {doctorInfo?.department || 'Healthcare Department'} •{' '}
                      {doctorInfo?.specialization || 'Specialization'}
                    </div>
                  </div>
                  <div className="doc-header-actions">
                    <button
                      className="doc-schedule-btn"
                      type="button"
                      onClick={() => setShowModal(true)}
                    >
                      Schedule Appointment
                    </button>
                    <div className="doc-header-tags">
                      {doctorInfo?.specialization && (
                        <span className="doc-tag doc-tag-green">{doctorInfo.specialization}</span>
                      )}
                      <span className="doc-tag doc-tag-blue">Doctor</span>
                    </div>
                  </div>
                </div>
                <div className="doc-summary-row">
                  <div className="doc-summary-card">
                    <div className="doc-summary-icon" aria-hidden="true">
                      <span role="img" aria-label="patients">
                        👥
                      </span>
                    </div>
                    <div className="doc-summary-main">
                      {todayStats?.scheduled_appointments ?? scheduleEntries.length}
                    </div>
                    <div className="doc-summary-label">Scheduled Today</div>
                    <div className="doc-summary-desc">Upcoming confirmed appointments</div>
                  </div>
                  <div className="doc-summary-card">
                    <div className="doc-summary-icon" aria-hidden="true">
                      <span role="img" aria-label="completed">
                        ✅
                      </span>
                    </div>
                    <div className="doc-summary-main">
                      {todayStats?.completed_appointments || 0}
                    </div>
                    <div className="doc-summary-label">Completed</div>
                    <div className="doc-summary-desc">Finished consultations today</div>
                  </div>
                  <div className="doc-summary-card">
                    <div className="doc-summary-icon" aria-hidden="true">
                      <span role="img" aria-label="pending">
                        ⏳
                      </span>
                    </div>
                    <div className="doc-summary-main">
                      {todayStats?.pending_appointments || 0}
                    </div>
                    <div className="doc-summary-label">Pending</div>
                    <div className="doc-summary-desc">Awaiting completion</div>
                  </div>
                </div>
                <div className="doc-schedule-card">
                  <div className="doc-schedule-header">
                    <div>
                      <span className="doc-schedule-title">Today's Schedule</span>
                      <span className="doc-schedule-desc">
                        Your appointments for {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="doc-schedule-refresh"
                      onClick={refreshDashboard}
                      disabled={dashboardLoading}
                    >
                      {dashboardLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>
                  {errors?.dashboard && (
                    <div className="doc-schedule-error">{errors.dashboard}</div>
                  )}
                  <div className="doc-schedule-list">
                    {dashboardLoading ? (
                      <div className="doc-schedule-empty">Loading schedule…</div>
                    ) : scheduleEntries.length ? (
                      scheduleEntries.map((appt) => (
                        <div
                          key={appt.id}
                          className={`doc-appt-row doc-appt-${appt.typeVariant}`}
                        >
                          <div className="doc-appt-time">
                            <span
                              className={`doc-appt-time-icon doc-appt-time-icon-${appt.typeVariant}`}
                            ></span>
                            <span className="doc-appt-time-text">{appt.timeDisplay}</span>
                          </div>
                          <div className="doc-appt-name">{appt.patientName}</div>
                          <div className={`doc-appt-type-pill doc-appt-type-pill-${appt.typeVariant}`}>
                            {appt.type}
                          </div>
                          <div className="doc-appt-status">{appt.statusLabel}</div>
                        </div>
                      ))
                    ) : (
                      <div className="doc-schedule-empty">
                        <p>No appointments scheduled for today.</p>
                        <button
                          type="button"
                          className="doc-schedule-btn"
                          onClick={() => setShowModal(true)}
                        >
                          Schedule First Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            }
          />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="availability" element={<DoctorAvailability />} />
        </Routes>
      </main>

      {showModal && (
        <ScheduleAppointmentModal
          isOpen={showModal}
          userRole="doctor"
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refreshDashboard();
          }}
        />
      )}
    </div>
  );
}

export default function DoctorDashboard({ onLogout }) {
  return (
    <DoctorDataProvider>
      <DoctorDashboardShell onLogout={onLogout} />
    </DoctorDataProvider>
  );
}
