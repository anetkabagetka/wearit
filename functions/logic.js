// The maths behind the notifications. Nothing here talks to Firebase,
// so it's easy to read and easy to test (like src/utils in the app)

const oneDay = 24 * 60 * 60 * 1000; // in milliseconds

// The same defaults as on the Notifications page (src/composables/useNotificationSettings.js)
const defaultNotifications = {
    unusedItems: true,
    weeklySummary: true,
    goalMilestones: true,
    productNews: false,
    remindAfterDays: 30,
};

// A user's notification choices, with the defaults for anything they haven't saved
export function notificationSettings(user) {
    return { ...defaultNotifications, ...user.notifications };
}

// The same as costPerWear in the app: 0 wears counts as 1, so we never divide by 0
export function costPerWear(price, timesWorn) {
    return price / Math.max(timesWorn, 1);
}

// Firestore dates have .toDate(). Missing dates stay null
function toDate(value) {
    return value?.toDate ? value.toDate() : value ? new Date(value) : null;
}

// How much one more wear would lower an item's cost per wear
function nextWearSaving(item) {
    return costPerWear(item.price, item.timesWorn) - costPerWear(item.price, item.timesWorn + 1);
}

// At most one reminder a week, even if remindAfterDays is shorter
export function isReminderDue(user, now) {
    const lastReminder = toDate(user.lastReminderAt);
    return !lastReminder || now - lastReminder >= 7 * oneDay;
}

// Up to 3 items not worn for at least `days` days (never-worn items count from when they were added),
// the ones where one more wear lowers the cost per wear the most first
export function itemsToRemind(items, days, now) {
    return items
        .filter((item) => !item.removedAs)
        .filter((item) => {
            const lastWorn = toDate(item.lastWornAt) ?? toDate(item.createdAt);
            return lastWorn && now - lastWorn >= days * oneDay;
        })
        .sort((a, b) => nextWearSaving(b) - nextWearSaving(a))
        .slice(0, 3);
}

// "Wool blazer", "Wool blazer and Trench coat" or "Wool blazer, Trench coat and Linen trousers"
export function listNames(items) {
    const names = items.map((item) => item.name);
    if (names.length <= 1) {
        return names.join("");
    }
    return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

// The numbers for the weekly summary: average cost per wear and wears logged in the last 7 days
export function weeklyNumbers(items, now) {
    const wardrobe = items.filter((item) => !item.removedAs);
    const totalSpent = wardrobe.reduce((total, item) => total + (item.price || 0), 0);
    const totalWears = wardrobe.reduce((total, item) => total + (item.timesWorn || 0), 0);
    const wearsThisWeek = wardrobe.reduce(
        (total, item) => total + (item.wornDates ?? []).filter((date) => now - toDate(date) < 7 * oneDay).length,
        0,
    );
    return { averageCpw: costPerWear(totalSpent, totalWears), wearsThisWeek };
}

// true when this save logged a wear that took the item from above the goal to the goal or below
export function reachedGoal(before, after, goal) {
    if (!goal || after.timesWorn <= before.timesWorn) {
        return false;
    }
    return costPerWear(before.price, before.timesWorn) > goal && costPerWear(after.price, after.timesWorn) <= goal;
}

// e.g. "€4.20". Same idea as formatMoney in the app
export function formatMoney(amount, currency) {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}