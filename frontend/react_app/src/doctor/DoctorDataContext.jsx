import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { authAPI, doctorAPI } from '../services/api.js';
import { formatTimeTo12Hour } from '../utils/time.js';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const PATIENTS_PAGE_SIZE = 10;

const noop = () => {};

const defaultContextValue = {
	currentUser: null,
	doctorInfo: null,
	todayStats: null,
	todaySchedule: [],
	dashboardLoading: true,
	refreshDashboard: noop,

	appointments: [],
	appointmentsLoading: true,
	appointmentSummary: null,
	appointmentFilters: { period: 'all', status: 'all', type: 'all' },
	setAppointmentFilters: noop,
	refreshAppointments: noop,
	updateAppointmentStatus: async () => ({ success: false }),

	patients: [],
	patientsLoading: true,
	patientsQuery: { search: '', blood_group: '', page: 1 },
	setPatientsQuery: noop,
	patientPagination: { page: 1, totalPages: 1, totalItems: 0, pageSize: PATIENTS_PAGE_SIZE },
	refreshPatients: noop,
	loadPatientDetail: async () => ({}),

	availability: {},
	availabilityMeta: {},
	availabilityLoading: true,
	availabilitySaving: false,
	saveAvailability: async () => ({ success: false }),
	refreshAvailability: noop,

	errors: {},
};

const DoctorDataContext = createContext(defaultContextValue);

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

const parseDateString = (value) => {
	if (!value) return null;
	if (value instanceof Date) {
		const normalized = new Date(value.getTime());
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	}

	if (typeof value === 'string') {
		const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (isoMatch) {
			const normalized = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
			if (!Number.isNaN(normalized.getTime())) {
				normalized.setHours(0, 0, 0, 0);
				return normalized;
			}
		}

		const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
		if (slashMatch) {
			const part1 = slashMatch[1].padStart(2, '0');
			const part2 = slashMatch[2].padStart(2, '0');
			const year = slashMatch[3];
			const dayFirst = new Date(`${year}-${part2}-${part1}T00:00:00`);
			const monthFirst = new Date(`${year}-${part1}-${part2}T00:00:00`);
			const isDayFirstValid = !Number.isNaN(dayFirst.getTime());
			const isMonthFirstValid = !Number.isNaN(monthFirst.getTime());
			const normalized =
				isDayFirstValid && (Number.parseInt(part1, 10) > 12 || !isMonthFirstValid)
					? dayFirst
					: isMonthFirstValid && !isDayFirstValid
					? monthFirst
					: isDayFirstValid
					? dayFirst
					: null;
			if (normalized) {
				normalized.setHours(0, 0, 0, 0);
				return normalized;
			}
		}
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	parsed.setHours(0, 0, 0, 0);
	return parsed;
};

const formatDateDisplay = (value) => {
	const date = parseDateString(value);
	if (!date) return value || '';
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const normalizeAppointment = (item, index = 0) => {
	if (!item) return null;

	const rawDateValue =
		item.appointment_date ||
		item.date ||
		item.date_iso ||
		item.dateIso ||
		item.date_display ||
		'';
	const parsedDate = parseDateString(rawDateValue);
	const dateIso = parsedDate
		? parsedDate.toISOString().slice(0, 10)
		: typeof rawDateValue === 'string'
		? rawDateValue
		: '';
	const timeValue = item.appointment_time || item.time || '';

	const patientName =
		item.patient_name ||
		item.patient?.name ||
		item.patient?.full_name ||
		item.patient?.user?.full_name ||
		'Patient';

	const patientEmail =
		item.patient_email ||
		item.patient?.email ||
		item.patient?.user?.email ||
		'';

	const patientPhone =
		item.patient_phone ||
		item.patient?.phone ||
		item.patient?.phone_number ||
		item.patient?.contact_phone ||
		'';

	const typeRaw = (item.appointment_type || item.type || 'consultation').toString().toLowerCase();
	const statusRaw = (item.status || 'scheduled').toString().toLowerCase();

	return {
		id: item.id ?? item.appointment_id ?? `appt-${index}`,
		dateIso,
		dateDisplay: formatDateDisplay(parsedDate || rawDateValue),
		time: timeValue,
		timeDisplay: timeValue ? formatTimeTo12Hour(timeValue) : '',
		status: statusRaw,
		statusLabel: formatDisplay(statusRaw),
		type: typeRaw,
		typeLabel: formatDisplay(typeRaw),
		department: item.department || item.doctor_department || '',
		notes: item.notes || item.chief_complaint || '',
		doctorNotes: item.doctor_notes || '',
		duration: item.duration || 30,
		canCancel: item.can_be_cancelled !== false,
		patient: {
			id: item.patient?.id || item.patient_id || null,
			name: patientName,
			email: patientEmail,
			phone: patientPhone,
		},
		raw: item,
	};
};

const normalizePatient = (item, index = 0) => {
	if (!item) return null;

	const fullName =
		item.full_name ||
		item.name ||
		[item.user?.first_name, item.user?.last_name].filter(Boolean).join(' ') ||
		'Patient';

	const initials = fullName
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
		.slice(0, 3) || 'PT';

	const ageValue = Number.parseInt(item.age, 10);
	const age = Number.isFinite(ageValue) && ageValue >= 0 ? ageValue : null;
	const gender = item.gender ? formatDisplay(item.gender) : 'Not specified';
	const bloodGroup = item.blood_group || item.blood || item.bloodType || 'Unknown';

	const contactInfo = item.contact || {};
	const phoneValue =
		contactInfo.phone ||
		item.phone_number ||
		item.phone ||
		item.contact_phone ||
		item.user?.phone ||
		'Not provided';
	const emailValue =
		contactInfo.email ||
		item.email ||
		item.user?.email ||
		'Not provided';

	return {
		id: item.id ?? item.patient_id ?? `patient-${index}`,
		name: fullName,
		initials,
		age,
		ageDisplay: age != null ? `${age} years` : '—',
		gender,
		bloodGroup,
		contact: {
			phone: phoneValue,
			email: emailValue,
		},
		lastVisit:
			item.last_visit_display ||
			item.last_visit ||
			item.last_appointment ||
			null,
		totalCompletedVisits: item.total_completed_visits ?? item.completed_visits ?? 0,
		raw: item,
	};
};

const normalizeAvailabilitySchedule = (schedule = []) => {
	const createEmptyDay = () => ({ active: false, slots: [] });
	const normalized = DAY_KEYS.reduce((acc, key) => {
		acc[key] = createEmptyDay();
		return acc;
	}, {});

	const coerceDayKey = (value) => {
		if (value == null) {
			return null;
		}
		const working = String(value).trim().toLowerCase();
		if (DAY_KEYS.includes(working)) {
			return working;
		}
		const numericIndex = Number.parseInt(working, 10);
		if (!Number.isNaN(numericIndex) && DAY_KEYS[numericIndex]) {
			return DAY_KEYS[numericIndex];
		}
		return null;
	};

	const appendSlot = (dayKey, slot) => {
		if (!dayKey || !normalized[dayKey]) {
			return null;
		}

		const start = slot?.start_time || slot?.start || slot?.from;
		const end = slot?.end_time || slot?.end || slot?.to;
		if (!start || !end) {
			return null;
		}

		const available = slot?.available !== false && slot?.is_available !== false;
		normalized[dayKey].slots.push({
			id: slot?.id ?? slot?.slot_id ?? null,
			start,
			end,
			available,
		});

		return available;
	};

	if (Array.isArray(schedule)) {
		schedule.forEach((slot) => {
			const dayKey =
				coerceDayKey(slot?.day) ||
				coerceDayKey(slot?.day_of_week) ||
				coerceDayKey(slot?.day_index) ||
				DAY_KEYS[0];

			const appendedAvailable = appendSlot(dayKey, slot);
			if (appendedAvailable !== null) {
				normalized[dayKey].active =
					normalized[dayKey].active || appendedAvailable || normalized[dayKey].slots.length > 0;
			}
		});

		return normalized;
	}

	if (schedule && typeof schedule === 'object') {
		DAY_KEYS.forEach((dayKey) => {
			const entry =
				schedule[dayKey] ||
				schedule[dayKey.charAt(0).toUpperCase() + dayKey.slice(1)] ||
				schedule[dayKey.toUpperCase()] ||
				null;

			if (!entry) {
				return;
			}

			const slotsSource = entry.time_slots || entry.slots || entry.timeSlots || [];
			const isActive = entry.active ?? entry.is_active ?? Boolean(slotsSource?.length);

			const normalizedSlots = Array.isArray(slotsSource)
				? slotsSource
					  .map((slot) => {
						  const start = slot?.start_time || slot?.start || slot?.from;
						  const end = slot?.end_time || slot?.end || slot?.to;
						  if (!start || !end) {
							  return null;
						  }
						  return {
							  id: slot?.id ?? slot?.slot_id ?? null,
							  start,
							  end,
							  available: slot?.available !== false && slot?.is_available !== false,
						  };
					  })
					  .filter(Boolean)
				: [];

			normalized[dayKey] = {
				active: Boolean(isActive) || normalizedSlots.length > 0,
				slots: normalizedSlots,
			};
		});

		return normalized;
	}

	return normalized;
};

const buildAvailabilityPayload = (schedule = {}) => {
	const weeklySchedule = DAY_KEYS.reduce((acc, dayKey) => {
		const entry = schedule[dayKey] || {};
		const rawSlots = Array.isArray(entry.slots) ? entry.slots : [];
		const timeSlots = rawSlots
			.filter((slot) => slot && slot.start && slot.end)
			.map((slot) => ({
				id: slot.id ?? undefined,
				start_time: slot.start,
				end_time: slot.end,
				available: slot.available !== false && slot.is_available !== false,
			}));

		acc[dayKey] = {
			active: Boolean(entry.active) || timeSlots.length > 0,
			time_slots: timeSlots,
		};
		return acc;
	}, {});

	return { weekly_schedule: weeklySchedule };
};

const normalizeScheduleEntry = (item, index = 0) => {
	if (!item) return null;
	const timeValue = item.time || item.appointment_time || '';
	const statusRaw = (item.status || 'scheduled').toLowerCase();

	return {
		id: item.id ?? `schedule-${index}`,
		time: timeValue,
		timeDisplay: timeValue ? formatTimeTo12Hour(timeValue) : '',
		patientName: item.patient_name || item.patient || 'Unknown Patient',
		type: item.appointment_type || item.type || 'Consultation',
		status: statusRaw,
		statusLabel: formatDisplay(statusRaw),
		raw: item,
	};
};

export function DoctorDataProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [doctorInfo, setDoctorInfo] = useState(null);
	const [todayStats, setTodayStats] = useState(null);
	const [todaySchedule, setTodaySchedule] = useState([]);
	const [dashboardLoading, setDashboardLoading] = useState(true);

	const [appointments, setAppointments] = useState([]);
	const [appointmentsLoading, setAppointmentsLoading] = useState(true);
	const [appointmentSummary, setAppointmentSummary] = useState(null);
	const [appointmentFilters, setAppointmentFilters] = useState({ period: 'all', status: 'all', type: 'all' });

	const [allPatients, setAllPatients] = useState([]);
	const [patients, setPatients] = useState([]);
	const [patientsLoading, setPatientsLoading] = useState(true);
	const [patientsQuery, setPatientsQueryState] = useState({ search: '', blood_group: '', page: 1 });
	const [patientPagination, setPatientPagination] = useState({
		page: 1,
		totalPages: 1,
		totalItems: 0,
		pageSize: PATIENTS_PAGE_SIZE,
	});

	const [availability, setAvailability] = useState(() => normalizeAvailabilitySchedule());
	const [availabilityMeta, setAvailabilityMeta] = useState({
		defaultHours: { start: '09:00', end: '17:00' },
		slotDurationMinutes: 60,
	});
	const [availabilityLoading, setAvailabilityLoading] = useState(true);
	const [availabilitySaving, setAvailabilitySaving] = useState(false);

	const [errors, setErrors] = useState({});

	const patientDetailCache = useRef(new Map());

	const setError = useCallback((key, value) => {
		setErrors((prev) => ({ ...prev, [key]: value || null }));
	}, []);

	const loadProfile = useCallback(async () => {
		const response = await authAPI.getProfile();
		if (response?.success) {
			setCurrentUser(response.data?.user || response.data || null);
		}
	}, []);

	const loadDashboard = useCallback(async () => {
		setDashboardLoading(true);
		setError('dashboard', null);

		try {
			const response = await doctorAPI.getDashboard();
			if (response.success) {
				const data = response.data || {};
				const doctorDetails = data.doctor_info || {};
				const scheduleList = (data.today_schedule || data.todays_schedule || data.schedule || [])
					.map((item, index) => normalizeScheduleEntry(item, index))
					.filter(Boolean);

				const specializationValue =
					doctorDetails.specialization ||
					doctorDetails.speciality ||
					data.doctor_specialization ||
					data.specialization ||
					'';

				setDoctorInfo({
					id: doctorDetails.id || null,
					name: doctorDetails.name || doctorDetails.full_name || data.doctor_name || 'Doctor',
					specialization: specializationValue || 'Specialization',
					department: doctorDetails.department || data.doctor_department || data.department || '',
					email: doctorDetails.email || doctorDetails.contact_email || '',
					phone: doctorDetails.phone || doctorDetails.contact_phone || '',
				});

				const stats = data.today_stats || {};
				setTodayStats({
					scheduled_appointments:
						stats.scheduled_appointments ??
						data.today_patients ??
						scheduleList.length,
					total_patients: stats.total_patients ?? data.total_patients ?? 0,
					completed_appointments: stats.completed_appointments ?? data.completed_today ?? 0,
					pending_appointments: stats.pending_appointments ?? data.pending_today ?? 0,
				});

				setTodaySchedule(scheduleList);
			} else {
				setDoctorInfo((prev) => prev || null);
				setTodayStats(null);
				setTodaySchedule([]);
				setError('dashboard', response.error || 'Failed to load dashboard.');
			}
		} catch (error) {
			console.error('Failed to load doctor dashboard:', error);
			setDoctorInfo((prev) => prev || null);
			setTodayStats(null);
			setTodaySchedule([]);
			setError('dashboard', 'Failed to load dashboard data.');
		} finally {
			setDashboardLoading(false);
		}
	}, [setError]);

	const statusFilterValue = appointmentFilters.status || 'all';
	const typeFilterValue = appointmentFilters.type || 'all';

	const loadAppointments = useCallback(async () => {
		setAppointmentsLoading(true);
		setError('appointments', null);

		try {
			const params = {
				status: statusFilterValue,
				type: typeFilterValue,
				period: 'all',
			};

			const response = await doctorAPI.getAppointments(params);
			if (response.success) {
				const data = response.data || {};
				const list = data.appointments || data.results || data || [];
				const normalized = Array.isArray(list)
					? list.map((item, index) => normalizeAppointment(item, index)).filter(Boolean)
					: [];

				setAppointments(normalized);
				setAppointmentSummary({
					total: data.total ?? data.total_count ?? normalized.length,
					filters: {
						period: 'all',
						status: statusFilterValue,
						type: typeFilterValue,
					},
				});
			} else {
				setAppointments([]);
				setAppointmentSummary(null);
				setError('appointments', response.error || 'Failed to load appointments.');
			}
		} catch (error) {
			console.error('Failed to load doctor appointments:', error);
			setAppointments([]);
			setAppointmentSummary(null);
			setError('appointments', 'Failed to load appointments.');
		} finally {
			setAppointmentsLoading(false);
		}
	}, [statusFilterValue, typeFilterValue, setError]);

	const applyPatientFilters = useCallback(
		(sourceList, query) => {
			const searchValue = (query.search || '').trim().toLowerCase();
			const bloodFilter = (query.blood_group || '').toLowerCase();

			const filtered = sourceList.filter((patient) => {
				const matchesSearch =
					!searchValue ||
					patient.name.toLowerCase().includes(searchValue) ||
					patient.contact.email.toLowerCase().includes(searchValue) ||
					patient.contact.phone.toLowerCase().includes(searchValue) ||
					String(patient.id).toLowerCase().includes(searchValue);

				const matchesBlood = !bloodFilter || (patient.bloodGroup || '').toLowerCase() === bloodFilter;

				return matchesSearch && matchesBlood;
			});

			const totalItems = filtered.length;
			const totalPages = Math.max(1, Math.ceil(totalItems / PATIENTS_PAGE_SIZE));
			const currentPage = Math.min(totalPages, Math.max(1, query.page || 1));
			const start = (currentPage - 1) * PATIENTS_PAGE_SIZE;
			const end = start + PATIENTS_PAGE_SIZE;

			return {
				list: filtered.slice(start, end),
				meta: {
					page: currentPage,
					totalPages,
					totalItems,
					pageSize: PATIENTS_PAGE_SIZE,
				},
			};
		},
		[]
	);

	const loadPatients = useCallback(async () => {
		setPatientsLoading(true);
		setError('patients', null);

		try {
			const response = await doctorAPI.getPatients();
			if (response.success) {
				const data = response.data || {};
				const list = data.patients || data.results || data || [];
				const normalized = Array.isArray(list)
					? list.map((item, index) => normalizePatient(item, index)).filter(Boolean)
					: [];

				setAllPatients(normalized);
			} else {
				setAllPatients([]);
				setError('patients', response.error || 'Failed to load patients.');
			}
		} catch (error) {
			console.error('Failed to load doctor patients:', error);
			setAllPatients([]);
			setError('patients', 'Failed to load patients.');
		} finally {
			setPatientsLoading(false);
		}
	}, [setError]);

	useEffect(() => {
		const { list, meta } = applyPatientFilters(allPatients, patientsQuery);
		setPatients(list);
		setPatientPagination(meta);
	}, [allPatients, patientsQuery, applyPatientFilters]);

	const loadAvailability = useCallback(async () => {
		setAvailabilityLoading(true);
		setError('availability', null);

		try {
			const response = await doctorAPI.getAvailability();
			if (response.success) {
				const data = response.data || {};
				const schedule =
					data.weekly_schedule ||
					data.schedule ||
					data.availability ||
					{};
				setAvailability(normalizeAvailabilitySchedule(schedule));

				const config = data.config || {};
				const defaultHours = config.default_hours || {};
				setAvailabilityMeta((prev) => ({
					...prev,
					doctorName: data.doctor_name || prev.doctorName || '',
					defaultHours: {
						start: defaultHours.start || prev.defaultHours?.start || '09:00',
						end: defaultHours.end || prev.defaultHours?.end || '17:00',
					},
					slotDurationMinutes:
						config.slot_duration_minutes ??
						data.slot_duration_minutes ??
						prev.slotDurationMinutes ??
						60,
				}));
			} else {
				setAvailability(normalizeAvailabilitySchedule());
				setError('availability', response.error || 'Failed to load availability.');
			}
		} catch (error) {
			console.error('Failed to load doctor availability:', error);
			setAvailability(normalizeAvailabilitySchedule());
			setError('availability', 'Failed to load availability.');
		} finally {
			setAvailabilityLoading(false);
		}
	}, [setError]);

	const refreshDashboard = useCallback(async () => {
		await loadDashboard();
	}, [loadDashboard]);

	const refreshAppointments = useCallback(async () => {
		await loadAppointments();
	}, [loadAppointments]);

	const refreshPatients = useCallback(async () => {
		await loadPatients();
	}, [loadPatients]);

	const refreshAvailability = useCallback(async () => {
		await loadAvailability();
	}, [loadAvailability]);

	const updateAppointmentStatus = useCallback(
		async (appointmentId, status, notes = '') => {
			if (!appointmentId) {
				return { success: false, error: 'Appointment ID is required.' };
			}

			try {
				const payload = { status };
				if (notes) {
					payload.doctor_notes = notes;
				}

				const response = await doctorAPI.updateAppointmentStatus(appointmentId, payload);
				if (response.success) {
					await refreshAppointments();
					return { success: true };
				}

				return { success: false, error: response.error || 'Failed to update appointment status.' };
			} catch (error) {
				console.error('Failed to update appointment status:', error);
				return { success: false, error: 'Failed to update appointment status.' };
			}
		},
		[refreshAppointments]
	);

	const saveAvailability = useCallback(
		async (scheduleMap) => {
			setAvailabilitySaving(true);
			setError('availability', null);

			try {
				const payload = buildAvailabilityPayload(scheduleMap);
				const response = await doctorAPI.updateAvailability(payload);
				if (response.success) {
					const data = response.data || {};
					const schedule =
						data.weekly_schedule ||
						data.schedule ||
						data.availability ||
						scheduleMap;
					setAvailability(normalizeAvailabilitySchedule(schedule));

					const config = data.config || {};
					const defaultHours = config.default_hours || {};
					setAvailabilityMeta((prev) => ({
						...prev,
						doctorName: data.doctor_name || prev.doctorName || '',
						defaultHours: {
							start: defaultHours.start || prev.defaultHours?.start || '09:00',
							end: defaultHours.end || prev.defaultHours?.end || '17:00',
						},
						slotDurationMinutes:
							config.slot_duration_minutes ??
							data.slot_duration_minutes ??
							prev.slotDurationMinutes ??
							60,
					}));

					return {
						success: true,
						message: data.message || 'Schedule updated successfully.',
					};
				}

				const message = response.error || 'Failed to update availability.';
				setError('availability', message);
				return { success: false, message };
			} catch (error) {
				console.error('Failed to update availability:', error);
				const message = 'Failed to update availability.';
				setError('availability', message);
				return { success: false, message };
			} finally {
				setAvailabilitySaving(false);
			}
		},
		[setError, setAvailabilityMeta]
	);

	const setPatientsQuery = useCallback((updater) => {
		setPatientsQueryState((prev) => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			return {
				search: next.search ?? '',
				blood_group: next.blood_group ?? '',
				page: next.page ?? 1,
			};
		});
	}, []);

	const loadPatientDetail = useCallback(
		async (patientId, { forceRefresh = false } = {}) => {
			if (!patientId) {
				throw new Error('Patient ID is required.');
			}

			const cacheKey = patientId.toString();
			if (!forceRefresh && patientDetailCache.current.has(cacheKey)) {
				return patientDetailCache.current.get(cacheKey);
			}

			const response = await doctorAPI.getPatientDetail(patientId);
			if (response.success) {
				patientDetailCache.current.set(cacheKey, response.data);
				return response.data;
			}

			throw new Error(response.error || 'Failed to load patient details.');
		},
		[]
	);

	useEffect(() => {
		loadProfile();
	}, [loadProfile]);

	useEffect(() => {
		loadDashboard();
	}, [loadDashboard]);

	useEffect(() => {
		loadAvailability();
	}, [loadAvailability]);

	useEffect(() => {
		loadPatients();
	}, [loadPatients]);

	useEffect(() => {
		loadAppointments();
	}, [loadAppointments]);

	const contextValue = useMemo(
		() => ({
			currentUser,
			doctorInfo,
			todayStats,
			todaySchedule,
			dashboardLoading,
			refreshDashboard,

			appointments,
			appointmentsLoading,
			appointmentSummary,
			appointmentFilters,
			setAppointmentFilters,
			refreshAppointments,
			updateAppointmentStatus,

			patients,
			patientsLoading,
			patientsQuery,
			setPatientsQuery,
			patientPagination,
			refreshPatients,
			loadPatientDetail,

			availability,
			availabilityMeta,
			availabilityLoading,
			availabilitySaving,
			saveAvailability,
			refreshAvailability,

			errors,
		}),
		[
			appointments,
			appointmentsLoading,
			appointmentFilters,
			appointmentSummary,
			availability,
			availabilityLoading,
			availabilityMeta,
			availabilitySaving,
			currentUser,
			dashboardLoading,
			doctorInfo,
			errors,
			loadPatientDetail,
			patients,
			patientsLoading,
			patientsQuery,
			patientPagination,
			refreshAppointments,
			refreshAvailability,
			refreshDashboard,
			refreshPatients,
			saveAvailability,
			setAppointmentFilters,
			setPatientsQuery,
			todaySchedule,
			todayStats,
			updateAppointmentStatus,
		]
	);

	return <DoctorDataContext.Provider value={contextValue}>{children}</DoctorDataContext.Provider>;
}

export function useDoctorData() {
	return useContext(DoctorDataContext);
}
