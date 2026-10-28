// A date as short text, e.g. "12 Mar 2025" ("en-GB" puts the day first).
// Pass { weekday: true } to start with the day of the week, e.g. "Wed, 23 Sept 2026".
// Works with a purchase date ("2025-03-12"), a Firestore date (lastWornAt) and a normal JS Date
export function formatDate(date, { weekday = false } = {}) {
  const jsDate = date?.toDate ? date.toDate() : new Date(date);
  return jsDate.toLocaleDateString("en-GB", {
    weekday: weekday ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}