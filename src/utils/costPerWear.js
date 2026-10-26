// Price divided by times worn. Counts at least 1 wear so we never divide by 0
// Dividing by 0 would result in Infinity, which is not a valid cost per wear value
export function costPerWear(price, timesWorn) {
  return price / Math.max(timesWorn, 1);
}

// Average cost per wear of a whole wardrobe: everything spent ÷ all wears together,
// e.g. €4,280 spent ÷ 625 wears = €6.85
export function averageCostPerWear(items) {
  const totalSpent = items.reduce((total, item) => total + (item.price || 0), 0);
  const totalWears = items.reduce((total, item) => total + (item.timesWorn || 0), 0);
  return costPerWear(totalSpent, totalWears);
}