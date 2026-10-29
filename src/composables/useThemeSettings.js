import { ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { updateUserProfile } from "@/services/users";
import { applyTheme } from "@/utils/theme";

// State and actions for the theme settings page.
// The choice is saved on the user profile as "theme": "light", "dark" or "system"
export function useThemeSettings() {
    const router = useRouter();
    const { profile } = useAuth();

    // The saved choice is picked when the page opens. Nothing saved yet means light
    const theme = ref(profile.value?.theme ?? "light");
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Saves the choice, switches the colours straight away, then goes back to settings
    const save = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await updateUserProfile(auth.currentUser.uid, { theme: theme.value });
            applyTheme(theme.value);
            await router.push({ name: "settings" });
        } catch {
            errorMessage.value = "Could not save your theme. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    return {
        theme,
        isSaving,
        errorMessage,
        save,
    };
}