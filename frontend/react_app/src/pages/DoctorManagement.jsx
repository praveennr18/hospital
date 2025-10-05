import React, { useState } from 'react';
import './DoctorManagement.css';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import { useNavigate } from 'react-router-dom';
import DeleteDoctorModal from './DeleteDoctorModal';

const specialtyColors = {
  'Cardiology': 'badge-red',
  'Neurology': 'badge-purple',
  'Pediatrics': 'badge-pink',
  'Orthopedics': 'badge-blue',
  'Dermatology': 'badge-green',
  'General Medicine': 'badge-gray',
};

export default function DoctorManagement({ setAdminLoggedIn }) {
  const { doctors, deleteDoctor, loading, refreshData, error } = useAdminData();
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (doctor) => {
    setActionError('');
    setSelectedDoctor(doctor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDoctor) {
      const result = await deleteDoctor(selectedDoctor.id);
      if (result?.success) {
        setDeleteModalOpen(false);
        setSelectedDoctor(null);
        setActionError('');
        refreshData();
      } else {
        setActionError(result?.error || 'Unable to delete doctor.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <AdminLayout active="doctors" setAdminLoggedIn={setAdminLoggedIn}>
      <DeleteDoctorModal
        doctor={selectedDoctor}
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <div className="doctor-main">
        <div className="doctor-header-row">
          <div>
            <div className="doctor-header-title">Doctor Management</div>
            <div className="doctor-header-desc">Manage doctor profiles and credentials</div>
          </div>
          <button className="doctor-add-btn" onClick={() => navigate('/admin/register-doctor')}>+ Add Doctor</button>
        </div>
        <div className="doctor-directory-card">
          <div className="doctor-directory-title">Doctor Directory</div>
          <div className="doctor-directory-desc">Manage all registered doctors and their information</div>
          <div className="doctor-search-row">
            <input
              className="doctor-search"
              placeholder="Search doctors by name, specialty, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="doctor-refresh-btn" type="button" onClick={refreshData} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          {(error || actionError) && (
            <div className="doctor-error-banner">{actionError || error}</div>
          )}
          <div className="doctor-table-wrap">
            {loading ? (
              <div className="doctor-loading">Loading doctors…</div>
            ) : (
              <table className="doctor-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#7a7a7a' }}>
                        No doctors found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <div className="doctor-avatar">{doc.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3)}</div>
                          <div className="doctor-info">
                            <div className="doctor-name">{doc.name}</div>
                            <div className="doctor-id">ID: {doc.id}</div>
                          </div>
                        </td>
                        <td><span className={`doctor-badge ${specialtyColors[doc.specialty] || 'badge-gray'}`}>{doc.specialty}</span></td>
                        <td>{doc.experience} years</td>
                        <td>
                          <div>{doc.email}</div>
                          <div>{doc.phone}</div>
                        </td>
                        <td>
                          <button className="doctor-action-btn" onClick={() => navigate(`/admin/doctors/edit/${doc.id}`)}><span role="img" aria-label="edit">✏️</span></button>
                          <button className="doctor-action-btn" onClick={() => handleDeleteClick(doc)}><span role="img" aria-label="delete">🗑️</span></button>
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
