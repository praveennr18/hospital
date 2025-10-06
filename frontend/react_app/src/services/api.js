import { API_ENDPOINTS, getDefaultHeaders, getFullUrl } from '../config/api.js';

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (response.status === 204 || !isJson) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse response JSON:', error);
    return null;
  }
};

const createSuccess = (data = null, extras = {}) => ({
  success: true,
  data,
  ...extras,
});

const createFailure = (error) => {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
      details: error.payload,
    };
  }

  return {
    success: false,
    error: typeof error === 'string' ? error : 'Unexpected error occurred',
  };
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          query.append(key, item);
        }
      });
    } else {
      query.append(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const storageKeys = {
  access: 'access_token',
  refresh: 'refresh_token',
  user: 'user_data',
  role: 'userRole',
  email: 'userEmail',
};

export const clearAuthData = () => {
  Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
};

export const saveAuthData = (data) => {
  if (!data) return;

  const { access, refresh, user } = data;

  if (access) {
    localStorage.setItem(storageKeys.access, access);
  }
  if (refresh) {
    localStorage.setItem(storageKeys.refresh, refresh);
  }
  if (user) {
    localStorage.setItem(storageKeys.user, JSON.stringify(user));
    if (user.role) {
      localStorage.setItem(storageKeys.role, String(user.role).toLowerCase());
    }
    if (user.email) {
      localStorage.setItem(storageKeys.email, user.email);
    }
  }
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem(storageKeys.user);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    return null;
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem(storageKeys.access));

export const getUserRole = () => {
  const user = getCurrentUser();
  if (user?.role) {
    return String(user.role).toLowerCase();
  }
  const storedRole = localStorage.getItem(storageKeys.role);
  return storedRole ? storedRole.toLowerCase() : null;
};

const getErrorMessage = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== 'object') {
    return fallbackMessage;
  }

  if (typeof payload.detail === 'string') {
    return payload.detail;
  }
  if (Array.isArray(payload.detail)) {
    return payload.detail.join(', ');
  }
  if (typeof payload.message === 'string') {
    return payload.message;
  }
  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }
  if (payload.non_field_errors) {
    if (Array.isArray(payload.non_field_errors)) {
      return payload.non_field_errors.join(', ');
    }
    return payload.non_field_errors;
  }

  const firstKey = Object.keys(payload)[0];
  const value = payload[firstKey];

  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }

  return fallbackMessage;
};

const handleHttpResponse = async (response) => {
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(data, response.statusText || 'Request failed');
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

const refreshToken = async () => {
  const refresh = localStorage.getItem(storageKeys.refresh);
  if (!refresh) {
    return createFailure(new Error('Missing refresh token.'));
  }

  try {
    const response = await fetch(getFullUrl(API_ENDPOINTS.TOKEN_REFRESH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refresh }),
    });

    const data = await parseResponseBody(response);

    if (!response.ok || !data?.access) {
      clearAuthData();
      const message = getErrorMessage(data, 'Token refresh failed');
      return createFailure(new Error(message));
    }

    localStorage.setItem(storageKeys.access, data.access);

    if (data.refresh) {
      localStorage.setItem(storageKeys.refresh, data.refresh);
    }

    return createSuccess({ access: data.access, refresh: data.refresh ?? refresh });
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthData();
    return createFailure(error);
  }
};

const normalizeRequestOptions = (options = {}) => {
  const headers = {
    ...getDefaultHeaders(),
    ...(options.headers || {}),
  };

  const isBodyObject = options.body && typeof options.body === 'object' && !(options.body instanceof FormData);

  return {
    ...options,
    headers,
    body: isBodyObject ? JSON.stringify(options.body) : options.body,
  };
};

const apiRequest = async (endpoint, options = {}, { skipAuthRefresh = false } = {}) => {
  const url = getFullUrl(endpoint);
  const requestOptions = normalizeRequestOptions(options);

  try {
    const response = await fetch(url, requestOptions);

    if (response.status === 401 && !skipAuthRefresh) {
      const refreshResult = await refreshToken();
      if (refreshResult.success) {
        const retryOptions = normalizeRequestOptions(options);
        const retryResponse = await fetch(url, retryOptions);
        return await handleHttpResponse(retryResponse);
      }

      throw new Error('Unauthorized. Please log in again.');
    }

    return await handleHttpResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const wrapRequest = async (executor, transform) => {
  try {
    const data = await executor();
    return createSuccess(transform ? transform(data) : data);
  } catch (error) {
    console.error('API wrapper error:', error);
    return createFailure(error);
  }
};

export const authAPI = {
  login: (email, password, role = 'patient') =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: { email, password, role },
      })
    ),

  logout: async () => {
    const refresh = localStorage.getItem(storageKeys.refresh);

    if (!refresh) {
      clearAuthData();
      return createSuccess(null, { message: 'No active session.' });
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        body: { refresh },
      });
      clearAuthData();
      return createSuccess(data);
    } catch (error) {
      console.warn('Logout request failed:', error);
      clearAuthData();

      if (error.status === 400 || error.status === 401) {
        return createSuccess(null, { message: 'Session already ended.' });
      }

      return createFailure(error);
    }
  },

  getProfile: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PROFILE)),

  changePassword: (oldPassword, newPassword) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      })
    ),

  // Password Reset endpoints
  requestPasswordReset: (email) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        method: 'POST',
        body: { email },
      })
    ),

  verifyResetCode: (email, code) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PASSWORD_RESET_VERIFY, {
        method: 'POST',
        body: { email, code },
      })
    ),

  resetPassword: (email, code, newPassword, confirmPassword) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PASSWORD_RESET_RESET, {
        method: 'POST',
        body: {
          email,
          code,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      })
    ),
};

export const adminAPI = {
  getDashboardStats: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_DASHBOARD_STATS)),

  getUsers: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_USERS)),

  getDoctorsList: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_DOCTORS_LIST)),

  getDoctor: (doctorId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_DOCTOR_DETAIL(doctorId))),

  registerDoctor: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_REGISTER_DOCTOR, {
        method: 'POST',
        body: payload,
      })
    ),

  updateDoctor: (doctorId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_DOCTOR_DETAIL(doctorId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteDoctor: (doctorId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_DOCTOR_DETAIL(doctorId), {
        method: 'DELETE',
      })
    ),

  getPatientsList: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_PATIENTS_LIST)),

  getPatient: (patientId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_PATIENT_DETAIL(patientId))),

  registerPatient: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_REGISTER_PATIENT, {
        method: 'POST',
        body: payload,
      })
    ),

  updatePatient: (patientId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_PATIENT_DETAIL(patientId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deletePatient: (patientId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_PATIENT_DETAIL(patientId), {
        method: 'DELETE',
      })
    ),

  getUserDetail: (userId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_USER_DETAIL(userId))),

  updateUser: (userId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_USER_DETAIL(userId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteUser: (userId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_USER_DETAIL(userId), {
        method: 'DELETE',
      })
    ),

  resetPassword: (userId, newPassword) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.ADMIN_RESET_PASSWORD(userId), {
        method: 'POST',
        body: { new_password: newPassword },
      })
    ),

  getAppointments: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_APPOINTMENTS)),

  deleteAppointment: (appointmentId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.APPOINTMENT_DETAIL(appointmentId), {
        method: 'DELETE',
      })
    ),

  cancelAppointment: (appointmentId, cancellationReason) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.APPOINTMENT_CANCEL(appointmentId), {
        method: 'PATCH',
        body: { cancellation_reason: cancellationReason },
      })
    ),
};

export const patientAPI = {
  getProfile: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PATIENT_DASHBOARD)),

  getMedicalHistory: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PATIENT_MEDICAL_HISTORY)),

  addMedicalHistory: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICAL_HISTORY, {
        method: 'POST',
        body: payload,
      })
    ),

  updateMedicalHistory: (historyId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICAL_HISTORY_DETAIL(historyId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteMedicalHistory: (historyId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICAL_HISTORY_DETAIL(historyId), {
        method: 'DELETE',
      })
    ),

  getAllergies: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PATIENT_ALLERGIES)),

  addAllergy: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_ALLERGIES, {
        method: 'POST',
        body: payload,
      })
    ),

  updateAllergy: (allergyId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_ALLERGY_DETAIL(allergyId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteAllergy: (allergyId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_ALLERGY_DETAIL(allergyId), {
        method: 'DELETE',
      })
    ),

  getMedications: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PATIENT_MEDICATIONS)),

  addMedication: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICATIONS, {
        method: 'POST',
        body: payload,
      })
    ),

  updateMedication: (medicationId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICATION_DETAIL(medicationId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  deleteMedication: (medicationId) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.PATIENT_MEDICATION_DETAIL(medicationId), {
        method: 'DELETE',
      })
    ),

  getAppointments: () => wrapRequest(() => apiRequest(API_ENDPOINTS.PATIENT_APPOINTMENTS)),
};

export const doctorAPI = {
  getAll: () => wrapRequest(() => apiRequest(API_ENDPOINTS.ADMIN_DOCTORS_LIST)),

  getDashboard: () => wrapRequest(() => apiRequest(API_ENDPOINTS.DOCTOR_DASHBOARD)),

  getAppointments: (params = {}) =>
    wrapRequest(() =>
      apiRequest(`${API_ENDPOINTS.DOCTOR_APPOINTMENTS}${buildQueryString(params)}`)
    ),

  getAppointmentDetail: (appointmentId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.DOCTOR_APPOINTMENT_DETAIL(appointmentId))),

  updateAppointmentStatus: (appointmentId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.DOCTOR_APPOINTMENT_DETAIL(appointmentId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  getPatients: (params = {}) =>
    wrapRequest(() =>
      apiRequest(`${API_ENDPOINTS.DOCTOR_PATIENTS}${buildQueryString(params)}`)
    ),

  getPatientDetail: (patientId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.DOCTOR_PATIENT_DETAIL(patientId))),

  getAvailability: () => wrapRequest(() => apiRequest(API_ENDPOINTS.DOCTOR_AVAILABILITY)),

  updateAvailability: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.DOCTOR_AVAILABILITY, {
        method: 'PUT',
        body: payload,
      })
    ),
};

export const appointmentAPI = {
  list: (params = {}) =>
    wrapRequest(() =>
      apiRequest(`${API_ENDPOINTS.APPOINTMENTS}${buildQueryString(params)}`)
    ),

  detail: (appointmentId) =>
    wrapRequest(() => apiRequest(API_ENDPOINTS.APPOINTMENT_DETAIL(appointmentId))),

  create: (payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.APPOINTMENT_SCHEDULE, {
        method: 'POST',
        body: payload,
      })
    ),

  cancel: (appointmentId, payload = {}) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.APPOINTMENT_CANCEL(appointmentId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  reschedule: (appointmentId, payload) =>
    wrapRequest(() =>
      apiRequest(API_ENDPOINTS.APPOINTMENT_RESCHEDULE(appointmentId), {
        method: 'PATCH',
        body: payload,
      })
    ),

  getAvailableSlots: (params = {}) =>
    wrapRequest(() =>
      apiRequest(`${API_ENDPOINTS.APPOINTMENT_AVAILABLE_SLOTS}${buildQueryString(params)}`)
    ),

  getDepartments: () => wrapRequest(() => apiRequest(API_ENDPOINTS.APPOINTMENT_DEPARTMENTS)),

  getDoctorsByDepartment: (department) =>
    wrapRequest(() =>
      apiRequest(
        `${API_ENDPOINTS.APPOINTMENT_DOCTORS_BY_DEPARTMENT}${buildQueryString({ department })}`
      )
    ),
};