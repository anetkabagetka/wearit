// The service worker: a small script the browser keeps running in the background,
// even when wearit isn't open. It shows the push notifications that Firebase sends.
// It lives in public/, so the browser can load it from /firebase-messaging-sw.js

// A push arrived: show it as a notification
self.addEventListener("push", (event) => {
    // Firebase sends the message as JSON, e.g. { data: { title, body, link } }
    let message;
    try {
        message = event.data.json();
    } catch {
        // Not JSON, so it's not from Firebase. Show nothing
        return;
    }

    // Our Cloud Functions put the text in "data". A test message from the Firebase console uses "notification"
    const title = message.data?.title ?? message.notification?.title ?? "wearit";
    const body = message.data?.body ?? message.notification?.body ?? "";
    const link = message.data?.link ?? "/dashboard";

    // waitUntil keeps the service worker running until the notification is shown
    event.waitUntil(self.registration.showNotification(title, { body, icon: "/favicon.ico", data: { link } }));
});

// The notification was clicked: close it and open wearit on the right page
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data.link));
});