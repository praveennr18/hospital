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

export function AdminDataProvider({ children }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [patients, setPatients] = useState(initialPatients);

  const addDoctor = doctor => setDoctors(docs => [...docs, doctor]);
  const editDoctor = updated => setDoctors(docs => docs.map(d => d.id === updated.id ? updated : d));
  const deleteDoctor = id => setDoctors(docs => docs.filter(d => d.id !== id));

  const addPatient = patient => setPatients(pats => [...pats, patient]);
  const editPatient = updated => setPatients(pats => pats.map(p => p.id === updated.id ? updated : p));
  const deletePatient = id => setPatients(pats => pats.filter(p => p.id !== id));

  return (
    <AdminDataContext.Provider value={{
      doctors, addDoctor, editDoctor, deleteDoctor,
      patients, addPatient, editPatient, deletePatient
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  return useContext(AdminDataContext);
}
