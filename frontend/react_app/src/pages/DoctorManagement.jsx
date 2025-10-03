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
  const { doctors, deleteDoctor } = useAdminData();
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  // Log doctor data for debugging
  console.log('Doctor data:', doctors);
  // Defensive: handle missing fields and backend structure
  const filtered = (doctors || []).filter(d => {
    const name = d.name || (d.user ? `${d.user.first_name || ''} ${d.user.last_name || ''}`.trim() : '');
    const email = d.email || (d.user ? d.user.email : '');
    const specialty = d.specialty || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      specialty.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDeleteClick = (doctor) => {
    setSelectedDoctor(doctor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDoctor) {
      deleteDoctor(selectedDoctor.id);
      setDeleteModalOpen(false);
      setSelectedDoctor(null);
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
          </div>
          <div className="doctor-table-wrap">
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
                {filtered.map(doc => {
                  // Defensive: support both old and new doctor data structures
                  const name = doc.name || (doc.user ? `${doc.user.first_name || ''} ${doc.user.last_name || ''}`.trim() : '');
                  const email = doc.email || (doc.user ? doc.user.email : '');
                  const phone = doc.phone || (doc.user ? doc.user.phone : '');
                  const specialty = doc.specialty || '';
                  const experience = doc.experience || '';
                  const id = doc.id;
                  return (
                    <tr key={id}>
                      <td>
                        <div className="doctor-avatar">{name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3)}</div>
                        <div className="doctor-info">
                          <div className="doctor-name">{name}</div>
                          <div className="doctor-id">ID: {id}</div>
                        </div>
                      </td>
                      <td><span className={`doctor-badge ${specialtyColors[specialty]}`}>{specialty}</span></td>
                      <td>{experience} years</td>
                      <td>
                        <div>{email}</div>
                        <div>{phone}</div>
                      </td>
                      <td>
                        <button className="doctor-action-btn" onClick={() => navigate(`/admin/doctors/edit/${id}`)}><span role="img" aria-label="edit">✏️</span></button>
                        <button className="doctor-action-btn" onClick={() => handleDeleteClick(doc)}><span role="img" aria-label="delete">🗑️</span></button>
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
