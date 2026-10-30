import { computed, ref } from "vue";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";

// State and actions for the change password page
export function useChangePassword() {
    const { changePassword, errorMessage } = useAuth();

    const currentPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    // Becomes true when the user leaves the confirm field or submits, so we don't complain while they type
    const checkPasswordsMatch = ref(false);
    const isSaving = ref(false);
    const successMessage = ref("");

    // Google accounts have no password in our app, they log in with Google
    const isGoogleAccount = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === "google.com",
    );

    const confirmPasswordError = computed(() =>
        checkPasswordsMatch.value && confirmPassword.value !== newPassword.value
            ? "Passwords do not match."
            : "",
    );

    // true while something is typed and not saved yet (see useUnsavedChanges)
    const hasUnsavedChanges = computed(
        () => !isSaving.value && Boolean(currentPassword.value || newPassword.value || confirmPassword.value),
    );

    // Changes the password, then empties the fields and shows a success message
    const save = async () => {
        checkPasswordsMatch.value = true;
        if (confirmPasswordError.value) {
            return;
        }

        isSaving.value = true;
        successMessage.value = "";

        try {
            await changePassword(currentPassword.value, newPassword.value);
            currentPassword.value = "";
            newPassword.value = "";
            confirmPassword.value = "";
            checkPasswordsMatch.value = false;
            successMessage.value = "Your password is changed.";
        } catch {
            // The readable message is already in errorMessage (from useAuth)
        } finally {
            isSaving.value = false;
        }
    };

    return {
        currentPassword,
        newPassword,
        confirmPassword,
        checkPasswordsMatch,
        confirmPasswordError,
        isGoogleAccount,
        isSaving,
        errorMessage,
        successMessage,
        save,
        hasUnsavedChanges,
    };
}
