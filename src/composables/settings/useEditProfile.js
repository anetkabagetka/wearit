import { computed, onBeforeUnmount, ref, watch } from "vue";

import { auth } from "@/firebase";
import { refreshProfile, useAuth } from "@/composables/useAuth";
import { updateUserProfile } from "@/services/users";
import { uploadProfilePicture } from "@/services/cloudinary";

// Largest photo we accept, in megabytes (the same as for item photos)
const MAX_SIZE_MB = 10;

// State and actions for the edit profile page
export function useEditProfile() {
    const { profile, userEmail, changeEmail, errorMessage: authErrorMessage } = useAuth();

    // Start with what's saved now
    const username = ref(profile.value?.username ?? "");
    const email = ref(userEmail.value);
    const photoFile = ref(null); // A new profile photo the user picked, or null
    const previewUrl = ref(""); // Temporary address to show the new photo before saving
    const isPhotoRemoved = ref(false); // true after "Remove photo", until Save
    const isSaving = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");

    // Google accounts log in with Google, so their email can only be changed at Google
    const isGoogleAccount = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === "google.com",
    );

    // Shows the chosen photo right away. The old temporary address is freed first,
    // so the browser doesn't keep old photos in memory
    watch(photoFile, (file) => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
        }
        previewUrl.value = file ? URL.createObjectURL(file) : "";
    });

    onBeforeUnmount(() => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
        }
    });

    // The photo at the top of the page: the new one, else the saved one (unless "Remove photo" was clicked).
    // Empty means the initials show instead
    const shownPhoto = computed(() => previewUrl.value || (isPhotoRemoved.value ? "" : profile.value?.photoUrl));

    // "Remove photo": forget a new photo, and take the saved one off when Save is clicked
    const removePhoto = () => {
        photoFile.value = null;
        isPhotoRemoved.value = true;
    };

    // Called when the user picks a photo with "Change photo"
    const choosePhoto = (file) => {
        errorMessage.value = "";

        if (!file) {
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            errorMessage.value = `Please choose a photo smaller than ${MAX_SIZE_MB} MB.`;
            return;
        }
        photoFile.value = file;
        isPhotoRemoved.value = false;
    };

    // Saves the name and photo, and starts the email change if the email is different
    const save = async () => {
        isSaving.value = true;
        errorMessage.value = "";
        successMessage.value = "";

        try {
            const userId = auth.currentUser.uid;
            const changes = { username: username.value.trim() };

            // Upload a new photo first, so we can save its address on the profile
            if (photoFile.value) {
                changes.photoUrl = await uploadProfilePicture(userId, photoFile.value);
            } else if (isPhotoRemoved.value) {
                // null: no photo, so the initials show everywhere again
                changes.photoUrl = null;
            }

            await updateUserProfile(userId, changes);
            // Load the profile again, so the new name and photo show everywhere (e.g. the nav)
            await refreshProfile();
            photoFile.value = null;
            isPhotoRemoved.value = false;

            const emailChanged = email.value.trim() !== userEmail.value;
            if (emailChanged) {
                await changeEmail(email.value.trim());
                successMessage.value = `Saved. We sent a link to ${email.value.trim()}. Your email changes after you click it.`;
            } else {
                successMessage.value = "Your profile is saved.";
            }
        } catch (error) {
            // Email errors already have a readable message from useAuth
            errorMessage.value =
                authErrorMessage.value ||
                (error instanceof Error ? error.message : "Could not save your profile. Please try again.");
        } finally {
            isSaving.value = false;
        }
    };

    return {
        profile,
        username,
        email,
        isGoogleAccount,
        shownPhoto,
        isGoogleAccount,
        isSaving,
        errorMessage,
        successMessage,
        choosePhoto,
        removePhoto,
        save,
    };
}