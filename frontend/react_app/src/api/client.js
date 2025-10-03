// API Client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh for 401 errors
      if (response.status === 401 && this.token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers.Authorization = `Bearer ${this.token}`;
          return fetch(url, config);
        } else {
          this.logout();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async login(username, password) {
    try {
      const response = await this.request('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.access) {
        this.token = response.access;
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        return response;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await this.request('/api/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.access) {
        this.token = response.access;
        localStorage.setItem('access_token', response.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  }

  // API endpoints
  async getCurrentUser() {
    return this.get('/api/users/me/');
  }

  // Doctor endpoints
  async getDoctors() {
    return this.get('/api/doctors/');
  }

  async getDoctor(id) {
    return this.get(`/api/doctors/${id}/`);
  }

  async createDoctor(doctorData) {
    return this.post('/api/doctors/', doctorData);
  }

  async updateDoctor(id, doctorData) {
    return this.put(`/api/doctors/${id}/`, doctorData);
  }

  async deleteDoctor(id) {
    return this.delete(`/api/doctors/${id}/`);
  }

  // Patient endpoints
  async getPatients() {
    return this.get('/api/patients/');
  }

  async getPatient(id) {
    return this.get(`/api/patients/${id}/`);
  }

  async getCurrentPatient() {
    return this.get('/api/patients/me/');
  }

  async createPatient(patientData) {
    return this.post('/api/patients/', patientData);
  }

  async updatePatient(id, patientData) {
    return this.put(`/api/patients/${id}/`, patientData);
  }

  async deletePatient(id) {
    return this.delete(`/api/patients/${id}/`);
  }

  // Appointment endpoints
  async getAppointments() {
    return this.get('/api/appointments/');
  }

  async getAppointment(id) {
    return this.get(`/api/appointments/${id}/`);
  }

  async createAppointment(appointmentData) {
    return this.post('/api/appointments/', appointmentData);
  }

  async updateAppointment(id, appointmentData) {
    return this.put(`/api/appointments/${id}/`, appointmentData);
  }

  async deleteAppointment(id) {
    return this.delete(`/api/appointments/${id}/`);
  }

  // User management endpoints
  async getUsers() {
    return this.get('/api/users/');
  }

  async createUser(userData) {
    return this.post('/api/users/', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/api/users/${id}/`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/api/users/${id}/`);
  }

  // Password reset
  async resetPassword(newPassword) {
    return this.post('/api/password-reset/', { new_password: newPassword });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;