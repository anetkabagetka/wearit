import { computed, ref } from "vue";

import { useWardrobe } from "@/composables/useWardrobe";
import { averageCostPerWear, costPerWear } from "@/utils/costPerWear";
import { toJsDate } from "@/utils/formatDate";

// The period chips at the top. "text" finishes sentences like "124 items this year"
export const periodOptions = [
    { value: "month", label: "This month", text: "this month" },
    { value: "3months", label: "3 months", text: "in the last 3 months" },
    { value: "year", label: "Year", text: "this year" },
    { value: "all", label: "All time", text: "in total" },
];

// The first day that counts for a period: the 1st of this month, the 1st of the month two months ago
// (3 months in all), 1 January, or null for all time.
// new Date(year, month, day) also works with a month below 0: it goes back into last year
function periodStart(period, now) {
    if (period === "month") {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (period === "3months") {
        return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    }
    if (period === "year") {
        return new Date(now.getFullYear(), 0, 1);
    }
    return null;
}

// When an item was bought: its purchase date, or the day it was added when it has none
function boughtOn(item) {
    return toJsDate(item.purchaseDate || item.createdAt);
}

// The average cost per wear on a day in the past: only items bought by then, and only their wears up to
// then (wears logged later are taken off). null when nothing had been worn yet
function costPerWearOn(items, day) {
    const owned = items.filter((item) => boughtOn(item) <= day);
    const spent = owned.reduce((total, item) => total + (item.price || 0), 0);
    const wears = owned.reduce(
        (total, item) =>
            total + (item.timesWorn || 0) - (item.wornDates ?? []).filter((date) => toJsDate(date) > day).length,
        0,
    );
    return wears > 0 ? spent / wears : null;
}

// The last 6 months, oldest first, e.g. { name: "Oct", longName: "October", first, end }.
// first is the 1st of the month, end its last moment (or right now, for this month)
function lastSixMonths(now) {
    return [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
        const first = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        // Day 0 of the next month is the last day of this one
        const end = monthsAgo === 0 ? now : new Date(first.getFullYear(), first.getMonth() + 1, 0, 23, 59, 59);
        return {
            name: first.toLocaleString("en-US", { month: "short" }),
            longName: first.toLocaleString("en-US", { month: "long" }),
            first,
            end,
        };
    });
}

// The same text for every moment of one day, e.g. "2026-9-29", to count wears per day
function dayKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// The last 4 weeks, Monday to Sunday, oldest week first. Each day has how many wears were logged,
// and whether it's still to come (the rest of this week)
function lastFourWeeks(items, now) {
    const wearsPerDay = new Map();
    for (const item of items) {
        for (const date of item.wornDates ?? []) {
            const key = dayKey(toJsDate(date));
            wearsPerDay.set(key, (wearsPerDay.get(key) ?? 0) + 1);
        }
    }

    // getDay() is 0 on Sunday, so (getDay() + 6) % 7 is how many days ago this week's Monday was
    const firstMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - 21);

    return [0, 1, 2, 3].map((week) =>
        [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
            const date = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + week * 7 + weekday);
            return { date, wears: wearsPerDay.get(dayKey(date)) ?? 0, isFuture: date > now };
        }),
    );
}

// The numbers and charts on the insights page. Everything is worked out from the same items
// the wardrobe page loads, so nothing extra is saved in Firestore
export function useInsights() {
    const wardrobe = useWardrobe();
    const items = wardrobe.items;
    const now = new Date();

    const period = ref("year"); // Year is picked first, like in the Figma
    const periodText = computed(() => periodOptions.find((option) => option.value === period.value).text);

    // The items bought in the chosen period. The money cards, both lists, the donut and the brand bars use these.
    // The three charts over time always look at the whole wardrobe
    const periodItems = computed(() => {
        const start = periodStart(period.value, now);
        return start ? items.value.filter((item) => boughtOn(item) >= start) : items.value;
    });

    const totalSpent = computed(() => periodItems.value.reduce((total, item) => total + (item.price || 0), 0));
    const totalWears = computed(() => periodItems.value.reduce((total, item) => total + (item.timesWorn || 0), 0));
    const averageCpw = computed(() => averageCostPerWear(periodItems.value));

    // How much the average cost per wear changed since the end of last month (below 0 = cheaper per wear).
    // null when those items had no wears back then
    const cpwChange = computed(() => {
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const before = costPerWearOn(periodItems.value, endOfLastMonth);
        return before === null ? null : averageCpw.value - before;
    });

    // Highest cost per wear first. [...list] copies it, so sort() doesn't change periodItems
    const byCpw = computed(() =>
        [...periodItems.value].sort((a, b) => costPerWear(b.price, b.timesWorn) - costPerWear(a.price, a.timesWorn)),
    );
    const highestCpw = computed(() => byCpw.value.slice(0, 3));
    // The 3 lowest, lowest first. slice(3) leaves out the highest 3, so no item is in both lists
    const lowestCpw = computed(() => byCpw.value.slice(3).slice(-3).reverse());

    // The 3 outfits worn most often, all time. Outfits never worn are left out
    const mostWornOutfits = computed(() =>
        [...wardrobe.outfitsWithItems.value]
            .filter((outfit) => outfit.timesWorn > 0)
            .sort((a, b) => b.timesWorn - a.timesWorn)
            .slice(0, 3),
    );

    // Items per category, biggest first, with their share in %. The donut has 4 grays,
    // so with more than 4 categories the smallest ones are added up as "Other"
    const categoryCount = computed(() => new Set(periodItems.value.map((item) => item.category)).size);
    const categories = computed(() => {
        const counts = {};
        for (const item of periodItems.value) {
            counts[item.category] = (counts[item.category] ?? 0) + 1;
        }

        let list = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        if (list.length > 4) {
            const other = list.slice(3).reduce((total, category) => total + category.count, 0);
            list = [...list.slice(0, 3), { name: "Other", count: other }];
        }

        return list.map((category) => ({
            ...category,
            percent: Math.round((category.count / periodItems.value.length) * 100),
        }));
    });

    // Money spent per brand, the 5 biggest. width is the bar's length in %: the biggest brand fills the row
    const brandSpend = computed(() => {
        const spent = {};
        for (const item of periodItems.value.filter((item) => item.brand)) {
            spent[item.brand] = (spent[item.brand] ?? 0) + (item.price || 0);
        }

        const top = Object.entries(spent)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        const biggest = top[0]?.amount || 1;
        return top.map((brand) => ({ ...brand, width: (brand.amount / biggest) * 100 }));
    });

    const months = lastSixMonths(now);

    // The whole wardrobe's average cost per wear at the end of each of the last 6 months.
    // Months before anything was worn are left out
    const cpwTrend = computed(() =>
        months
            .map((month) => ({ label: month.name, value: costPerWearOn(items.value, month.end) }))
            .filter((point) => point.value !== null),
    );

    // Wears logged with "Log a wear" in each of the last 6 months
    const wearsPerMonth = computed(() =>
        months.map((month) => ({
            label: month.name,
            longName: month.longName,
            value: items.value.reduce(
                (total, item) =>
                    total +
                    (item.wornDates ?? []).filter((date) => toJsDate(date) >= month.first && toJsDate(date) <= month.end)
                        .length,
                0,
            ),
        })),
    );

    const wearWeeks = computed(() => lastFourWeeks(items.value, now));

    return {
        ...wardrobe,
        period,
        periodText,
        periodItems,
        totalSpent,
        totalWears,
        averageCpw,
        cpwChange,
        highestCpw,
        lowestCpw,
        mostWornOutfits,
        categoryCount,
        categories,
        brandSpend,
        cpwTrend,
        wearsPerMonth,
        wearWeeks,
    };
}