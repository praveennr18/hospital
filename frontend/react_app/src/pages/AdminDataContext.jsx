import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI, isAuthenticated, getUserRole } from '../services/api.js';
import { formatTimeTo12Hour } from '../utils/time.js';

const noop = () => {};

const defaultAdminContextValue = {
  doctors: [],
  addDoctor: noop,
  editDoctor: noop,
  deleteDoctor: noop,
  patients: [],
  addPatient: noop,
  editPatient: noop,
  deletePatient: noop,
  appointments: [],
  addAppointment: noop,
  editAppointment: noop,
  deleteAppointment: noop,
  refreshData: noop,
  loading: false,
  error: null,
};

const AdminDataContext = createContext(defaultAdminContextValue);

const toIsoDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, part1, part2, year] = slashMatch;
      const first = part1.padStart(2, '0');
      const second = part2.padStart(2, '0');
      const dayFirst = new Date(`${year}-${second}-${first}T00:00:00`);
      const monthFirst = new Date(`${year}-${first}-${second}T00:00:00`);
      const isDayFirstValid = !Number.isNaN(dayFirst.getTime());
      const isMonthFirstValid = !Number.isNaN(monthFirst.getTime());
      if (isDayFirstValid && (Number.parseInt(first, 10) > 12 || !isMonthFirstValid)) {
        return dayFirst.toISOString().slice(0, 10);
      }
      if (isMonthFirstValid && !isDayFirstValid) {
        return monthFirst.toISOString().slice(0, 10);
      }
      if (isDayFirstValid) {
        return dayFirst.toISOString().slice(0, 10);
      }
      if (isMonthFirstValid) {
        return monthFirst.toISOString().slice(0, 10);
      }
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return null;
};

const toDisplayDate = (iso) => {
  if (!iso) return 'N/A';
  const normalized = typeof iso === 'string' ? iso.trim() : '';
  if (!normalized) return 'N/A';

  const directParts = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (directParts) {
    const [, year, month, day] = directParts;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return normalized;
};

const to24HourTime = (value) => {
  if (!value) return '';
  const working = String(value).trim();
  if (!working) return '';

  const meridiemMatch = working.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i);
  if (meridiemMatch) {
    let hours = parseInt(meridiemMatch[1], 10);
    const minutes = meridiemMatch[2] ? meridiemMatch[2].padStart(2, '0') : '00';
    const meridiem = meridiemMatch[3].toLowerCase();
    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    }
    if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const timeMatch = working.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2].padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  if (/^\d{3,4}$/.test(working)) {
    const normalized = working.padStart(4, '0');
    return `${normalized.slice(0, 2)}:${normalized.slice(2, 4)}`;
  }

  return working;
};

const initialsFromName = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const normalizeSingleAppointment = (appt, idx = 0) => {
  if (!appt) {
    return null;
  }

  const patientName =
    appt.patient_name ||
    appt.patient?.name ||
    appt.patient?.user?.full_name ||
    [appt.patient?.user?.first_name, appt.patient?.user?.last_name].filter(Boolean).join(' ') ||
    appt.patient ||
    'Unknown Patient';

  const doctorName =
    appt.doctor_name ||
    appt.doctor?.name ||
    appt.doctor?.user?.full_name ||
    [appt.doctor?.user?.first_name, appt.doctor?.user?.last_name].filter(Boolean).join(' ') ||
    appt.doctor ||
    'Unknown Doctor';

  const isoDate =
    toIsoDate(appt.appointment_date) ||
    toIsoDate(appt.date) ||
    toIsoDate(appt.date_iso) ||
    null;

  const dateDisplay = toDisplayDate(isoDate);

  const rawTime =
    to24HourTime(appt.appointment_time || appt.time || appt.appointment_datetime?.slice(11, 16));
  const timeDisplay = formatTimeTo12Hour(rawTime || appt.time) || '';

  const typeValue =
    appt.appointment_type ||
    appt.type ||
    appt.reason ||
    appt.appointment_reason ||
    'Consultation';

  const statusValue = (appt.status || 'scheduled').trim();

  return {
    id: appt.id || `appt-${idx}`,
    patient: patientName,
    patientInitials: initialsFromName(patientName) || 'NA',
    doctor: doctorName,
    date: dateDisplay,
    dateDisplay,
    dateIso: isoDate,
    time: timeDisplay,
    timeDisplay,
    timeRaw: rawTime,
    type: typeValue,
    status: statusValue,
    patientId: appt.patient?.id || appt.patient_id || null,
    doctorId: appt.doctor?.id || appt.doctor_id || null,
    notes: appt.notes || appt.chief_complaint || '',
    duration: appt.duration || 30,
    cancellationReason: appt.cancellation_reason || null,
  };
};

export function AdminDataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeDoctors = useCallback((payload = []) => {
      return payload.map(doctor => {
        const experienceValue = typeof doctor.experience === 'string'
          ? parseInt(doctor.experience, 10)
          : (doctor.years_of_experience ?? doctor.experience ?? 0);

        return {
          id: doctor.doctor_id || doctor.id || doctor.user_id,
          doctorId: doctor.doctor_id || doctor.id || doctor.user_id,
          name: doctor.name || doctor.full_name || doctor.display_name || 'Unnamed Doctor',
          specialty: doctor.specialization || doctor.specialty || 'General Medicine',
          experience: Number.isFinite(experienceValue) ? experienceValue : 0,
          email: doctor.email || 'N/A',
          phone: doctor.phone || 'N/A',
          department: doctor.department || 'General',
          status: doctor.status || 'Active',
          createdAt: doctor.created_at || null,
        };
      });
  }, []);

  const normalizePatients = useCallback((payload = []) => {
      return payload.map(patient => {
        const ageValue = typeof patient.age === 'string'
          ? parseInt(patient.age, 10)
          : (patient.age ?? 0);

        return {
          id: patient.id || patient.patient_id,
          name: patient.name || patient.full_name || 'Unnamed Patient',
          age: Number.isFinite(ageValue) ? ageValue : 0,
          gender: patient.gender || 'N/A',
          blood: patient.blood_group || patient.blood || 'N/A',
          email: patient.email || 'N/A',
          phone: patient.phone || patient.phone_number || 'N/A',
          lastVisit: patient.last_visit || patient.last_appointment || 'N/A',
        };
      });
  }, []);

  const normalizeAppointments = useCallback(
    (payload = []) =>
      payload
        .map((item, index) => normalizeSingleAppointment(item, index))
        .filter(Boolean),
    []
  );

  const fetchAdminData = useCallback(async () => {
    const role = (getUserRole() || localStorage.getItem('userRole') || '').toLowerCase();
    if (!isAuthenticated() || role !== 'admin') {
      return {
        doctors: [],
        patients: [],
        appointments: [],
        error: null,
      };
    }

    try {
      const [doctorsResponse, patientsResponse, appointmentsResponse, statsResponse] = await Promise.all([
        adminAPI.getDoctorsList(),
        adminAPI.getPatientsList(),
        adminAPI.getAppointments(),
        adminAPI.getDashboardStats(),
      ]);

      const result = { doctors: [], patients: [], appointments: [], error: null };

      if (doctorsResponse?.success) {
        const doctorPayload = doctorsResponse.data?.doctors
          ?? doctorsResponse.data?.results
          ?? doctorsResponse.data
          ?? [];
        result.doctors = normalizeDoctors(Array.isArray(doctorPayload) ? doctorPayload : []);
      } else if (doctorsResponse?.error) {
        console.error('Failed to load doctors:', doctorsResponse.error);
        result.error = doctorsResponse.error;
      }

      if (patientsResponse?.success) {
        const patientPayload = patientsResponse.data?.patients
          ?? patientsResponse.data?.results
          ?? patientsResponse.data
          ?? [];
        result.patients = normalizePatients(Array.isArray(patientPayload) ? patientPayload : []);
      } else if (patientsResponse?.error) {
        console.error('Failed to load patients:', patientsResponse.error);
        result.error = result.error || patientsResponse.error;
      }

      if (appointmentsResponse?.success) {
        const appointmentPayload = appointmentsResponse.data?.appointments
          ?? appointmentsResponse.data?.results
          ?? appointmentsResponse.data
          ?? [];
        result.appointments = normalizeAppointments(Array.isArray(appointmentPayload) ? appointmentPayload : []);
      } else if (appointmentsResponse?.error) {
        console.error('Failed to load appointments:', appointmentsResponse.error);
        result.error = result.error || appointmentsResponse.error;
      } else if (statsResponse?.success) {
        const todaysSchedule = statsResponse.data?.todays_schedule
          ?? statsResponse.data?.schedule
          ?? statsResponse.data?.appointments
          ?? [];
        if (Array.isArray(todaysSchedule) && todaysSchedule.length > 0) {
          result.appointments = normalizeAppointments(todaysSchedule);
        }
      }

      if (statsResponse?.error) {
        console.error('Failed to load dashboard stats:', statsResponse.error);
        result.error = result.error || statsResponse.error;
      }

      return result;
    } catch (err) {
      console.error('Error fetching admin data:', err);
      return {
        doctors: [],
        patients: [],
        appointments: [],
        error: err.message || 'Failed to load admin data',
      };
    }
  }, [normalizeAppointments, normalizeDoctors, normalizePatients]);

  const applyAdminData = useCallback((data) => {
    setDoctors(data.doctors ?? []);
    setPatients(data.patients ?? []);
    setAppointments(data.appointments ?? []);
    setError(data.error ?? null);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData();
    applyAdminData(data);
    setLoading(false);
    return data;
  }, [applyAdminData, fetchAdminData]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const data = await fetchAdminData();
      if (!cancelled) {
        applyAdminData(data);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [applyAdminData, fetchAdminData]);

  const addDoctor = doctor => setDoctors(docs => [...docs, doctor]);
  const editDoctor = updated => setDoctors(docs => docs.map(d => d.id === updated.id ? updated : d));
  const deleteDoctor = async (id) => {
    try {
      const response = await adminAPI.deleteDoctor(id);
      if (response.success) {
        setDoctors(docs => docs.filter(d => d.id !== id));
        return { success: true };
      }
      console.error('Failed to delete doctor:', response.error);
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error deleting doctor:', err);
      return { success: false, error: 'Failed to delete doctor' };
    }
  };

  const addPatient = patient => setPatients(pats => [...pats, patient]);
  const editPatient = updated => setPatients(pats => pats.map(p => p.id === updated.id ? updated : p));
  const deletePatient = async (id) => {
    try {
      const response = await adminAPI.deletePatient(id);
      if (response.success) {
        setPatients(pats => pats.filter(p => p.id !== id));
        return { success: true };
      }
      console.error('Failed to delete patient:', response.error);
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error deleting patient:', err);
      return { success: false, error: 'Failed to delete patient' };
    }
  };

  const addAppointment = useCallback(
    (appt) => {
      setAppointments((prev) => {
        const normalized = normalizeSingleAppointment(appt, prev.length);
        if (!normalized) {
          return prev;
        }
        return [...prev, normalized];
      });
    },
    []
  );

  const editAppointment = useCallback((updated) => {
    const normalized = normalizeSingleAppointment(updated);
    setAppointments((appts) =>
      appts.map((appointment) =>
        appointment.id === (normalized?.id ?? updated?.id)
          ? { ...appointment, ...normalized }
          : appointment
      )
    );
  }, []);
  
  const deleteAppointment = async (id) => {
    try {
      const response = await adminAPI.deleteAppointment(id);
      if (response.success) {
        setAppointments(appts => appts.filter(a => a.id !== id));
        return { success: true };
      } else {
        console.error('Failed to delete appointment:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: 'Failed to delete appointment' };
    }
  };

  const cancelAppointment = async (id, cancellationReason) => {
    try {
      const response = await adminAPI.cancelAppointment(id, cancellationReason);
      if (response.success) {
        // Update the appointment in local state
        setAppointments((appts) =>
          appts.map((appointment) =>
            appointment.id === id
              ? {
                  ...appointment,
                  status: 'cancelled',
                  cancellationReason: cancellationReason,
                }
              : appointment
          )
        );
        return { success: true };
      } else {
        console.error('Failed to cancel appointment:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return { success: false, error: 'Failed to cancel appointment' };
    }
  };

  return (
    <AdminDataContext.Provider value={{
      doctors, addDoctor, editDoctor, deleteDoctor,
      patients, addPatient, editPatient, deletePatient,
      appointments, addAppointment, editAppointment, deleteAppointment, cancelAppointment,
      refreshData,
      loading,
      error,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext);
}
