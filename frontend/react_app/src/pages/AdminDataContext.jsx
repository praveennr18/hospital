import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AdminDataContext = createContext();

export function AdminDataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [doctorsResponse, patientsResponse, appointmentsResponse] = await Promise.all([
        apiClient.getDoctors().catch(() => []),
        apiClient.getPatients().catch(() => []),
        apiClient.getAppointments().catch(() => [])
      ]);

      setDoctors(doctorsResponse);
      setPatients(patientsResponse);
      setAppointments(appointmentsResponse);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  // Doctor management functions
  const addDoctor = async (doctorData) => {
    try {
      const newDoctor = await apiClient.createDoctor(doctorData);
      setDoctors(docs => [...docs, newDoctor]);
      return newDoctor;
    } catch (error) {
      console.error('Failed to create doctor:', error);
      throw error;
    }
  };

  const editDoctor = async (id, doctorData) => {
    try {
      const updatedDoctor = await apiClient.updateDoctor(id, doctorData);
      setDoctors(docs => docs.map(d => d.id === id ? updatedDoctor : d));
      return updatedDoctor;
    } catch (error) {
      console.error('Failed to update doctor:', error);
      throw error;
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await apiClient.deleteDoctor(id);
      setDoctors(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      throw error;
    }
  };

  // Patient management functions
  const addPatient = async (patientData) => {
    try {
      const result = await apiClient.createPatient(patientData);
      // result: { patient, username, temp_password }
      if (result && result.patient) {
        setPatients(pats => [...pats, result.patient]);
      }
      return result;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw error;
    }
  };

  const editPatient = async (id, patientData) => {
    try {
      const updatedPatient = await apiClient.updatePatient(id, patientData);
      setPatients(pats => pats.map(p => p.id === id ? updatedPatient : p));
      return updatedPatient;
    } catch (error) {
      console.error('Failed to update patient:', error);
      throw error;
    }
  };

  const deletePatient = async (id) => {
    try {
      await apiClient.deletePatient(id);
      setPatients(pats => pats.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete patient:', error);
      throw error;
    }
  };

  // Appointment management functions
  const addAppointment = async (appointmentData) => {
    try {
      const newAppointment = await apiClient.createAppointment(appointmentData);
      setAppointments(appts => [...appts, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  };

  const editAppointment = async (id, appointmentData) => {
    try {
      const updatedAppointment = await apiClient.updateAppointment(id, appointmentData);
      setAppointments(appts => appts.map(a => a.id === id ? updatedAppointment : a));
      return updatedAppointment;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await apiClient.deleteAppointment(id);
      setAppointments(appts => appts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      throw error;
    }
  };

  const value = {
    doctors, 
    patients, 
    appointments,
    loading,
    error,
    addDoctor, 
    editDoctor, 
    deleteDoctor,
    addPatient, 
    editPatient, 
    deletePatient,
    addAppointment, 
    editAppointment, 
    deleteAppointment,
    refreshData: loadData
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
