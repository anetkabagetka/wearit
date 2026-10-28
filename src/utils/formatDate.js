// A date as short text, e.g. "12 Mar 2025" ("en-GB" puts the day first).
// Works with a purchase date ("2025-03-12"), a Firestore date (lastWornAt) and a normal JS Date
export function formatDate(date) {
  const jsDate = date?.toDate ? date.toDate() : new Date(date);
  return jsDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}