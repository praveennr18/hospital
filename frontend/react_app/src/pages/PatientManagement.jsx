import React, { useState } from 'react';
import DeletePatientModal from './DeletePatientModal';
import { useNavigate } from 'react-router-dom';
import './PatientManagement.css';
import AdminLayout from './AdminLayout';

import { useAdminData } from './AdminDataContext';

const bloodColors = {
  'A+': 'badge-red',
  'O-': 'badge-green',
  'B+': 'badge-blue',
  'AB+': 'badge-purple',
  'O+': 'badge-green',
};


export default function PatientManagement({ setAdminLoggedIn }) {
  const { patients, deletePatient } = useAdminData();
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  // Log patient data for debugging
  console.log('Patient data:', patients);
  // Defensive: handle missing fields and backend structure
  const filtered = (patients || []).filter(p => {
    const name = p.name || (p.user ? `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() : '');
    const email = p.email || (p.user ? p.user.email : '');
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search)
    );
  });

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
      setDeleteModalOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <AdminLayout active="patients" setAdminLoggedIn={setAdminLoggedIn}>
      <DeletePatientModal
        patient={selectedPatient}
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <div className="patient-main">
        <div className="patient-header-row">
          <div>
            <div className="patient-header-title">Patient Management</div>
            <div className="patient-header-desc">Manage patient records and information</div>
          </div>
          <button className="patient-add-btn" onClick={() => navigate('/admin/register-patient')}>+ Add Patient</button>
        </div>
        <div className="patient-directory-card">
          <div className="patient-directory-title">Patient Directory</div>
          <div className="patient-directory-desc">Manage all registered patients and their basic information</div>
          <div className="patient-search-row">
            <input
              className="patient-search"
              placeholder="Search patients by name, email, or patient ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="patient-table-wrap">
            <table className="patient-table">
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
                {filtered.map(p => {
                  // Defensive: support both old and new patient data structures
                  const name = p.name || (p.user ? `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() : '');
                  const email = p.email || (p.user ? p.user.email : '');
                  const gender = p.gender || (p.user ? p.user.gender : '');
                  const blood = p.blood || (p.user ? p.user.blood : '');
                  const phone = p.phone || (p.user ? p.user.phone : '');
                  const id = p.id;
                  // Age calculation from dob if available
                  let age = p.age;
                  if (!age && p.dob) {
                    const birthYear = new Date(p.dob).getFullYear();
                    if (!isNaN(birthYear)) age = new Date().getFullYear() - birthYear;
                  }
                  return (
                    <tr key={id}>
                      <td>
                        <div className="patient-avatar">{name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                        <div className="patient-info">
                          <div className="patient-name">{name}</div>
                          <div className="patient-id">ID: {id}</div>
                        </div>
                      </td>
                      <td>{age ? `${age} years` : ''}<br/>{gender}</td>
                      <td><span className={`patient-badge ${bloodColors[blood]}`}>{blood}</span></td>
                      <td>
                        <div>{email}</div>
                        <div>{phone}</div>
                      </td>
                      <td>{p.lastVisit || ''}</td>
                      <td>
                        <button className="patient-action-btn" onClick={() => navigate(`/admin/patients/edit/${id}`)}><span role="img" aria-label="edit">✏️</span></button>
                        <button className="patient-action-btn" onClick={() => handleDeleteClick(p)}><span role="img" aria-label="delete">🗑️</span></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
