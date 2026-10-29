// The Cloud Functions: they run on Google's servers, not in the browser.
// Two run on a schedule, one runs whenever an item is saved
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
    costPerWear,
    formatMoney,
    isReminderDue,
    itemsToRemind,
    listNames,
    notificationSettings,
    reachedGoal,
    weeklyNumbers,
} from "./logic.js";

// The region must match where her Firestore database is (see the guide).
// maxInstances stops a mistake from running hundreds of copies at once
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

// The functions use their own admin access, so the Firestore rules don't apply to them
initializeApp();
const db = getFirestore();

// Every user, with the items still in their wardrobe and the wardrobe's currency
async function loadUsers() {
    const users = await db.collection("users").get();
    return users.docs.map((userDocument) => ({ id: userDocument.id, ...userDocument.data() }));
}

async function loadItems(userId) {
    const items = await db.collection(`wardrobes/${userId}/items`).get();
    return items.docs.map((itemDocument) => itemDocument.data()).filter((item) => !item.removedAs);
}

async function loadWardrobe(userId) {
    const wardrobe = await db.doc(`wardrobes/${userId}`).get();
    return wardrobe.data() ?? {};
}

// Sends one notification to every browser the user allowed, then forgets browsers that are gone
async function sendPush(user, { title, body, link }) {
    const pushIds = user.pushIds ?? [];
    if (pushIds.length === 0) {
        return;
    }

    // "data" is read by public/firebase-messaging-sw.js. All values must be text
    const response = await getMessaging().sendEachForMulticast({ fids: pushIds, data: { title, body, link } });

    // A browser that was reset or unsubscribed gives this error. Remove its ID so we stop sending to it
    const goneIds = pushIds.filter(
        (pushId, index) => response.responses[index].error?.code === "messaging/registration-token-not-registered",
    );
    if (goneIds.length > 0) {
        await db.doc(`users/${user.id}`).update({ pushIds: FieldValue.arrayRemove(...goneIds) });
    }
}

// Every morning: remind users about clothes they haven't worn for a while
export const dailyReminders = onSchedule({ schedule: "every day 09:00", timeZone: "Europe/Copenhagen" }, async () => {
    const now = new Date();

    for (const user of await loadUsers()) {
        const settings = notificationSettings(user);
        if (!settings.unusedItems || !user.pushIds?.length || !isReminderDue(user, now)) {
            continue;
        }

        const items = itemsToRemind(await loadItems(user.id), settings.remindAfterDays, now);
        if (items.length === 0) {
            continue;
        }

        const one = items.length === 1;
        await sendPush(user, {
            title: one ? "1 item is waiting to be worn" : `${items.length} items are waiting to be worn`,
            body: `${listNames(items)} ${one ? "hasn't" : "haven't"} been worn for ${settings.remindAfterDays} days or more. One more wear lowers ${one ? "its" : "their"} cost per wear the most.`,
            link: "/wardrobe",
        });
        await db.doc(`users/${user.id}`).update({ lastReminderAt: FieldValue.serverTimestamp() });
    }
});

// Every Monday morning: last week's wears and the average cost per wear
export const weeklySummary = onSchedule({ schedule: "every monday 08:00", timeZone: "Europe/Copenhagen" }, async () => {
    const now = new Date();

    for (const user of await loadUsers()) {
        if (!notificationSettings(user).weeklySummary || !user.pushIds?.length) {
            continue;
        }

        const items = await loadItems(user.id);
        if (items.length === 0) {
            continue;
        }

        const { averageCpw, wearsThisWeek } = weeklyNumbers(items, now);
        const { currency = "EUR" } = await loadWardrobe(user.id);

        await sendPush(user, {
            title: "Your week in wearit",
            body: `${wearsThisWeek} ${wearsThisWeek === 1 ? "wear" : "wears"} logged this week. Your average cost per wear is ${formatMoney(averageCpw, currency)}.`,
            link: "/dashboard",
        });
    }
});

// Whenever an item is saved: celebrate when a wear brings it down to the goal
export const goalMilestone = onDocumentUpdated("wardrobes/{userId}/items/{itemId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const { userId, itemId } = event.params;

    const { targetCostPerWear: goal, currency = "EUR" } = await loadWardrobe(userId);
    if (!reachedGoal(before, after, goal)) {
        return;
    }

    const userDocument = await db.doc(`users/${userId}`).get();
    const user = { id: userId, ...userDocument.data() };
    if (!notificationSettings(user).goalMilestones) {
        return;
    }

    await sendPush(user, {
        title: "Goal reached!",
        body: `${after.name} is down to ${formatMoney(costPerWear(after.price, after.timesWorn), currency)} per wear. That's your goal.`,
        link: `/item/${itemId}`,
    });
});