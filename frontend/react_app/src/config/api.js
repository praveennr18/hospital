// API Configuration
export const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use proxy in development - empty string to use relative URLs
  : 'https://ae0d191691e5.ngrok-free.app'; // Direct URL in production

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/accounts/login/',
  LOGOUT: '/api/accounts/logout/',
  TOKEN_REFRESH: '/api/accounts/token/refresh/',
  
  // User Profile
  PROFILE: '/api/accounts/profile/',
  CHANGE_PASSWORD: '/api/accounts/change-password/',
  
  // Admin - Dashboard & Stats
  ADMIN_DASHBOARD_STATS: '/api/accounts/admin/dashboard/stats/',
  
  // Admin - User Management
  ADMIN_USERS: '/api/accounts/admin/users/',
  ADMIN_CREATE_USER: '/api/accounts/admin/users/create/',
  ADMIN_USER_DETAIL: (id) => `/api/accounts/admin/users/${id}/`,
  ADMIN_RESET_PASSWORD: (id) => `/api/accounts/admin/users/${id}/reset-password/`,
  
  // Admin - Registration
  ADMIN_REGISTER_PATIENT: '/api/accounts/admin/register/patient/',
  ADMIN_REGISTER_DOCTOR: '/api/accounts/admin/register/doctor/',
  
  // Admin - Management Lists
  ADMIN_DOCTORS_LIST: '/api/accounts/admin/doctors/list/',
  ADMIN_PATIENTS_LIST: '/api/accounts/admin/patients/list/',
  ADMIN_DOCTOR_DETAIL: (doctorId) => `/api/accounts/admin/doctors/${doctorId}/`,
  ADMIN_PATIENT_DETAIL: (patientId) => `/api/accounts/admin/patients/${patientId}/`,
  
  // Patients
  PATIENT_DASHBOARD: '/api/patients/my/dashboard/',
  PATIENT_MEDICAL_HISTORY: '/api/patients/my/medical-history/',
  PATIENT_MEDICAL_HISTORY_DETAIL: (id) => `/api/patients/my/medical-history/${id}/`,
  PATIENT_ALLERGIES: '/api/patients/my/allergies/',
  PATIENT_ALLERGY_DETAIL: (id) => `/api/patients/my/allergies/${id}/`,
  PATIENT_MEDICATIONS: '/api/patients/my/medications/',
  PATIENT_MEDICATION_DETAIL: (id) => `/api/patients/my/medications/${id}/`,
  PATIENT_APPOINTMENTS: '/api/patients/my/appointments/',
  
  // Doctors
  DOCTOR_DASHBOARD: '/api/doctors/my/dashboard/',
  DOCTOR_APPOINTMENTS: '/api/doctors/my/appointments/',
  DOCTOR_APPOINTMENT_DETAIL: (id) => `/api/doctors/my/appointments/${id}/`,
  DOCTOR_PATIENTS: '/api/doctors/my/patients/',
  DOCTOR_PATIENT_DETAIL: (id) => `/api/doctors/my/patients/${id}/`,
  DOCTOR_AVAILABILITY: '/api/doctors/my/availability/',
  DOCTOR_AVAILABILITY_ADD_SLOT: '/api/doctors/my/availability/add-slot/',
  DOCTOR_AVAILABILITY_SLOT_DETAIL: (slotId) => `/api/doctors/my/availability/slots/${slotId}/`,
  
  // Appointments
  APPOINTMENTS: '/api/appointments/',
  APPOINTMENT_DETAIL: (id) => `/api/appointments/${id}/`,
  APPOINTMENT_SCHEDULE: '/api/appointments/schedule/',
  APPOINTMENT_CANCEL: (id) => `/api/appointments/${id}/cancel/`,
  APPOINTMENT_RESCHEDULE: (id) => `/api/appointments/${id}/reschedule/`,
  APPOINTMENT_AVAILABLE_SLOTS: '/api/appointments/available-slots/',
  APPOINTMENT_DEPARTMENTS: '/api/appointments/departments/',
  APPOINTMENT_DOCTORS_BY_DEPARTMENT: '/api/appointments/doctors-by-department/',
  PATIENT_APPOINTMENTS: '/api/patients/my/appointments/',
  DOCTOR_APPOINTMENTS: '/api/doctors/my/appointments/',  
  ADMIN_APPOINTMENTS: '/api/appointments/',
};

// Default headers for API requests
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to construct full URL
export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};