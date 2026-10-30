import { ref } from "vue";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { updateUserProfile } from "@/services/users";
import { applyTheme } from "@/utils/theme";

// State and actions for the theme settings page.
// The choice is saved on the user profile as "theme": "light", "dark" or "system"
export function useThemeSettings() {
    const { profile } = useAuth();

    // The saved choice is picked when the page opens. Nothing saved yet means light
    const theme = ref(profile.value?.theme ?? "light");
    const savedTheme = ref(theme.value); // The last choice that was saved, to go back to if saving fails
    const errorMessage = ref("");

    // Switches the colours straight away and saves the choice. The page calls it after every pick,
    // like the Notifications page, so there's no Save button and nothing to lose when leaving
    const save = async () => {
        errorMessage.value = "";
        applyTheme(theme.value);

        try {
            await updateUserProfile(auth.currentUser.uid, { theme: theme.value });
            savedTheme.value = theme.value;
        } catch {
            // Go back to the saved theme, so the page shows what's really saved
            theme.value = savedTheme.value;
            applyTheme(savedTheme.value);
            errorMessage.value = "Could not save your theme. Please try again.";
        }
    };

    return {
        theme,
        errorMessage,
        save,
    };
}
