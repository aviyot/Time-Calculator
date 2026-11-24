export function calculateTotalSeconds(rows, columns) {
  return rows.reduce((total, row) => {
    const hours = columns.hour ? +row.hour : 0;
    const minutes = columns.minute ? +row.minute : 0;
    const seconds = columns.second ? +row.second : 0;
    let multiplier = columns.multiplier ? +row.multiplier : 1;

    if (Number.isNaN(multiplier) || multiplier <= 0) multiplier = 1;

    return total + (hours * 3600 + minutes * 60 + seconds) * multiplier;
  }, 0);
}

function padZero(value) {
  return value < 10 ? "0" + value : value;
}

export function formatTime(totalSeconds) {
  const remainder = totalSeconds % 3600;

  return (
    padZero(Math.trunc(totalSeconds / 3600)) +
    ":" +
    padZero(Math.trunc(remainder / 60)) +
    ":" +
    padZero(Math.trunc(remainder % 60))
  );
}

export function getFriendlyTimeDesc(totalSeconds) {
  if (totalSeconds === 0) return "0 hours, 0 minutes, 0 seconds";

  const hours = Math.floor(totalSeconds / 3600);
  const remainder = totalSeconds % 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }
  if (seconds > 0) {
    parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  }

  return parts.join(", ");
}
