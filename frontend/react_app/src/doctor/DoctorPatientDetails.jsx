import React, { useState } from 'react';
import './DoctorPatientDetails.css';

export default function DoctorPatientDetails({ patient, onBack }) {
  const [tab, setTab] = useState('overview');
  const [conditions, setConditions] = useState(['Hypertension', 'Diabetes Type 2']);
  const [allergies, setAllergies] = useState(['Penicillin', 'Peanuts']);
  const [medications, setMedications] = useState(['Metformin 500mg', 'Lisinopril 10mg']);

  // Remove handlers for allergies/medications
  const removeAllergy = idx => setAllergies(arr => arr.filter((_, i) => i !== idx));
  const removeMedication = idx => setMedications(arr => arr.filter((_, i) => i !== idx));

  // Add allergy/medication input state
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [addingMedication, setAddingMedication] = useState(false);
  const [newMedication, setNewMedication] = useState('');
  const addAllergy = () => {
    setAddingAllergy(true);
    setAddingMedication(false);
    setNewAllergy('');
  };
  const saveAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies(arr => [...arr, newAllergy.trim()]);
      setAddingAllergy(false);
      setNewAllergy('');
    }
  };
  const cancelAllergy = () => {
    setAddingAllergy(false);
    setNewAllergy('');
  };
  const addMedication = () => {
    setAddingMedication(true);
    setAddingAllergy(false);
    setNewMedication('');
  };
  const saveMedication = () => {
    if (newMedication.trim()) {
      setMedications(arr => [...arr, newMedication.trim()]);
      setAddingMedication(false);
      setNewMedication('');
    }
  };
  const cancelMedication = () => {
    setAddingMedication(false);
    setNewMedication('');
  };

  // Fallbacks for missing patient fields
  const get = (field, fallback) => (patient[field] && patient[field].toString().trim() !== '' ? patient[field] : fallback);

  return (
    <div className="doc-patdet-main">
      <div className="doc-patdet-header-row">
        <button className="doc-patdet-back" onClick={onBack}>&larr; Back to Patients</button>
        <div>
          <div className="doc-patdet-title">{get('name', 'Patient Name')}</div>
          <div className="doc-patdet-sub">Patient ID: {get('id', '-')} &bull; {get('age', '-')} years old &bull; {get('gender', '-').toLowerCase()}</div>
        </div>
      </div>
      <div className="doc-patdet-tabs">
        <div className={tab==='overview' ? 'doc-patdet-tab active' : 'doc-patdet-tab'} onClick={()=>setTab('overview')}>Overview</div>
        <div className={tab==='history' ? 'doc-patdet-tab active' : 'doc-patdet-tab'} onClick={()=>setTab('history')}>Medical History</div>
      </div>
      {tab === 'overview' ? (
        <div className="doc-patdet-content" style={{display:'flex',gap:'32px'}}>
          <div className="doc-patdet-info-card" style={{flex:1}}>
            <div className="doc-patdet-info-title" style={{color:'#1971c2',fontWeight:600}}>&#128100; Personal Information</div>
            <div className="doc-patdet-info-desc">Patient's personal details</div>
            <div className="doc-patdet-info-grid">
              <div>
                <label>Full Name</label>
                <input value={get('name', '')} readOnly />
              </div>
              <div>
                <label>Date of Birth</label>
                <input value={get('dob', '3/15/1985')} readOnly />
              </div>
              <div>
                <label>Gender</label>
                <input value={get('gender', '')} readOnly />
              </div>
              <div>
                <label>Blood Type</label>
                <input value={get('blood', '')} readOnly />
              </div>
              <div>
                <label>&#9993; Email</label>
                <input value={get('email', '')} readOnly />
              </div>
              <div>
                <label>&#128222; Phone</label>
                <input value={get('contact', '')} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>Insurance Information</label>
                <input value={get('insurance', 'Blue Cross Blue Shield - Policy #BC123456789')} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>&#127968; Address</label>
                <input value={get('address', '123 Main St, Springfield, IL 62701')} readOnly />
              </div>
              <div className="doc-patdet-info-span">
                <label>Emergency Contact</label>
                <input value={get('emergency', 'John Johnson\nSpouse\n(555) 123-4568')} readOnly />
              </div>
            </div>
          </div>
          <div className="doc-patdet-health-card" style={{flex:'0 0 420px',display:'flex',flexDirection:'column',justifyContent:'flex-start'}}>
            <div className="doc-patdet-health-title" style={{color:'#e03131',fontWeight:600}}>&#10084; Health Summary</div>
            <div className="doc-patdet-health-boxes" style={{display:'flex',gap:'18px',marginTop:'18px'}}>
              <div className="doc-patdet-health-box" style={{background:'#fff0f0',color:'#e03131',border:'1.5px solid #ffe3e3',flex:1}}>
                <div className="doc-patdet-health-num" style={{fontWeight:'bold',fontSize:'2rem',color:'#e03131'}}>{allergies.length}</div>
                <div className="doc-patdet-health-label">Known Allergies</div>
              </div>
              <div className="doc-patdet-health-box" style={{background:'#e6fcf5',color:'#2b8a3e',border:'1.5px solid #c3fae8',flex:1}}>
                <div className="doc-patdet-health-num" style={{fontWeight:'bold',fontSize:'2rem',color:'#2b8a3e'}}>{medications.length}</div>
                <div className="doc-patdet-health-label">Current Medications</div>
              </div>
              <div className="doc-patdet-health-box" style={{background:'#e7f5ff',color:'#1971c2',border:'1.5px solid #d0ebff',flex:1}}>
                <div className="doc-patdet-health-num" style={{fontWeight:'bold',fontSize:'2rem',color:'#1971c2'}}>{conditions.length}</div>
                <div className="doc-patdet-health-label">Medical History</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="doc-patdet-history-main">
          <div className="doc-patdet-history-card">
            <div className="doc-patdet-history-title" style={{color:'#1971c2',fontWeight:600}}>&#10084; Medical History</div>
            <div className="doc-patdet-history-desc">Patient's medical conditions and health history</div>
            <div className="doc-patdet-history-conditions-row">
              {conditions.map((c, i) => (
                <div className="doc-patdet-history-cond" key={i} style={{background:'#fff0f0',color:'#e03131',border:'1.5px solid #ffe3e3'}}>
                  <span className="doc-patdet-history-cond-icon">&#10084;</span> {c}
                </div>
              ))}
            </div>
            <hr className="doc-patdet-history-hr" />
            <div className="doc-patdet-history-section-row">
              <div className="doc-patdet-history-section-title" style={{color:'#e03131',fontWeight:600}}>&#9888; Allergies</div>
              <button className="doc-patdet-history-add-btn allergies-add-btn-outline" onClick={addAllergy} style={{fontWeight:500}}>
                + Add Allergy
              </button>
            </div>
            {addingAllergy && (
              <div className="doc-patdet-history-allergy-input">
                <input
                  className="doc-patdet-history-allergy-inputbox"
                  placeholder="Enter allergy (e.g., Penicillin)..."
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                />
                <button className="doc-patdet-history-save-btn" onClick={saveAllergy} title="Save">
                  <span role="img" aria-label="save">💾</span>
                </button>
                <button className="doc-patdet-history-cancel-btn" onClick={cancelAllergy} title="Cancel">&times;</button>
              </div>
            )}
            <div className="doc-patdet-history-allergies-row allergies-row-flex-cards">
              {allergies.map((a, i) => (
                <div className="doc-patdet-history-allergy" key={i} style={{background:'#fff0f0',color:'#e03131',border:'1.5px solid #ffe3e3'}}>
                  <span className="doc-patdet-history-allergy-icon">&#9888;</span> {a}
                  <button className="doc-patdet-history-remove-btn" onClick={()=>removeAllergy(i)}>&times;</button>
                </div>
              ))}
            </div>
            <hr className="doc-patdet-history-hr" />
            <div className="doc-patdet-history-section-row">
              <div className="doc-patdet-history-section-title" style={{color:'#2b8a3e',fontWeight:600}}>&#128137; Current Medications</div>
              <button className="doc-patdet-history-add-btn" onClick={addMedication} style={{fontWeight:500}}>
                + Add Medication
              </button>
            </div>
            {addingMedication && (
              <div className="doc-patdet-history-med-input">
                <input
                  className="doc-patdet-history-med-inputbox"
                  placeholder="Enter medication name and dosage..."
                  value={newMedication}
                  onChange={e => setNewMedication(e.target.value)}
                />
                <button className="doc-patdet-history-save-btn" onClick={saveMedication} title="Save">
                  <span role="img" aria-label="save">💾</span>
                </button>
                <button className="doc-patdet-history-cancel-btn" onClick={cancelMedication} title="Cancel">&times;</button>
              </div>
            )}
            <div className="doc-patdet-history-meds-row meds-row-flex-cards">
              {medications.map((m, i) => (
                <div className="doc-patdet-history-med" key={i} style={{background:'#e6fcf5',color:'#2b8a3e',border:'1.5px solid #c3fae8'}}>
                  <span className="doc-patdet-history-med-icon">&#128137;</span> {m}
                  <button className="doc-patdet-history-remove-btn" onClick={()=>removeMedication(i)}>&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}