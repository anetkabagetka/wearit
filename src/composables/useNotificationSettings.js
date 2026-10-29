import { onMounted, ref } from "vue";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { updateUserProfile } from "@/services/users";
import { isPushSupported, registerForPush } from "@/services/messaging";

// What everyone starts with until they change something (the same as in Figma)
const defaultNotifications = {
    unusedItems: true,
    weeklySummary: true,
    goalMilestones: true,
    productNews: false,
    remindAfterDays: 30,
};

// State and actions for the notifications settings page.
// The choices are saved on the user profile as one "notifications" object
export function useNotificationSettings() {
    const { profile } = useAuth();

    // The saved choices, with the defaults for anything not saved yet.
    // { ...a, ...b } copies a first and then b on top, so saved choices win over the defaults
    const notifications = ref({ ...defaultNotifications, ...profile.value?.notifications });
    const errorMessage = ref("");

    // Saves all the choices. The page calls it after every change, like settings on a phone
    const save = async () => {
        errorMessage.value = "";

        try {
            // { ...notifications.value } saves a plain copy of the choices
            await updateUserProfile(auth.currentUser.uid, { notifications: { ...notifications.value } });
        } catch {
            errorMessage.value = "Could not save your notification settings. Please try again.";
        }
    };

    // Push notifications in this browser: "checking" while the page opens, then
    // "unsupported", "default" (not asked yet), "granted" (allowed) or "denied" (blocked)
    const pushStatus = ref("checking");

    // Asks the browser for permission and registers it for push.
    // Browsers only allow asking after a click, so the page calls this from a button
    const allowPush = async () => {
        errorMessage.value = "";

        try {
            pushStatus.value = await Notification.requestPermission();
            if (pushStatus.value === "granted") {
                await registerForPush(auth.currentUser.uid);
            }
        } catch {
            errorMessage.value = "Could not turn on notifications on this device. Please try again.";
        }
    };

    // When the page opens: can this browser do push, and was it allowed before?
    onMounted(async () => {
        if (!(await isPushSupported())) {
            pushStatus.value = "unsupported";
            return;
        }
        pushStatus.value = Notification.permission;

        // Allowed before: register again, so Firebase keeps this browser's ID fresh
        if (pushStatus.value === "granted") {
            await allowPush();
        }
    });

    return {
        notifications,
        errorMessage,
        save,
        pushStatus,
        allowPush,
    };
}