// Price divided by times worn. Counts at least 1 wear so we never divide by 0
// Dividing by 0 would result in Infinity, which is not a valid cost per wear value
export function costPerWear(price, timesWorn) {
  return price / Math.max(timesWorn, 1);
}