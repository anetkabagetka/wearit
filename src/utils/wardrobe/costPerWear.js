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

// What wearing an outfit costs: the cost per wear of each of its items added up,
// e.g. €4.20 + €1.22 + €1.61 + €7.27 = €14.30. It drops every time one of them is worn
export function outfitCostPerWear(items) {
  return items.reduce((total, item) => total + costPerWear(item.price, item.timesWorn), 0);
}