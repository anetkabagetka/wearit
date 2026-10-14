// Import the computed and ref functions from Vue to create reactive state 
// and computed properties
import { computed, ref } from "vue";

// Import the auth object from Firebase, the useAuth composable,
// the completeOnboarding service function, and the costPerWear utility function
import { auth } from "../firebase";
import { useAuth } from "./useAuth";
import { completeOnboarding } from "../services/wardrobes";
import { costPerWear } from "../utils/costPerWear";

// The useOnboarding composable manages the logic for the onboarding process
export function useOnboarding() {
    // Get the current user's profile from the useAuth composable
    const { profile } = useAuth();

    const step = ref(1); // The current step of the onboarding process (1, 2, or 3) by default, starts at 1
    const username = ref(profile.value?.username ?? ""); // Optional username, empty by default
    const currency = ref("DKK"); // The currency to use for the wardrobe, defaults to DKK
    const item = ref({
        name: "",
        category: "",
        price: null,
        purchaseDate: "",
        timesWorn: 0,
    });
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Cost per wear now
    const currentCostPerWear = computed(() => costPerWear(item.value.price, item.value.timesWorn));

    // The finish function is called when the user completes the onboarding process
    const finish = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await completeOnboarding(auth.currentUser.uid, {
                username: username.value,
                currency: currency.value,
                item: item.value,
            });
            step.value = 3; // Set to the last step to show the success message
        } catch (error) {
            errorMessage.value =
                error instanceof Error ? error.message : "Could not save your wardrobe.";
        } finally {
            isSaving.value = false;
        }
    };

    return {
        step,
        username,
        currency,
        item,
        isSaving,
        errorMessage,
        currentCostPerWear,
        finish,
    };
}
