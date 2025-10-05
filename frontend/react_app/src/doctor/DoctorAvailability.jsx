import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './DoctorAvailability.css';
import { formatTimeTo12Hour } from '../utils/time.js';
import { useDoctorData } from './DoctorDataContext.jsx';

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const parseTime = (value) => {
  const [hours = '0', minutes = '0'] = (value || '00:00').split(':');
  return {
    hours: Number.parseInt(hours, 10) || 0,
    minutes: Number.parseInt(minutes, 10) || 0,
  };
};

const formatTime = (hours, minutes) =>
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

const cloneSchedule = (source = {}) => {
  const result = {};
  DAY_ORDER.forEach((day) => {
    const entry = source[day] || { active: false, slots: [] };
    result[day] = {
      active: Boolean(entry.active),
      slots: (entry.slots || []).map((slot) => ({
        id: slot.id || null,
        start: slot.start || slot.start_time || slot.from || '09:00',
        end: slot.end || slot.end_time || slot.to || '10:00',
        available: slot.available !== false,
      })),
    };
  });
  return result;
};

const buildTimeOptions = (meta) => {
  const defaultStart = meta?.defaultHours?.start || '09:00';
  const defaultEnd = meta?.defaultHours?.end || '19:00';
  const increment = meta?.slotDurationMinutes || 60;

  const { hours: startHours, minutes: startMinutes } = parseTime(defaultStart);
  const { hours: endHours, minutes: endMinutes } = parseTime(defaultEnd);
  const options = [];

  let totalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  while (totalMinutes <= endTotalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    options.push(formatTime(hours, minutes));
    totalMinutes += increment;
    if (increment <= 0) break;
  }

  return options.length ? options : ['09:00', '10:00', '11:00', '12:00'];
};

export default function DoctorAvailability() {
  const {
    availability,
    availabilityMeta,
    availabilityLoading,
    availabilitySaving,
    saveAvailability,
    refreshAvailability,
    errors,
  } = useDoctorData();

  const [localSchedule, setLocalSchedule] = useState(() => cloneSchedule(availability));
  const [feedback, setFeedback] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalSchedule(cloneSchedule(availability));
    setIsDirty(false);
  }, [availability]);

  const timeOptions = useMemo(() => buildTimeOptions(availabilityMeta), [availabilityMeta]);

  const scheduleEntries = useMemo(
    () =>
      DAY_ORDER.map((day) => ({
        key: day,
        label: capitalize(day),
        ...localSchedule[day],
      })),
    [localSchedule],
  );

  const updateDay = useCallback((dayKey, updater) => {
    setLocalSchedule((prev) => {
      const next = cloneSchedule(prev);
      next[dayKey] = updater(next[dayKey] || { active: false, slots: [] });
      return next;
    });
    setIsDirty(true);
  }, []);

  const handleAddSlot = useCallback(
    (dayKey) => {
      const start = timeOptions[0] || '09:00';
      const end = timeOptions[1] || start;
      updateDay(dayKey, (day) => ({
        ...day,
        active: true,
        slots: [...(day.slots || []), { id: null, start, end: end || start, available: true }],
      }));
    },
    [timeOptions, updateDay],
  );

  const handleToggleActive = useCallback(
    (dayKey) => {
      updateDay(dayKey, (day) => ({
        ...day,
        active: !day.active,
      }));
    },
    [updateDay],
  );

  const handleSlotChange = useCallback(
    (dayKey, index, nextSlot) => {
      updateDay(dayKey, (day) => ({
        ...day,
        slots: day.slots.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...nextSlot } : slot)),
      }));
    },
    [updateDay],
  );

  const handleRemoveSlot = useCallback(
    (dayKey, index) => {
      updateDay(dayKey, (day) => ({
        ...day,
        slots: day.slots.filter((_, slotIndex) => slotIndex !== index),
      }));
    },
    [updateDay],
  );

  const handleReset = useCallback(() => {
    setLocalSchedule(cloneSchedule(availability));
    setIsDirty(false);
    setFeedback('Reverted to last saved schedule.');
  }, [availability]);

  const handleSave = useCallback(async () => {
    setFeedback('');
    const result = await saveAvailability(localSchedule);
    if (result.success) {
      setIsDirty(false);
      setFeedback(result.message || 'Schedule updated successfully.');
      refreshAvailability();
    } else {
      setFeedback(result.message || 'Failed to update schedule.');
    }
  }, [localSchedule, refreshAvailability, saveAvailability]);

  if (availabilityLoading) {
    return (
      <div className="doc-avail-loading">
        <div className="doc-avail-spinner" />
        <p>Loading availability…</p>
      </div>
    );
  }

  return (
    <div className="doc-avail-main">
      <div className="doc-avail-header-row">
        <div>
          <div className="doc-avail-header-title">Availability Management</div>
          <div className="doc-avail-header-desc">Set your weekly schedule and availability</div>
        </div>
        <div className="doc-avail-header-actions">
          <button
            className="doc-avail-refresh"
            type="button"
            onClick={refreshAvailability}
            disabled={availabilitySaving}
          >
            Refresh
          </button>
          <button
            className="doc-avail-reset-btn"
            type="button"
            onClick={handleReset}
            disabled={availabilitySaving || !isDirty}
          >
            Reset
          </button>
          <button
            className="doc-avail-save-btn"
            type="button"
            onClick={handleSave}
            disabled={availabilitySaving || !isDirty}
          >
            {availabilitySaving ? 'Saving…' : '💾 Save Schedule'}
          </button>
        </div>
      </div>
      {errors?.availability && <div className="doc-avail-error">{errors.availability}</div>}
      {feedback && <div className="doc-avail-feedback">{feedback}</div>}
      <div className="doc-avail-card">
        <div className="doc-avail-card-title">Weekly Schedule</div>
        <div className="doc-avail-card-desc">Configure your availability for each day of the week</div>
        {scheduleEntries.map((day) => (
          <div className="doc-avail-day-block" key={day.key}>
            <div className="doc-avail-day-row">
              <span className="doc-avail-day-name">{day.label}</span>
              <span className={day.active ? 'doc-avail-day-active' : 'doc-avail-day-inactive'}>
                {day.active ? 'Active' : 'Inactive'}
              </span>
              <div className="doc-avail-day-actions">
                <button
                  className="doc-avail-add-slot"
                  type="button"
                  onClick={() => handleAddSlot(day.key)}
                  disabled={!day.active || availabilitySaving}
                >
                  + Add Time Slot
                </button>
                <label className="doc-avail-switch">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={() => handleToggleActive(day.key)}
                  />
                  <span className="doc-avail-slider"></span>
                </label>
              </div>
            </div>
            {(!day.slots || day.slots.length === 0) && !day.active && (
              <div className="doc-avail-empty">No slots configured.</div>
            )}
            {(day.slots || []).map((slot, index) => (
              <div className="doc-avail-slot-row" key={`${day.key}-${index}`}>
                <select
                  className="doc-avail-time-select"
                  value={slot.start}
                  disabled={!day.active}
                  onChange={(event) =>
                    handleSlotChange(day.key, index, { start: event.target.value })
                  }
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatTimeTo12Hour(option)}
                    </option>
                  ))}
                </select>
                <span className="doc-avail-to">to</span>
                <select
                  className="doc-avail-time-select"
                  value={slot.end}
                  disabled={!day.active}
                  onChange={(event) =>
                    handleSlotChange(day.key, index, { end: event.target.value })
                  }
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatTimeTo12Hour(option)}
                    </option>
                  ))}
                </select>
                <label className="doc-avail-switch-label">
                  <input
                    type="checkbox"
                    checked={slot.available}
                    onChange={() =>
                      handleSlotChange(day.key, index, { available: !slot.available })
                    }
                  />
                  <span className="doc-avail-slider"></span>
                  <span className="doc-avail-switch-text">Available</span>
                </label>
                <button
                  className="doc-avail-remove-slot"
                  type="button"
                  onClick={() => handleRemoveSlot(day.key, index)}
                  disabled={availabilitySaving}
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
