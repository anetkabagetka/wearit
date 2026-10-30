import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { deleteUserData } from "@/services/users";
import { listItems } from "@/services/wardrobes";

// State and actions for the delete account page
export function useDeleteAccount() {
    const router = useRouter();
    const { confirmIdentity, deleteLoginAccount, errorMessage, clearError } = useAuth();

    const confirmText = ref(""); // Must be "DELETE"
    const password = ref("");
    const itemCount = ref(0);
    const wearCount = ref(0);
    const isDeleting = ref(false);

    // Google accounts confirm in a Google window instead of typing a password
    const isGoogleAccount = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === "google.com",
    );

    // Loads the numbers for the warning box, e.g. "124 items and 625 logged wears"
    const loadStats = async () => {
        try {
            const items = await listItems(auth.currentUser.uid);
            itemCount.value = items.length;
            wearCount.value = items.reduce((total, item) => total + (item.timesWorn || 0), 0);
        } catch {
            // The warning still works without the numbers, so we don't show an error here
        }
    };

    // 1. Confirm it's really the user, 2. delete their data, 3. delete their login
    const deleteAccount = async () => {
        isDeleting.value = true;

        try {
            await confirmIdentity(password.value);
            await deleteUserData(auth.currentUser.uid);
            await deleteLoginAccount();
            await router.push({ name: "landing" });
        } catch {
            // The readable message is already in errorMessage (from useAuth)
            if (!errorMessage.value) {
                errorMessage.value = "Could not delete your account. Please try again.";
            }
        } finally {
            isDeleting.value = false;
        }
    };

    // Don't show an old error from another page, e.g. a failed login
    clearError();
    onMounted(loadStats);

    return {
        confirmText,
        password,
        itemCount,
        wearCount,
        isGoogleAccount,
        isDeleting,
        errorMessage,
        deleteAccount,
    };
}
