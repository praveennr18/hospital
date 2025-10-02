import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useNavigate } from 'react-router-dom';
import './PatientManagement.css';
import './ConfirmDeleteModal.css';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search)
  );
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
    console.log('Modal open:', true, 'Selected patient:', patient);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPatient(null);
  };
  const handleModalConfirm = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
    }
    setModalOpen(false);
    setSelectedPatient(null);
  };
  return (
  <AdminLayout active="patients" setAdminLoggedIn={setAdminLoggedIn}>
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
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="patient-avatar">{p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                      <div className="patient-info">
                        <div className="patient-name">{p.name}</div>
                        <div className="patient-id">ID: {p.id}</div>
                      </div>
                    </td>
                    <td>{p.age} years<br/>{p.gender}</td>
                    <td><span className={`patient-badge ${bloodColors[p.blood]}`}>{p.blood}</span></td>
                    <td>
                      <div>{p.email}</div>
                      <div>{p.phone}</div>
                    </td>
                    <td>{p.lastVisit}</td>
                    <td>
                      <button className="patient-action-btn" onClick={() => navigate(`/admin/patients/edit/${p.id}`)}><span role="img" aria-label="edit">✏️</span></button>
                      <button className="patient-action-btn" onClick={() => handleDeleteClick(p)}><span role="img" aria-label="delete">🗑️</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ConfirmDeleteModal
              open={modalOpen}
              onClose={handleModalClose}
              onConfirm={handleModalConfirm}
              type="Patient"
              name={selectedPatient?.name}
              id={selectedPatient?.id}
              requireReason={false}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
