// How often an item was worn, e.g. "41 wears", "1 wear" or "Not worn yet"
export function formatWears(timesWorn) {
  if (!timesWorn) {
    return "Not worn yet";
  }
  return `${timesWorn} ${timesWorn === 1 ? "wear" : "wears"}`;
}