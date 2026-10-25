// Import the computed and ref functions from Vue to create reactive state 
// and computed properties
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

// Import the auth object from Firebase, the completeOnboarding and uploadItemPhoto
// service functions, and the costPerWear utility function
import { auth } from "@/firebase";
import { completeOnboarding } from "@/services/wardrobes";
import { uploadItemPhoto } from "@/services/cloudinary";
import { costPerWear } from "@/utils/costPerWear";

// The useOnboarding composable manages the logic for the onboarding process
export function useOnboarding() {
    const router = useRouter();

    const step = ref(2); // Onboarding starts at step 2 (step 1 is signup) and ends at step 4
    const currency = ref("DKK"); // The currency to use for the wardrobe, defaults to DKK
    const goals = ref([]);
    const targetCostPerWear = ref(null);
    const item = ref({
        name: "",
        category: "",
        brand: "",
        price: null,
        purchaseDate: "",
        timesWorn: 0,
    });
    const photoFile = ref(null); // The item photo the user picked, or null if they didn't add one
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Cost per wear now
    const currentCostPerWear = computed(() => costPerWear(item.value.price, item.value.timesWorn));

    // The finish function is called when the user completes the onboarding process
    const finish = async (withItem) => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            const userId = auth.currentUser.uid;

            // Upload the photo to Cloudinary first, so we can save its address on the item
            let photoUrl = null;
            if (withItem && photoFile.value) {
                photoUrl = await uploadItemPhoto(userId, photoFile.value);
            }

            await completeOnboarding(userId, {
                currency: currency.value,
                goals: goals.value,
                targetCostPerWear: targetCostPerWear.value,
                item: withItem ? { ...item.value, photoUrl } : null,
            });
            // Onboarding is done, so go straight to the dashboard
            await router.push({ name: "dashboard" });
        } catch (error) {
            errorMessage.value =
                error instanceof Error ? error.message : "Could not save your wardrobe.";
        } finally {
            isSaving.value = false;
        }
    };

    return {
        step,
        currency,
        goals,
        targetCostPerWear,
        item,
        photoFile,
        isSaving,
        errorMessage,
        currentCostPerWear,
        finish,
    };
}
