const pad2 = (value) => String(value).padStart(2, '0');

const sanitizeMinutes = (value) => {
  if (value == null || value === '') {
    return '00';
  }
  const numeric = String(value).padEnd(2, '0');
  return pad2(numeric.slice(0, 2));
};

const hasMeridiem = (value) => /[ap]m$/i.test(value.trim());

export const formatTimeTo12Hour = (time) => {
  if (time === null || time === undefined) {
    return '';
  }

  let working = String(time).trim();
  if (!working) {
    return '';
  }

  // Remove trailing seconds if present (e.g., 14:00:00)
  const secondsMatch = working.match(/^(.+?):(\d{2})(?:\.\d+)?$/);
  if (secondsMatch && secondsMatch[1].includes(':')) {
    working = secondsMatch[1];
  }

  // Convert compact numeric formats like 930 -> 09:30
  const compactMatch = working.match(/^(\d{1,2})(\d{2})$/);
  if (compactMatch) {
    working = `${compactMatch[1]}:${compactMatch[2]}`;
  }

  // Handle values that already include AM/PM (standardise casing and minutes)
  if (hasMeridiem(working)) {
    const match = working.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = sanitizeMinutes(match[2]);
      const meridiem = match[3].toUpperCase();
      if (hours === 0) {
        hours = 12;
      } else if (hours > 12) {
        hours = hours % 12;
        if (hours === 0) {
          hours = 12;
        }
      }
      return `${pad2(hours)}:${minutes} ${meridiem}`;
    }
    return working.toUpperCase();
  }

  // Handle 24-hour formats HH:MM or H:MM
  const hourMinuteMatch = working.match(/^(\d{1,2}):(\d{2})$/);
  if (hourMinuteMatch) {
    let hours = parseInt(hourMinuteMatch[1], 10);
    const minutes = sanitizeMinutes(hourMinuteMatch[2]);
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) {
      hours = 12;
    }
    return `${pad2(hours)}:${minutes} ${meridiem}`;
  }

  return working;
};

export const formatTimeRangeTo12Hour = (from, to, separator = ' - ') => {
  const start = formatTimeTo12Hour(from);
  const end = formatTimeTo12Hour(to);
  if (!start && !end) {
    return '';
  }
  if (!start) {
    return end;
  }
  if (!end) {
    return start;
  }
  return `${start}${separator}${end}`;
};
