import React, { useMemo, useState } from 'react';
import DeleteAppointmentModal from './DeleteAppointmentModal';
import './AppointmentsManagement.css';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal.jsx';
import { formatTimeTo12Hour } from '../utils/time.js';

function AppointmentsManagement({ setAdminLoggedIn }) {
  const { appointments, addAppointment, deleteAppointment, cancelAppointment } = useAdminData();
  
  // Debug logging
  console.log('AppointmentsManagement - appointments:', appointments);
  console.log('AppointmentsManagement - appointments count:', appointments?.length);
  
  const [showModal, setShowModal] = useState(false);
  const [localAppointments, setLocalAppointments] = useState([]);
  
  // Sync with context appointments and add local state for cancelled reasons
  React.useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [tab, setTab] = useState('All');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const statusOptions = useMemo(
    () => Array.from(new Set(localAppointments.map((a) => a.status))).filter(Boolean),
    [localAppointments]
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(localAppointments.map((a) => a.type))).filter(Boolean),
    [localAppointments]
  );

  // Date helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const fallbackDateIso = todayIso;

  const deriveIsoDate = (appointment) => {
    if (appointment?.dateIso) return appointment.dateIso;
    const value = appointment?.date;
    if (!value || typeof value !== 'string') return null;

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return isoMatch[0];
    }

    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, month, day, year] = slashMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }

    return null;
  };

  const getDateObject = (appointment) => {
    const iso = deriveIsoDate(appointment);
    if (!iso) {
      return { iso: null, date: null };
    }
    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return { iso: null, date: null };
    }
    return { iso, date };
  };

  const isToday = (appointment) => {
    const { iso } = getDateObject(appointment);
    return iso === todayIso;
  };

  const isThisWeek = (appointment) => {
    const { date } = getDateObject(appointment);
    if (!date) return false;
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isUpcoming = (appointment) => {
    const { date } = getDateObject(appointment);
    if (!date) return false;
    return date > today;
  };

  const tabFilter = (appointment) => {
    switch (tab) {
      case 'Today':
        return isToday(appointment);
      case 'Week':
        return isThisWeek(appointment);
      case 'Upcoming':
        return isUpcoming(appointment);
      default:
        return true;
    }
  };

  const getDisplayDate = (appointment) => appointment?.dateDisplay || appointment?.date || 'N/A';

  const filteredAll = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const statusTerm = statusFilter?.toLowerCase();
    const typeTerm = typeFilter?.toLowerCase();

    return localAppointments.filter((a) => {
      const patientName = (a.patient || '').toLowerCase();
      const doctorName = (a.doctor || '').toLowerCase();
      const matchesSearch =
        !searchTerm ||
        patientName.includes(searchTerm) ||
        doctorName.includes(searchTerm);

      const normalizedStatus = (a.status || '').toLowerCase();
      const normalizedType = (a.type || '').toLowerCase();

      const matchesStatus = statusFilter === 'All' || normalizedStatus === statusTerm;
      const matchesType = typeFilter === 'All' || normalizedType === typeTerm;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [localAppointments, search, statusFilter, typeFilter]);

  const filteredToday = filteredAll.filter(isToday);
  const filteredWeek = filteredAll.filter(isThisWeek);
  const filteredUpcoming = filteredAll.filter(isUpcoming);
  const filtered = filteredAll.filter(tabFilter);

  const statusClass = status => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'scheduled': return 'status scheduled';
      case 'completed': return 'status completed';
      case 'cancelled': return 'status cancelled';
      case 'no-show': return 'status noshow';
      default: return 'status';
    }
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (reason) => {
    if (selectedAppointment) {
      try {
        const result = await cancelAppointment(selectedAppointment.id, reason);
        if (result.success) {
          // Update the appointment with cancellation reason in local state
          setLocalAppointments(prev => 
            prev.map(appt => 
              appt.id === selectedAppointment.id 
                ? { ...appt, status: 'cancelled', cancellationReason: reason }
                : appt
            )
          );
        } else {
          console.error('Failed to cancel appointment:', result.error);
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
      setDeleteModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <AdminLayout active="appointments" setAdminLoggedIn={setAdminLoggedIn}>
      <DeleteAppointmentModal
        appointment={selectedAppointment}
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
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
            <ScheduleAppointmentModal
              isOpen={showModal}
              userRole="admin"
              onClose={() => setShowModal(false)}
              onSuccess={(appointment) => {
                if (appointment) {
                  const patientName = appointment.patient_name || appointment.patient || 'Unknown Patient';
                  addAppointment({
                    id: appointment.id ?? Date.now(),
                    patient: patientName,
                    patientInitials: patientName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase(),
                    doctor: appointment.doctor_name || appointment.doctor || 'Unknown Doctor',
                    date: appointment.appointment_date || appointment.date || appointment.preferred_date || fallbackDateIso,
                    time: formatTimeTo12Hour(appointment.preferred_time || appointment.time) || '—',
                    type: appointment.appointment_type || appointment.type || 'Consultation',
                    status: appointment.status || 'Scheduled',
                    department: appointment.department || appointment.department_name || '',
                    reason: appointment.reason || appointment.chief_complaint || '',
                  });
                }
                setShowModal(false);
              }}
            />
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
              placeholder="Search by patient or doctor name..."
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
                    <td>
                      <span className="patient-avatar">{a.patientInitials}</span>
                      {a.patient}
                    </td>
                    <td>{a.doctor}</td>
                    <td>
                      <span className="date-icon">📅</span>
                      {getDisplayDate(a)}<br /><span className="appt-time">{a.timeDisplay || formatTimeTo12Hour(a.timeRaw || a.time) || '—'}</span>
                    </td>
                    <td><span className={`appt-type ${a.type?.toLowerCase().replace(/[^a-z]/g, '')}`}>{a.type}</span></td>
                    <td>
                      <span 
                        className={statusClass(a.status)}
                        title={a.status?.toLowerCase() === 'cancelled' && a.cancellationReason ? `Reason: ${a.cancellationReason}` : ''}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status?.toLowerCase() === 'scheduled' ? (
                        <button className="cancel-btn" onClick={() => handleCancelClick(a)}>❌ Cancel</button>
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