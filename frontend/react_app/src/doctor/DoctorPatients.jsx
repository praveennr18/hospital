import React, { useState } from 'react';
import './DoctorPatients.css';
import DoctorPatientDetails from './DoctorPatientDetails';

const patients = [
  { id: 1, name: 'Sarah Johnson', initials: 'SJ', age: 40, gender: 'Female', blood: 'A+', contact: '(555) 123-4567', email: 'sarah.johnson@email.com', lastVisit: '3/15/2024' },
  { id: 2, name: 'Michael Chen', initials: 'MC', age: 53, gender: 'Male', blood: 'O-', contact: '(555) 234-5678', email: 'michael.chen@email.com', lastVisit: '3/10/2024' },
  { id: 3, name: 'Emily Rodriguez', initials: 'ER', age: 34, gender: 'Female', blood: 'B+', contact: '(555) 345-6789', email: 'emily.rodriguez@email.com', lastVisit: '2/28/2024' },
  { id: 4, name: 'Robert Williams', initials: 'RW', age: 70, gender: 'Male', blood: 'AB+', contact: '(555) 456-7890', email: 'robert.williams@email.com', lastVisit: '3/20/2024' },
  { id: 5, name: 'Jessica Davis', initials: 'JD', age: 37, gender: 'Female', blood: 'O+', contact: '(555) 567-8901', email: 'jessica.davis@email.com', lastVisit: '3/5/2024' },
];

const bloodColors = {
  'A+': 'blood-ap',
  'O-': 'blood-on',
  'B+': 'blood-bp',
  'AB+': 'blood-abp',
  'O+': 'blood-op',
};


export default function DoctorPatients() {

  const [selectedPatient, setSelectedPatient] = useState(null);

  if (selectedPatient) {
    return (
      <DoctorPatientDetails patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
    );
  }

  return (
    <div className="doc-pat-main">
      <div className="doc-pat-header-row">
        <div className="doc-pat-header-title">My Patients</div>
        <div className="doc-pat-header-desc">View and manage your assigned patients</div>
      </div>
      <div className="doc-pat-directory-card">
        <div className="doc-pat-directory-title">Patient Directory</div>
        <div className="doc-pat-directory-desc">Click on any patient to view their detailed medical information</div>
        <div className="doc-pat-search-row">
          <input className="doc-pat-search" placeholder="Search patients by name, email, or phone..." />
        </div>
        <div className="doc-pat-table-wrap">
          <table className="doc-pat-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((pat) => (
                <tr key={pat.id}>
                  <td>
                    <span className="doc-pat-avatar" style={{background: 'linear-gradient(135deg,#a259ff 0%,#3b5bdb 100%)'}}>{pat.initials}</span>
                    <span className="doc-pat-name">{pat.name}</span>
                    <div className="doc-pat-id">ID: {pat.id}</div>
                  </td>
                  <td>{pat.age} years<br/>{pat.gender}</td>
                  <td><span className={`doc-pat-blood-pill ${bloodColors[pat.blood]}`}>{pat.blood}</span></td>
                  <td>
                    <span className="doc-pat-contact">&#128222; {pat.contact}</span><br/>
                    <span className="doc-pat-email">&#9993; {pat.email}</span>
                  </td>
                  <td>{pat.lastVisit}</td>
                  <td><button className="doc-pat-action-btn" onClick={() => setSelectedPatient(pat)}><span role="img" aria-label="view">👁️</span> View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
