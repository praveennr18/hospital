import React, { useCallback, useMemo, useState } from 'react';
import './DoctorPatients.css';
import DoctorPatientDetails from './DoctorPatientDetails';
import { useDoctorData } from './DoctorDataContext.jsx';

const BLOOD_COLOR_CLASS = {
  'a+': 'blood-ap',
  'a-': 'blood-an',
  'b+': 'blood-bp',
  'b-': 'blood-bn',
  'ab+': 'blood-abp',
  'ab-': 'blood-abn',
  'o+': 'blood-op',
  'o-': 'blood-on',
};

export default function DoctorPatients() {
  const {
    patients,
    patientsLoading,
    patientPagination,
    patientsQuery,
    setPatientsQuery,
    refreshPatients,
    errors,
  } = useDoctorData();

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const searchValue = patientsQuery.search || '';

  const handleSearchChange = useCallback(
    (event) => {
      const nextValue = event.target.value;
      setPatientsQuery((prev) => ({ ...prev, search: nextValue, page: 1 }));
    },
    [setPatientsQuery],
  );

  const handleBloodFilter = useCallback(
    (event) => {
      setPatientsQuery((prev) => ({ ...prev, blood_group: event.target.value || '', page: 1 }));
    },
    [setPatientsQuery],
  );

  const handleSelectPatient = useCallback((patientId) => {
    setSelectedPatientId(patientId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPatientId(null);
  }, []);

  const rows = useMemo(
    () =>
      patients.map((patient) => ({
        ...patient,
        bloodClass: BLOOD_COLOR_CLASS[(patient.bloodGroup || '').toLowerCase()] || 'blood-ap',
      })),
    [patients],
  );

  if (selectedPatientId) {
    return <DoctorPatientDetails patientId={selectedPatientId} onBack={handleBack} />;
  }

  return (
    <div className="doc-pat-main">
      <div className="doc-pat-header-row">
        <div>
          <div className="doc-pat-header-title">My Patients</div>
          <div className="doc-pat-header-desc">
            View and manage the patients currently assigned to you.
          </div>
        </div>
        <button className="doc-pat-refresh" type="button" onClick={refreshPatients} disabled={patientsLoading}>
          {patientsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {errors?.patients && <div className="doc-pat-error">{errors.patients}</div>}
      <div className="doc-pat-directory-card">
        <div className="doc-pat-directory-title">Patient Directory</div>
        <div className="doc-pat-directory-desc">
          Click on any patient to view their detailed medical information
        </div>
        <div className="doc-pat-search-row">
          <input
            className="doc-pat-search"
            placeholder="Search patients by name, email, or phone..."
            value={searchValue}
            onChange={handleSearchChange}
          />
          <select
            className="doc-pat-filter"
            value={patientsQuery.blood_group || ''}
            onChange={handleBloodFilter}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div className="doc-pat-table-wrap">
          {patientsLoading ? (
            <div className="doc-pat-loading">Loading patients…</div>
          ) : rows.length ? (
            <table className="doc-pat-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Contact</th>
                  <th>Last Visit</th>
                  <th>Completed Visits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="doc-pat-avatar">{patient.initials}</span>
                      <span className="doc-pat-name">{patient.name}</span>
                      <div className="doc-pat-id">ID: {patient.id}</div>
                    </td>
                    <td>
                      {patient.ageDisplay}
                      <br />
                      {patient.gender}
                    </td>
                    <td>
                      <span className={`doc-pat-blood-pill ${patient.bloodClass}`}>
                        {patient.bloodGroup || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="doc-pat-contact">
                        &#128222; {patient.contact.phone || '—'}
                      </span>
                      <br />
                      <span className="doc-pat-email">
                        &#9993; {patient.contact.email || '—'}
                      </span>
                    </td>
                    <td>{patient.lastVisit || 'No visits yet'}</td>
                    <td>{patient.totalCompletedVisits ?? 0}</td>
                    <td>
                      <button
                        className="doc-pat-action-btn"
                        type="button"
                        onClick={() => handleSelectPatient(patient.id)}
                      >
                        <span role="img" aria-label="view">
                          👁️
                        </span>{' '}
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="doc-pat-empty">
              <p>No patients found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
        {patientPagination?.totalPages > 1 && (
          <div className="doc-pat-pagination">
            <button
              type="button"
              className="doc-pat-page-btn"
              onClick={() =>
                setPatientsQuery((prev) => ({
                  ...prev,
                  page: Math.max(1, (prev.page || 1) - 1),
                }))
              }
              disabled={(patientsQuery.page || 1) <= 1}
            >
              Previous
            </button>
            <span>
              Page {patientsQuery.page || 1} of {patientPagination.totalPages}
            </span>
            <button
              type="button"
              className="doc-pat-page-btn"
              onClick={() =>
                setPatientsQuery((prev) => ({
                  ...prev,
                  page: Math.min(patientPagination.totalPages, (prev.page || 1) + 1),
                }))
              }
              disabled={(patientsQuery.page || 1) >= patientPagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
