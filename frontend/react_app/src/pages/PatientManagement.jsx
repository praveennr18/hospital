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
  const { patients, deletePatient, loading, refreshData, error } = useAdminData();
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search)
  );

  const handleDeleteClick = (patient) => {
    setActionError('');
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPatient) {
      const result = await deletePatient(selectedPatient.id);
      if (result?.success) {
        setDeleteModalOpen(false);
        setSelectedPatient(null);
        setActionError('');
        refreshData();
      } else {
        setActionError(result?.error || 'Unable to delete patient.');
      }
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
            <button className="patient-refresh-btn" type="button" onClick={refreshData} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          {(error || actionError) && (
            <div className="patient-error-banner">{actionError || error}</div>
          )}
          <div className="patient-table-wrap">
            {loading ? (
              <div className="patient-loading">Loading patients…</div>
            ) : (
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#7a7a7a' }}>
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="patient-avatar">{p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                          <div className="patient-info">
                            <div className="patient-name">{p.name}</div>
                            <div className="patient-id">ID: {p.id}</div>
                          </div>
                        </td>
                        <td>{p.age} years<br/>{p.gender}</td>
                        <td><span className={`patient-badge ${bloodColors[p.blood] || 'badge-gray'}`}>{p.blood}</span></td>
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
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
