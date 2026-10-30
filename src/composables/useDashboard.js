import { computed } from "vue";

import { useWardrobe } from "@/composables/useWardrobe";
import { toJsDate } from "@/utils/format/formatDate";

const ninetyDays = 90 * 86400000; // 86400000 ms = 1 day

// true when a date is in the given month. monthsAgo 0 = this month, 1 = last month
function isInMonth(date, monthsAgo) {
    const jsDate = toJsDate(date);
    const month = new Date();
    month.setDate(1); // The 1st, so going back a month never skips one (e.g. 31 March → 31 February)
    month.setMonth(month.getMonth() - monthsAgo);
    return jsDate.getMonth() === month.getMonth() && jsDate.getFullYear() === month.getFullYear();
}

// true when a date is in the current month, e.g. any day in October 2026 while it's October 2026
function isThisMonth(date) {
    return isInMonth(date, 0);
}

// How many wears were logged in a month, over all items. monthsAgo 0 = this month, 1 = last month
function countWears(items, monthsAgo) {
    return items.reduce(
        (total, item) => total + (item.wornDates ?? []).filter((date) => isInMonth(date, monthsAgo)).length,
        0,
    );
}

// The numbers and lists on the home page. Everything is worked out from the same items
// the wardrobe page loads, so nothing extra is saved in Firestore
export function useDashboard() {
    const wardrobe = useWardrobe();
    const items = wardrobe.items;

    // Everything spent and every wear, for the "Average cost per wear" card
    const totalSpent = computed(() => items.value.reduce((total, item) => total + (item.price || 0), 0));
    const totalWears = computed(() => items.value.reduce((total, item) => total + (item.timesWorn || 0), 0));

    // Items added this month, e.g. "+3 this month"
    const addedThisMonth = computed(() => items.value.filter((item) => item.createdAt && isThisMonth(item.createdAt)).length);

    // Wears logged with "Log a wear" this month and last month, for "12% vs September"
    const wearsThisMonth = computed(() => countWears(items.value, 0));
    const wearsLastMonth = computed(() => countWears(items.value, 1));

    // Items with no wear logged in the last 90 days (or never)
    const notWornLately = computed(
        () => items.value.filter((item) => !item.lastWornAt || toJsDate(item.lastWornAt) < Date.now() - ninetyDays).length,
    );

    // The 5 things worn most recently, newest first: items and outfits together,
    // e.g. { kind: "outfit", id: "abc", outfit } or { kind: "item", id: "xyz", item }.
    // An item worn in an outfit on the same day shows as that outfit, not again on its own.
    // Items and outfits never logged as worn are left out
    const recentlyWorn = computed(() => {
        const wornOutfits = wardrobe.outfitsWithItems.value.filter((outfit) => outfit.lastWornAt);
        const sameDay = (a, b) => toJsDate(a).toDateString() === toJsDate(b).toDateString();
        const wornInOutfit = (item) =>
            wornOutfits.some((outfit) => outfit.itemIds.includes(item.id) && sameDay(outfit.lastWornAt, item.lastWornAt));

        const worn = [
            ...wornOutfits.map((outfit) => ({ kind: "outfit", id: outfit.id, wornAt: outfit.lastWornAt, outfit })),
            ...items.value
                .filter((item) => item.lastWornAt && !wornInOutfit(item))
                .map((item) => ({ kind: "item", id: item.id, wornAt: item.lastWornAt, item })),
        ];
        return worn.sort((a, b) => toJsDate(b.wornAt) - toJsDate(a.wornAt)).slice(0, 5);
    });

    // The 5 newest items. createdAt is set by Firestore when an item is saved
    const recentlyAdded = computed(() =>
        items.value
            .filter((item) => item.createdAt)
            .sort((a, b) => toJsDate(b.createdAt) - toJsDate(a.createdAt))
            .slice(0, 5),
    );

    // The 3 items with the most and the fewest wears. [...list] copies it, so sort() doesn't change items
    const mostWorn = computed(() => [...items.value].sort((a, b) => b.timesWorn - a.timesWorn).slice(0, 3));
    const leastWorn = computed(() => [...items.value].sort((a, b) => a.timesWorn - b.timesWorn).slice(0, 3));

    return {
        ...wardrobe,
        totalSpent,
        totalWears,
        addedThisMonth,
        wearsThisMonth,
        wearsLastMonth,
        notWornLately,
        recentlyWorn,
        recentlyAdded,
        mostWorn,
        leastWorn,
    };
}