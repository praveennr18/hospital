import React, { useState } from 'react';
import './DoctorManagement.css';
import AdminLayout from './AdminLayout';
import { useAdminData } from './AdminDataContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import './ConfirmDeleteModal.css';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );
  const handleDeleteClick = (doctor) => {
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDoctor(null);
  };
  const handleModalConfirm = () => {
    if (selectedDoctor) {
      deleteDoctor(selectedDoctor.id);
    }
    setModalOpen(false);
    setSelectedDoctor(null);
  };
  return (
    <AdminLayout active="doctors" setAdminLoggedIn={setAdminLoggedIn}>
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
                {filtered.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-avatar">{doc.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3)}</div>
                      <div className="doctor-info">
                        <div className="doctor-name">{doc.name}</div>
                        <div className="doctor-id">ID: {doc.id}</div>
                      </div>
                    </td>
                    <td><span className={`doctor-badge ${specialtyColors[doc.specialty]}`}>{doc.specialty}</span></td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ConfirmDeleteModal
          open={modalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          type="Doctor"
          name={selectedDoctor?.name}
          id={selectedDoctor?.id}
          requireReason={false}
        />
      </div>
    </AdminLayout>
  );
}
