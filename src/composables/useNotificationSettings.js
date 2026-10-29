import { ref } from "vue";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { updateUserProfile } from "@/services/users";

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

    return {
        notifications,
        errorMessage,
        save,
    };
}