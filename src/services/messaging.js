// Firebase Cloud Messaging: lets this browser receive push notifications
import { getMessaging, isSupported, onRegistered, register } from "firebase/messaging";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

import { db } from "@/firebase";

// true when this browser can get push notifications (e.g. false on iPhone unless wearit
// is added to the Home Screen)
export function isPushSupported() {
    return isSupported();
}

// Registers this browser with Firebase and saves its ID on the user's profile (pushIds),
// so the Cloud Functions know where to send. Only call it after notifications are allowed
export async function registerForPush(userId) {
    const messaging = getMessaging();

    // The service worker in public/ shows the notifications when they arrive
    const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // register() doesn't return the ID, it hands it to onRegistered.
    // The Promise waits until that happens (or register() fails)
    const pushId = await new Promise((resolve, reject) => {
        onRegistered(messaging, resolve);
        register(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration,
        }).catch(reject);
    });

    // arrayUnion adds the ID to the list, unless it's already in it (one ID per browser)
    await updateDoc(doc(db, "users", userId), { pushIds: arrayUnion(pushId) });
}