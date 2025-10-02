import React, { createContext, useContext, useState } from 'react';

const AdminDataContext = createContext();

const initialDoctors = [
  { id: 'DOC001', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', experience: 15, email: 'sarah.wilson@hospital.com', phone: '(555) 234-5678' },
  { id: 'DOC002', name: 'Dr. Michael Johnson', specialty: 'Neurology', experience: 18, email: 'michael.johnson@hospital.com', phone: '(555) 345-6789' },
  { id: 'DOC003', name: 'Dr. Emily Brown', specialty: 'Pediatrics', experience: 10, email: 'emily.brown@hospital.com', phone: '(555) 456-7890' },
  { id: 'DOC004', name: 'Dr. James Lee', specialty: 'Orthopedics', experience: 12, email: 'james.lee@hospital.com', phone: '(555) 567-8901' },
  { id: 'DOC005', name: 'Dr. Maria Garcia', specialty: 'Dermatology', experience: 14, email: 'maria.garcia@hospital.com', phone: '(555) 678-9012' },
  { id: 'DOC006', name: 'Dr. Robert Smith', specialty: 'General Medicine', experience: 25, email: 'robert.smith@hospital.com', phone: '(555) 789-0123' },
];

const initialPatients = [
  { id: 1, name: 'Sarah Johnson', age: 40, gender: 'Female', blood: 'A+', email: 'sarah.johnson@email.com', phone: '(555) 123-4567', lastVisit: '3/15/2024' },
  { id: 2, name: 'Michael Chen', age: 53, gender: 'Male', blood: 'O-', email: 'michael.chen@email.com', phone: '(555) 234-5678', lastVisit: '3/10/2024' },
  { id: 3, name: 'Emily Rodriguez', age: 34, gender: 'Female', blood: 'B+', email: 'emily.rodriguez@email.com', phone: '(555) 345-6789', lastVisit: '2/28/2024' },
  { id: 4, name: 'Robert Williams', age: 70, gender: 'Male', blood: 'AB+', email: 'robert.williams@email.com', phone: '(555) 456-7890', lastVisit: '3/20/2024' },
  { id: 5, name: 'Jessica Davis', age: 37, gender: 'Female', blood: 'O+', email: 'jessica.davis@email.com', phone: '(555) 567-8901', lastVisit: '3/5/2024' },
];

const initialAppointments = [
  { id: 1, patient: 'Sarah Johnson', patientInitials: 'SJ', doctor: 'Dr. Smith', date: '3/25/2024', time: '09:00', type: 'Follow-Up', status: 'Scheduled' },
  { id: 2, patient: 'Michael Chen', patientInitials: 'MC', doctor: 'Dr. Johnson', date: '3/25/2024', time: '10:30', type: 'Consultation', status: 'Scheduled' },
  { id: 3, patient: 'Emily Rodriguez', patientInitials: 'ER', doctor: 'Dr. Brown', date: '3/26/2024', time: '14:00', type: 'Follow-Up', status: 'Scheduled' },
  { id: 4, patient: 'Robert Williams', patientInitials: 'RW', doctor: 'Dr. Wilson', date: '3/24/2024', time: '11:00', type: 'Procedure', status: 'Completed' },
  { id: 5, patient: 'Jessica Davis', patientInitials: 'JD', doctor: 'Dr. Lee', date: '3/27/2024', time: '15:30', type: 'Consultation', status: 'Scheduled' },
  { id: 6, patient: 'Sarah Johnson', patientInitials: 'SJ', doctor: 'Dr. Smith', date: '3/22/2024', time: '10:00', type: 'Consultation', status: 'Cancelled' },
  { id: 7, patient: 'Michael Chen', patientInitials: 'MC', doctor: 'Dr. Johnson', date: '3/23/2024', time: '09:30', type: 'Follow-Up', status: 'No-Show' },
  { id: 8, patient: 'Emily Rodriguez', patientInitials: 'ER', doctor: 'Dr. Brown', date: '3/21/2024', time: '16:00', type: 'Consultation', status: 'Cancelled' },
  { id: 9, patient: 'Robert Williams', patientInitials: 'RW', doctor: 'Dr. Wilson', date: '4/5/2024', time: '11:30', type: 'Follow-Up', status: 'Scheduled' },
  { id: 10, patient: 'Jessica Davis', patientInitials: 'JD', doctor: 'Dr. Lee', date: '4/10/2024', time: '13:00', type: 'Consultation', status: 'Scheduled' },
];

export function AdminDataProvider({ children }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);

  const addDoctor = doctor => setDoctors(docs => [...docs, doctor]);
  const editDoctor = updated => setDoctors(docs => docs.map(d => d.id === updated.id ? updated : d));
  const deleteDoctor = id => setDoctors(docs => docs.filter(d => d.id !== id));

  const addPatient = patient => setPatients(pats => [...pats, patient]);
  const editPatient = updated => setPatients(pats => pats.map(p => p.id === updated.id ? updated : p));
  const deletePatient = id => setPatients(pats => pats.filter(p => p.id !== id));

  const addAppointment = appt => setAppointments(appts => [...appts, appt]);
  const editAppointment = updated => setAppointments(appts => appts.map(a => a.id === updated.id ? updated : a));
  const deleteAppointment = id => setAppointments(appts => appts.filter(a => a.id !== id));

  return (
    <AdminDataContext.Provider value={{
      doctors, addDoctor, editDoctor, deleteDoctor,
      patients, addPatient, editPatient, deletePatient,
      appointments, addAppointment, editAppointment, deleteAppointment
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext);
}
