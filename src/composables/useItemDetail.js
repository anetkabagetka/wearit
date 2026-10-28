import { onMounted, ref } from "vue";

import { auth } from "@/firebase";
import { getItem, getWardrobe, markItemWorn } from "@/services/wardrobes";

// State and actions for the item detail page: the item, the currency and goal, and "Log a wear"
export function useItemDetail(itemId) {
    const item = ref(null);
    const currency = ref("");
    const goal = ref(null); // The target cost per wear set in onboarding, or null without a goal
    const isLoading = ref(true);
    const isNotFound = ref(false); // true when the item in the address doesn't exist
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Loads the wardrobe (for the currency and goal) and the item at the same time
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            const [wardrobe, savedItem] = await Promise.all([getWardrobe(userId), getItem(userId, itemId)]);

            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            goal.value = wardrobe?.targetCostPerWear ?? null;

            if (!savedItem) {
                isNotFound.value = true;
                return;
            }
            item.value = savedItem;
        } catch {
            errorMessage.value = "Could not load the item. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Saves one more wear, then updates the item on the page too,
    // so the new numbers show without loading everything again
    const logWear = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await markItemWorn(auth.currentUser.uid, itemId);
            item.value.timesWorn = (item.value.timesWorn || 0) + 1;
            item.value.lastWornAt = new Date();
            // Items saved before wear history existed have no wornDates, ?? [] starts an empty list
            item.value.wornDates = [...(item.value.wornDates ?? []), new Date()];
        } catch {
            errorMessage.value = "Could not save the wear. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        item,
        currency,
        goal,
        isLoading,
        isNotFound,
        isSaving,
        errorMessage,
        logWear,
    };
}