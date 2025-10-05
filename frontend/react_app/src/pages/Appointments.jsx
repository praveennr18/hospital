import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/healthcare-logo.svg';
import './Appointments.css';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { authAPI, patientAPI } from '../services/api.js';
import { formatTimeTo12Hour } from '../utils/time.js';

const TYPE_CLASS_MAP = {
  consultation: 'appt-type-consult',
  follow_up: 'appt-type-follow',
  followup: 'appt-type-follow',
  procedure: 'appt-type-proc',
  check_up: 'appt-type-consult',
  checkup: 'appt-type-consult',
  therapy: 'appt-type-consult',
  emergency: 'appt-type-proc',
};

const STATUS_CLASS_MAP = {
  scheduled: 'appt-status-scheduled',
  confirmed: 'appt-status-scheduled',
  completed: 'appt-status-completed',
  cancelled: 'appt-status-cancelled',
  canceled: 'appt-status-cancelled',
  no_show: 'appt-status-noshow',
  'no-show': 'appt-status-noshow',
  pending: 'appt-status-scheduled',
  rescheduled: 'appt-status-scheduled',
};

const formatDisplay = (value) => {
  if (!value) return '';
  return value
    .toString()
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const normalizeTime = (time) => {
  if (!time) {
    return '';
  }
  return formatTimeTo12Hour(time);
};

const normalizeAppointment = (item = {}) => {
  const doctor = item.doctor ?? item.doctor_info ?? {};
  const doctorName =
    item.doctor_name ||
    doctor.name ||
    doctor.full_name ||
    [doctor.title, doctor.first_name, doctor.last_name].filter(Boolean).join(' ') ||
    [item.doctor_title, item.doctor_first_name, item.doctor_last_name].filter(Boolean).join(' ') ||
    'Assigned Doctor';

  const department =
    doctor.department ||
    item.department ||
    doctor.specialization_display ||
    doctor.specialization ||
    'General Medicine';

  const dateValue =
    item.appointment_date ||
    item.date ||
    item.start_date ||
    '';

  const timeValue = normalizeTime(item.appointment_time || item.time || item.start_time || '');

  const typeValue = (item.appointment_type || item.type || 'consultation').toString().toLowerCase();
  const statusValue = (item.status || item.appointment_status || 'scheduled').toString().toLowerCase();
  const reasonValue = item.reason || item.chief_complaint || '';

  return {
    id:
      item.id ||
      item.appointment_id ||
      `${doctorName}-${dateValue || 'date'}-${timeValue || 'time'}`,
    doctorName,
    department,
    date: dateValue,
    time: timeValue,
    type: typeValue,
    status: statusValue,
    reason: reasonValue,
  };
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00`);
  }
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
};

export default function Appointments({ onLogout }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);

  const patientName = patientInfo?.name || patientInfo?.full_name || 'Patient';

  const loadProfile = useCallback(async () => {
    try {
      const response = await patientAPI.getProfile();
      if (response?.success) {
        const data = response.data ?? {};
        setPatientInfo(data.patient_info ?? data);
      } else if (response?.error) {
        console.error('Failed to load patient profile:', response.error);
        setPatientInfo(null);
      }
    } catch (err) {
      console.error('Failed to load patient profile:', err);
      setPatientInfo(null);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const response = await patientAPI.getAppointments();
      if (response?.success) {
        const list = response.data?.appointments ?? response.data ?? [];
        const normalized = Array.isArray(list) ? list.map(normalizeAppointment) : [];
        setAppointments(normalized);
        setError('');
        return { success: true };
      }

      const message = response?.error || 'Unable to fetch appointments.';
      setAppointments([]);
      setError(message);
      return { success: false, message };
    } catch (err) {
      console.error('Failed to load appointments:', err);
      const message = 'Unable to load appointments right now.';
      setAppointments([]);
      setError(message);
      return { success: false, message };
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setFeedback('');
    await Promise.all([loadProfile(), loadAppointments()]);
    setLoading(false);
  }, [loadProfile, loadAppointments]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const refreshAppointments = useCallback(async (showMessage = true) => {
    setRefreshing(true);
    const result = await loadAppointments();
    setRefreshing(false);
    if (result.success) {
      if (showMessage) {
        setFeedback('Appointments updated.');
      }
      return true;
    }
    setFeedback('');
    return false;
  }, [loadAppointments]);

  const handleModalSuccess = useCallback(async () => {
    const success = await refreshAppointments(false);
    if (success) {
      setFeedback('Appointment scheduled successfully.');
    }
  }, [refreshAppointments]);

  const handleLogout = useCallback(async () => {
    setFeedback('');
    if (onLogout) {
      await onLogout();
      return;
    }

    try {
      const response = await authAPI.logout();
      if (!response.success) {
        console.warn('Logout request failed:', response.error);
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    } finally {
      navigate('/login');
    }
  }, [navigate, onLogout]);

  const statusOptions = useMemo(() => {
    const set = new Set();
    appointments.forEach((appt) => {
      if (appt.status) {
        set.add(appt.status);
      }
    });
    return Array.from(set);
  }, [appointments]);

  const typeOptions = useMemo(() => {
    const set = new Set();
    appointments.forEach((appt) => {
      if (appt.type) {
        set.add(appt.type);
      }
    });
    return Array.from(set);
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const doctorSearch = search.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return appointments.filter((appointment) => {
      const doctorMatches =
        !doctorSearch ||
        appointment.doctorName.toLowerCase().includes(doctorSearch) ||
        appointment.department.toLowerCase().includes(doctorSearch) ||
        appointment.reason?.toLowerCase().includes(doctorSearch);

      if (!doctorMatches) {
        return false;
      }

      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'all' && appointment.type !== typeFilter) {
        return false;
      }

      const apptDate = parseDate(appointment.date);
      if (!apptDate) {
        return tab === 'all';
      }
      apptDate.setHours(0, 0, 0, 0);

      if (tab === 'today') {
        return apptDate.getTime() === today.getTime();
      }

      if (tab === 'week') {
        return apptDate >= weekStart && apptDate <= weekEnd;
      }

      if (tab === 'upcoming') {
        return apptDate > today;
      }

      return true;
    });
  }, [appointments, search, statusFilter, typeFilter, tab]);

  const handleOpenModal = () => {
    setFeedback('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="pdash-root">
      <aside className="pdash-sidebar">
        <div className="pdash-logo">
          <img src={logo} alt="HealthCare Pro Logo" />
          <span className="pdash-logo-text">HealthCare Pro</span>
        </div>
        <nav className="pdash-nav">
          <button className="pdash-nav-link" type="button" onClick={() => navigate('/')}>Dashboard</button>
          <button className="pdash-nav-link active" type="button">Appointments</button>
        </nav>
        <div className="pdash-sidebar-bottom">
          <div className="pdash-user">Welcome, {patientName}</div>
          <button className="pdash-logout" type="button" onClick={handleLogout}>
            &#x1F6AA; Logout
          </button>
        </div>
      </aside>
      <main className="pdash-main">
        <div className="appt-header-row">
          <div>
            <div className="appt-header-title">Appointments</div>
            <div className="appt-header-desc">View and manage your appointments</div>
          </div>
          <button className="appt-schedule-btn" type="button" onClick={handleOpenModal}>
            + Schedule Appointment
          </button>
        </div>

        <div className="appt-filters-row">
          <input
            className="appt-search"
            placeholder="Search by doctor, department or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="appt-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>{formatDisplay(option)}</option>
            ))}
          </select>
          <select
            className="appt-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>{formatDisplay(option)}</option>
            ))}
          </select>
        </div>

        {error && <div className="pdash-error-banner">{error}</div>}
        {feedback && !error && <div className="pdash-feedback success">{feedback}</div>}

        <div className="appt-card">
          <div className="appt-tab-bar">
            <button className={tab === 'all' ? 'active' : ''} type="button" onClick={() => setTab('all')}>
              All
            </button>
            <button className={tab === 'today' ? 'active' : ''} type="button" onClick={() => setTab('today')}>
              Today
            </button>
            <button className={tab === 'week' ? 'active' : ''} type="button" onClick={() => setTab('week')}>
              Week
            </button>
            <button className={tab === 'upcoming' ? 'active' : ''} type="button" onClick={() => setTab('upcoming')}>
              Upcoming
            </button>
            <button
              className="pdash-refresh-btn"
              type="button"
              onClick={() => refreshAppointments(true)}
              disabled={refreshing}
              style={{ marginLeft: 'auto' }}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="pdash-loading">Loading appointments…</div>
          ) : (
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const typeClass = TYPE_CLASS_MAP[appointment.type] || 'appt-type-consult';
                    const statusClass = STATUS_CLASS_MAP[appointment.status] || 'appt-status-scheduled';
                    return (
                      <tr key={appointment.id}>
                        <td>
                          <span className="appt-date">{appointment.date || '—'}</span>
                          <br />
                          <span className="appt-time">&#128337; {appointment.time || '—'}</span>
                        </td>
                        <td>
                          <span className="appt-doc-icon">&#128100;</span> {appointment.doctorName}
                        </td>
                        <td>
                          <span className={`appt-type-badge ${typeClass}`}>
                            {formatDisplay(appointment.type)}
                          </span>
                        </td>
                        <td>{appointment.department}</td>
                        <td>
                          <span className={`appt-status-badge ${statusClass}`}>
                            {formatDisplay(appointment.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <ScheduleAppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        userRole="patient"
      />
    </div>
  );
}
