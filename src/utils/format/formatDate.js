const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Firestore dates (lastWornAt, wornDates) have .toDate(), purchase dates are text like "2025-03-12".
// This turns both, and normal JS Dates, into a JS Date
export function toJsDate(date) {
  return date?.toDate ? date.toDate() : new Date(date);
}

// A date as short text, e.g. "12 Mar 2025", or "Wed 23 Sep 2026" with { weekday: true }.
// getDay() and getMonth() count from 0, so they fit the lists above (0 = Sun, 0 = Jan)
export function formatDate(date, { weekday = false } = {}) {
  const jsDate = toJsDate(date);
  const text = `${jsDate.getDate()} ${months[jsDate.getMonth()]} ${jsDate.getFullYear()}`;
  return weekday ? `${weekdays[jsDate.getDay()]} ${text}` : text;
}