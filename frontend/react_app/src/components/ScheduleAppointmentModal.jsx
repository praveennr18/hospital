import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doctorAPI, appointmentAPI, adminAPI } from '../services/api.js';
import { formatTimeTo12Hour, formatTimeRangeTo12Hour } from '../utils/time.js';
import './ScheduleAppointmentModal.css';

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'y', 'available', 'active', 'open', 'enabled']);
const FALSY_STRINGS = new Set(['false', '0', 'no', 'n', 'inactive', 'unavailable', 'closed', 'booked', 'reserved', 'busy', 'blocked', 'full', 'disabled']);
const AVAILABLE_STATUS = new Set(['available', 'active', 'open', 'free', 'enabled']);
const UNAVAILABLE_STATUS = new Set(['unavailable', 'inactive', 'closed', 'booked', 'reserved', 'occupied', 'full', 'blocked', 'busy', 'disabled', 'taken']);

const UNAVAILABLE_KEYWORDS = [
  'booked',
  'reserved',
  'unavailable',
  'closed',
  'full',
  'occupied',
  'busy',
  'taken',
  'blocked',
  'hold',
  'scheduled',
  'in use',
  'not available',
  'pending approval',
];

const containsUnavailableKeyword = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return UNAVAILABLE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const normalizeBooleanFlag = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return null;
    }
    return value > 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUTHY_STRINGS.has(normalized)) {
      return true;
    }
    if (FALSY_STRINGS.has(normalized)) {
      return false;
    }
  }
  return null;
};

const normalizeStatusString = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim().toLowerCase();
};

const getSlotValue = (slot) => {
  if (!slot) {
    return '';
  }
  if (typeof slot === 'string') {
    return slot.trim();
  }
  const candidates = [
    slot.value,
    slot.time,
    slot.start_time,
    slot.start,
    slot.from,
    slot.slot,
    slot.preferred_time,
  ];
  for (const candidate of candidates) {
    if (candidate) {
      return String(candidate).trim();
    }
  }
  return '';
};

const getSlotRange = (slot) => {
  if (!slot || typeof slot !== 'object') {
    return { start: null, end: null };
  }
  const start = slot.start_time ?? slot.start ?? slot.from ?? null;
  const end = slot.end_time ?? slot.end ?? slot.to ?? null;
  return { start, end };
};

const isSlotAvailable = (slot) => {
  if (!slot) {
    return false;
  }
  if (typeof slot === 'string') {
    if (!slot.trim()) {
      return false;
    }
    if (containsUnavailableKeyword(slot)) {
      return false;
    }
    return true;
  }

  const negativeKeys = ['is_booked', 'booked', 'reserved', 'is_reserved', 'is_busy', 'is_blocked', 'is_fully_booked', 'occupied'];
  for (const key of negativeKeys) {
    const flag = normalizeBooleanFlag(slot[key]);
    if (flag === true) {
      return false;
    }
  }

  const textFields = [
    'label',
    'display',
    'display_text',
    'name',
    'title',
    'description',
    'status_label',
    'status_text',
    'info',
    'notes',
    'message',
  ];
  for (const field of textFields) {
    if (containsUnavailableKeyword(slot[field])) {
      return false;
    }
  }

  let hasInfo = false;
  let hasPositive = false;

  const availabilityKeys = ['is_available', 'available', 'slot_available', 'is_free', 'is_open', 'has_availability'];
  for (const key of availabilityKeys) {
    if (slot[key] !== undefined && slot[key] !== null) {
      hasInfo = true;
      const flag = normalizeBooleanFlag(slot[key]);
      if (flag === false) {
        return false;
      }
      if (flag === true) {
        hasPositive = true;
      }
    }
  }

  const statusFields = ['status', 'state', 'availability', 'availability_status'];
  for (const field of statusFields) {
    if (slot[field]) {
      hasInfo = true;
      const status = normalizeStatusString(slot[field]);
      if (!status) {
        continue;
      }
      if (
        UNAVAILABLE_STATUS.has(status) ||
        status.includes('booked') ||
        status.includes('reserved') ||
        status.includes('unavailable') ||
        status.includes('closed') ||
        status.includes('full') ||
        status.includes('busy')
      ) {
        return false;
      }
      if (
        AVAILABLE_STATUS.has(status) ||
        status.includes('available') ||
        status.includes('open') ||
        status.includes('free')
      ) {
        hasPositive = true;
      }
    }
  }

  if (slot.remaining_capacity !== undefined && slot.remaining_capacity !== null) {
    hasInfo = true;
    if (Number(slot.remaining_capacity) <= 0) {
      return false;
    }
  }

  if (slot.capacity !== undefined && slot.booked_count !== undefined) {
    hasInfo = true;
    if (Number(slot.capacity) - Number(slot.booked_count) <= 0) {
      return false;
    }
  }

  return hasPositive || !hasInfo;
};

const recordHasAvailability = (record, keys = []) => {
  if (!record) {
    return false;
  }

  let hasInfo = false;
  let hasPositive = false;

  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      hasInfo = true;
      const flag = normalizeBooleanFlag(record[key]);
      if (flag === false) {
        return false;
      }
      if (flag === true) {
        hasPositive = true;
      }
    }
  }

  const statusFields = ['status', 'state', 'availability', 'availability_status'];
  for (const field of statusFields) {
    if (record[field]) {
      hasInfo = true;
      const status = normalizeStatusString(record[field]);
      if (!status) {
        continue;
      }
      if (
        UNAVAILABLE_STATUS.has(status) ||
        status.includes('booked') ||
        status.includes('unavailable') ||
        status.includes('closed') ||
        status.includes('inactive') ||
        status.includes('full') ||
        status.includes('busy')
      ) {
        return false;
      }
      if (
        AVAILABLE_STATUS.has(status) ||
        status.includes('available') ||
        status.includes('open') ||
        status.includes('active')
      ) {
        hasPositive = true;
      }
    }
  }

  const countFields = ['available_slots_count', 'slots_available', 'open_slots', 'remaining_slots'];
  for (const field of countFields) {
    if (record[field] !== undefined && record[field] !== null) {
      hasInfo = true;
      const value = Number(record[field]);
      if (!Number.isNaN(value)) {
        if (value <= 0) {
          return false;
        }
        if (value > 0) {
          hasPositive = true;
        }
      }
    }
  }

  const slotArrays = ['available_slots', 'slots'];
  for (const field of slotArrays) {
    const arr = record[field];
    if (Array.isArray(arr)) {
      hasInfo = true;
      const hasAvailableSlot = arr.some((slot) => isSlotAvailable(slot));
      if (!hasAvailableSlot) {
        return false;
      }
      hasPositive = true;
    }
  }

  return hasPositive || !hasInfo;
};

const sanitizeByAvailability = (items = [], availabilityKeys = [], keySelector = (item) => item?.id) => {
  if (!Array.isArray(items)) {
    return [];
  }
  const result = [];
  const seen = new Set();

  items.forEach((item) => {
    if (!item || !recordHasAvailability(item, availabilityKeys)) {
      return;
    }
    const key = keySelector(item);
    const normalizedKey = key ? String(key).toLowerCase() : null;
    if (normalizedKey && seen.has(normalizedKey)) {
      return;
    }
    if (normalizedKey) {
      seen.add(normalizedKey);
    }
    result.push(item);
  });

  if (result.length === 0 && items.length > 0) {
    const fallback = [];
    const fallbackSeen = new Set();
    items.forEach((item) => {
      if (!item) {
        return;
      }
      const fallbackKey = keySelector(item);
      const normalizedKey = fallbackKey ? String(fallbackKey).toLowerCase() : null;
      if (normalizedKey && fallbackSeen.has(normalizedKey)) {
        return;
      }
      if (normalizedKey) {
        fallbackSeen.add(normalizedKey);
      }
      fallback.push(item);
    });
    return fallback;
  }

  return result;
};

const sanitizeDepartments = (items = []) =>
  sanitizeByAvailability(items, ['is_active', 'is_available', 'available', 'has_available_doctors', 'has_available_slots'], (dept) =>
    dept?.specialization ?? dept?.id ?? dept?.name ?? dept?.department_id
  );

const sanitizeDoctors = (items = []) =>
  sanitizeByAvailability(items, ['is_active', 'is_available', 'available', 'accepting_patients', 'has_availability', 'has_available_slots'], (doctor) =>
    doctor?.id ?? doctor?.doctor_id ?? doctor?.user_id ?? doctor?.email ?? doctor?.name
  );

const buildPatientName = (patient = {}) => {
  const first = patient.user?.first_name ?? patient.first_name ?? '';
  const last = patient.user?.last_name ?? patient.last_name ?? '';
  const composed = `${first} ${last}`.trim();
  return composed || patient.name || patient.full_name || patient.display_name || 'Unnamed Patient';
};

const sanitizePatients = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .filter(Boolean)
    .sort((a, b) => buildPatientName(a).toLowerCase().localeCompare(buildPatientName(b).toLowerCase()));
};

const sanitizeSlots = (slots = []) => {
  if (!Array.isArray(slots)) {
    return [];
  }
  const seen = new Set();
  const cleaned = [];

  slots.forEach((slot) => {
    if (!isSlotAvailable(slot)) {
      return;
    }
    const value = getSlotValue(slot);
    if (!value) {
      return;
    }
    if (seen.has(value)) {
      return;
    }
    seen.add(value);
    if (typeof slot === 'object') {
      cleaned.push({ ...slot, value });
    } else {
      cleaned.push(value);
    }
  });

  return cleaned;
};

const getTodayISODate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ScheduleAppointmentModal = ({
  isOpen = true,
  onClose,
  onSuccess,
  userRole = 'patient',
  selectedPatient = null,
}) => {
  const createInitialForm = useCallback(
    () => ({
      patient: selectedPatient || '',
      department: '',
      doctor: '',
      appointment_date: '',
      appointment_time: '',
      appointment_type: 'consultation',
      chief_complaint: '',
      reason: '',
    }),
    [selectedPatient]
  );

  const [formData, setFormData] = useState(() => createInitialForm());
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const appointmentTypes = useMemo(
    () => [
      { value: 'consultation', label: 'Consultation' },
      { value: 'follow_up', label: 'Follow-up' },
      { value: 'check_up', label: 'Check-up' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'procedure', label: 'Procedure' },
      { value: 'therapy', label: 'Therapy' },
    ],
    []
  );

  const minSelectableDate = useMemo(() => getTodayISODate(), []);

  const resetForm = useCallback(() => {
    setFormData(createInitialForm());
    setError('');
    setSuccess('');
    setAvailableSlots([]);
  }, [createInitialForm]);

  const loadDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    try {
      const response = await appointmentAPI.getDepartments();
      if (response?.success) {
        const departmentPayload = response.data?.departments ?? response.data ?? [];
        if (Array.isArray(departmentPayload)) {
          const sanitized = sanitizeDepartments(departmentPayload);
          setDepartments(sanitized);
          if (departmentPayload.length > 0 && sanitized.length === 0) {
            setError('No departments currently accepting appointments.');
          } else if (sanitized.length > 0) {
            setError((prev) =>
              prev === 'No departments currently accepting appointments.' ? '' : prev
            );
          }
        } else {
          setDepartments([]);
        }
      } else {
        setDepartments([]);
        if (response?.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
      setError('Unable to load departments. Please try again later.');
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  const loadDoctors = useCallback(async (departmentKey) => {
    if (!departmentKey) {
      setDoctors([]);
      return;
    }

    setDoctorsLoading(true);
    try {
      const response = await appointmentAPI.getDoctorsByDepartment(departmentKey);
      if (response?.success) {
        const doctorPayload = response.data?.doctors ?? response.data ?? [];
        if (Array.isArray(doctorPayload)) {
          const sanitized = sanitizeDoctors(doctorPayload);
          setDoctors(sanitized);
          if (doctorPayload.length > 0 && sanitized.length === 0) {
            setError('No doctors are accepting appointments for the selected department.');
          } else if (sanitized.length > 0) {
            setError((prev) =>
              prev === 'No doctors are accepting appointments for the selected department.' ? '' : prev
            );
          }
        } else {
          setDoctors([]);
        }
      } else {
        setDoctors([]);
        if (response?.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
      setError('Unable to load doctors for the selected department.');
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const loadPatientsForRole = useCallback(async () => {
    if (userRole !== 'admin' && userRole !== 'doctor') {
      return;
    }
    setPatientsLoading(true);
    try {
      if (userRole === 'admin') {
        const response = await adminAPI.getPatientsList();
        if (response?.success) {
          const list = response.data?.patients ?? response.data ?? [];
          setPatients(Array.isArray(list) ? sanitizePatients(list) : []);
        } else {
          setPatients([]);
          if (response?.error) {
            setError(response.error);
          }
        }
      } else if (userRole === 'doctor') {
        const response = await doctorAPI.getPatients();
        if (response?.success) {
          const list = response.data?.patients ?? response.data ?? [];
          setPatients(Array.isArray(list) ? sanitizePatients(list) : []);
        } else {
          setPatients([]);
          if (response?.error) {
            setError(response.error);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
      setError('Unable to load patients.');
    } finally {
      setPatientsLoading(false);
    }
  }, [userRole]);

  const loadAvailableSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      setAvailableSlots([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedSelected = new Date(parsedDate.getTime());
    normalizedSelected.setHours(0, 0, 0, 0);
    if (normalizedSelected < today) {
      setAvailableSlots([]);
      return;
    }

    setSlotsLoading(true);
    try {
      const response = await appointmentAPI.getAvailableSlots({ doctor_id: doctorId, date });
      if (response?.success) {
        const slotPayload = response.data?.available_slots ?? response.data ?? [];
        if (Array.isArray(slotPayload)) {
          const sanitized = sanitizeSlots(slotPayload);
          setAvailableSlots(sanitized);
          setFormData((prev) => {
            if (!prev.appointment_time) {
              return prev;
            }
            const hasSelection = sanitized.some((slot) => {
              if (!slot) {
                return false;
              }
              if (typeof slot === 'string') {
                return slot === prev.appointment_time;
              }
              return slot.value === prev.appointment_time;
            });
            if (hasSelection) {
              return prev;
            }
            return {
              ...prev,
              appointment_time: '',
            };
          });
          if (slotPayload.length > 0 && sanitized.length === 0) {
            setError('No available slots for the selected doctor on this date.');
          } else if (sanitized.length > 0) {
            setError((prev) =>
              prev === 'No available slots for the selected doctor on this date.' ? '' : prev
            );
          }
        } else {
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
        if (response?.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setAvailableSlots([]);
      setError('Unable to load available slots for the selected doctor.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    resetForm();
    loadDepartments();
    loadPatientsForRole();
  }, [isOpen, loadDepartments, loadPatientsForRole, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (formData.department) {
      loadDoctors(formData.department);
    } else {
      setDoctors([]);
    }
  }, [isOpen, formData.department, loadDoctors]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (formData.doctor && formData.appointment_date) {
      loadAvailableSlots(formData.doctor, formData.appointment_date);
    } else {
      setAvailableSlots([]);
    }
  }, [isOpen, formData.doctor, formData.appointment_date, loadAvailableSlots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'department') {
        next.doctor = '';
        next.appointment_time = '';
      }
      if (name === 'doctor') {
        next.appointment_time = '';
      }
      if (name === 'appointment_date') {
        next.appointment_time = '';
      }
      return next;
    });
    setError('');
    setSuccess('');
  };

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => String(doc.id) === String(formData.doctor)) || null,
    [doctors, formData.doctor]
  );

  const selectedDepartment = useMemo(
    () =>
      departments.find(
        (dept) =>
          String(dept.specialization ?? dept.id ?? dept.name) === String(formData.department)
      ) || null,
    [departments, formData.department]
  );

  const formattedSlots = useMemo(
    () =>
      availableSlots
        .map((slot) => {
          if (!slot) {
            return null;
          }
          if (typeof slot === 'string') {
            return {
              value: slot,
              label: formatTimeTo12Hour(slot),
            };
          }

          const value = getSlotValue(slot);
          if (!value) {
            return null;
          }
          const { start, end } = getSlotRange(slot);
          const label = start || end
            ? formatTimeRangeTo12Hour(start ?? value, end ?? null)
            : formatTimeTo12Hour(value);

          return {
            value,
            label,
          };
        })
        .filter(Boolean),
    [availableSlots]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if ((userRole === 'admin' || userRole === 'doctor') && !formData.patient) {
        setError('Please select a patient.');
        setLoading(false);
        return;
      }

      const appointmentDateValue = formData.appointment_date;
      const parsedAppointmentDate = appointmentDateValue ? new Date(appointmentDateValue) : null;
      if (!parsedAppointmentDate || Number.isNaN(parsedAppointmentDate.getTime())) {
        setError('Please select a valid appointment date.');
        setLoading(false);
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const normalizedAppointmentDate = new Date(parsedAppointmentDate.getTime());
      normalizedAppointmentDate.setHours(0, 0, 0, 0);
      if (normalizedAppointmentDate < today) {
        setError('Please select today or a future date.');
        setLoading(false);
        return;
      }

      const selectedSlotOption = formattedSlots.find((slot) => slot.value === formData.appointment_time);
      if (!selectedSlotOption) {
        setError('Selected time slot is no longer available. Please choose another one.');
        setLoading(false);
        loadAvailableSlots(formData.doctor, formData.appointment_date);
        return;
      }

      const departmentValue = selectedDoctor?.department || selectedDepartment?.name || formData.department;

      const payload = {
        department: departmentValue,
        appointment_date: formData.appointment_date,
        preferred_time: selectedSlotOption.value,
        appointment_type: formData.appointment_type,
        reason: formData.reason || formData.chief_complaint,
        doctor_id: formData.doctor,
      };

      if (userRole === 'admin' || userRole === 'doctor') {
        payload.patient_id = formData.patient;
      }

      if (formData.chief_complaint) {
        payload.chief_complaint = formData.chief_complaint;
      }

      const response = await appointmentAPI.create(payload);

      if (response?.success) {
        setSuccess('Appointment scheduled successfully!');
        if (typeof onSuccess === 'function') {
          onSuccess(response.data?.appointment ?? response.data ?? null);
        }
        setTimeout(() => {
          resetForm();
          if (typeof onClose === 'function') {
            onClose();
          }
        }, 1000);
      } else {
        setError(response?.error || 'Failed to schedule appointment. Please try again.');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(
        err?.details?.detail ||
        err?.message ||
        'Failed to schedule appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="appointment-modal-overlay" onClick={handleClose}>
      <div className="appointment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="appointment-modal-header">
          <h2>Schedule New Appointment</h2>
          <button className="close-button" onClick={handleClose} type="button">
            ×
          </button>
        </div>

        <div className="appointment-modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="appointment-form">
            {(userRole === 'admin' || userRole === 'doctor') && (
              <div className="form-group">
                <label htmlFor="patient">Patient *</label>
                <select
                  id="patient"
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                  disabled={patientsLoading}
                >
                  <option value="">{patientsLoading ? 'Loading patients…' : 'Select Patient'}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {buildPatientName(patient)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="form-select"
                disabled={departmentsLoading}
              >
                <option value="">
                  {departmentsLoading
                    ? 'Loading departments…'
                    : departments.length
                      ? 'Select Department'
                      : 'No departments available'}
                </option>
                {departments.map((dept) => {
                  const value = dept.specialization ?? dept.id ?? dept.name;
                  const label = dept.name || dept.display_name || dept.specialization_display || value;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="doctor">Doctor *</label>
              <select
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                required
                className="form-select"
                disabled={!formData.department || doctorsLoading}
              >
                <option value="">
                  {!formData.department
                    ? 'Select a department first'
                    : doctorsLoading
                      ? 'Loading doctors…'
                      : doctors.length
                        ? 'Select Doctor'
                        : 'No doctors available'}
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name || doctor.full_name || `Dr. ${doctor.user?.first_name ?? ''} ${doctor.user?.last_name ?? ''}`.trim()} 
                    {doctor.specialization && ` - ${doctor.specialization}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointment_date">Date *</label>
                <input
                  type="date"
                  id="appointment_date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  min={minSelectableDate}
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointment_time">Time *</label>
                <select
                  id="appointment_time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                  disabled={!formData.doctor || !formData.appointment_date || slotsLoading}
                >
                  <option value="">
                    {!formData.doctor || !formData.appointment_date
                      ? 'Select doctor and date first'
                      : slotsLoading
                        ? 'Loading slots…'
                        : availableSlots.length
                          ? 'Select Time'
                          : 'No available slots'}
                  </option>
                  {formattedSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="appointment_type">Appointment Type *</label>
              <select
                id="appointment_type"
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                {appointmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="chief_complaint">Chief Complaint</label>
              <input
                type="text"
                id="chief_complaint"
                name="chief_complaint"
                value={formData.chief_complaint}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Brief description of the main concern"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">Additional Notes</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Any additional information or special requests"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Scheduling…' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;