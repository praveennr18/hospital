import React, { useState } from 'react';
import './DoctorAvailability.css';

const defaultSchedule = [
  {
    day: 'Monday',
    active: true,
    slots: [
      { from: '09:00', to: '12:00', available: true },
      { from: '14:00', to: '17:00', available: true },
    ],
  },
  {
    day: 'Tuesday',
    active: true,
    slots: [
      { from: '09:00', to: '12:00', available: true },
      { from: '14:00', to: '17:00', available: true },
    ],
  },
  {
    day: 'Wednesday',
    active: true,
    slots: [
      { from: '09:00', to: '12:00', available: true },
      { from: '14:00', to: '17:00', available: true },
    ],
  },
  {
    day: 'Thursday',
    active: true,
    slots: [
      { from: '09:00', to: '12:00', available: true },
      { from: '14:00', to: '17:00', available: true },
    ],
  },
  {
    day: 'Friday',
    active: true,
    slots: [
      { from: '09:00', to: '12:00', available: true },
      { from: '14:00', to: '17:00', available: true },
    ],
  },
  {
    day: 'Saturday',
    active: false,
    slots: [],
  },
  {
    day: 'Sunday',
    active: false,
    slots: [],
  },
];

export default function DoctorAvailability() {
  const [schedule, setSchedule] = useState(defaultSchedule);

  // Helper for time options
  const timeOptions = [
    '09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'
  ];

  return (
    <div className="doc-avail-main">
      <div className="doc-avail-header-row">
        <div className="doc-avail-header-title">Availability Management</div>
        <div className="doc-avail-save-btn-wrap">
          <button
            className="doc-avail-save-btn"
            onClick={() => {
              // You can add save logic here (API call, etc.)
              alert('Schedule saved!');
            }}
          >&#128190; Save Schedule</button>
        </div>
      </div>
      <div className="doc-avail-header-desc">Set your weekly schedule and availability</div>
      <div className="doc-avail-card">
        <div className="doc-avail-card-title">Weekly Schedule</div>
        <div className="doc-avail-card-desc">Configure your availability for each day of the week</div>
        {schedule.map((day, i) => (
          <div className="doc-avail-day-block" key={day.day}>
            <div className="doc-avail-day-row">
              <span className="doc-avail-day-name">{day.day}</span>
              <span className={day.active ? "doc-avail-day-active" : "doc-avail-day-inactive"}>{day.active ? "Active" : "Inactive"}</span>
              <div className="doc-avail-day-actions">
                <button
                  className="doc-avail-add-slot"
                  disabled={!day.active}
                  onClick={() => {
                    if (!day.active) return;
                    setSchedule(sch => sch.map((d, idx) =>
                      idx === i
                        ? { ...d, slots: [...d.slots, { from: '09:00', to: '12:00', available: true }] }
                        : d
                    ));
                  }}
                >+ Add Time Slot</button>
                <label className="doc-avail-switch">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={() => {
                      setSchedule(sch => sch.map((d, idx) =>
                        idx === i
                          ? { ...d, active: !d.active, slots: !d.active ? [{ from: '09:00', to: '12:00', available: true }] : [] }
                          : d
                      ));
                    }}
                  />
                  <span className="doc-avail-slider"></span>
                </label>
              </div>
            </div>
            {day.slots.length === 0 && !day.active && (
              <div style={{color:'#bbb',fontSize:'1.05rem',margin:'12px 0 8px 8px'}}>No slots</div>
            )}
            {day.slots.map((slot, j) => (
              <div className="doc-avail-slot-row" key={j}>
                <select
                  className="doc-avail-time-select"
                  value={slot.from}
                  onChange={e => {
                    const val = e.target.value;
                    setSchedule(sch => sch.map((d, idx) =>
                      idx === i
                        ? { ...d, slots: d.slots.map((s, k) => k === j ? { ...s, from: val } : s) }
                        : d
                    ));
                  }}
                >
                  {timeOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <span className="doc-avail-to">to</span>
                <select
                  className="doc-avail-time-select"
                  value={slot.to}
                  onChange={e => {
                    const val = e.target.value;
                    setSchedule(sch => sch.map((d, idx) =>
                      idx === i
                        ? { ...d, slots: d.slots.map((s, k) => k === j ? { ...s, to: val } : s) }
                        : d
                    ));
                  }}
                >
                  {timeOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <label className="doc-avail-switch-label">
                  <input
                    type="checkbox"
                    checked={slot.available}
                    onChange={() => {
                      setSchedule(sch => sch.map((d, idx) =>
                        idx === i
                          ? { ...d, slots: d.slots.map((s, k) => k === j ? { ...s, available: !s.available } : s) }
                          : d
                      ));
                    }}
                  />
                  <span className="doc-avail-slider"></span>
                  <span className="doc-avail-switch-text">Available</span>
                </label>
                <button
                  className="doc-avail-remove-slot"
                  onClick={() => {
                    setSchedule(sch => sch.map((d, idx) =>
                      idx === i
                        ? { ...d, slots: d.slots.filter((_, k) => k !== j) }
                        : d
                    ));
                  }}
                >&#10005;</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
