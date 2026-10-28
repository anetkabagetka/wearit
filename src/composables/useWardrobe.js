import { onMounted, ref } from "vue";

import { auth } from "@/firebase";
import { getWardrobe, listItems, markItemWorn } from "@/services/wardrobes";

// State and actions for the wardrobe page: the items, the currency, and "Worn today"
export function useWardrobe() {
    const items = ref([]);
    const currency = ref("");
    const isLoading = ref(true);
    const errorMessage = ref("");

    // Loads the wardrobe (for the currency) and all its items
    const load = async () => {
        try {
            const userId = auth.currentUser?.uid;
            // Promise.all loads both at the same time instead of one after the other
            const [wardrobe, savedItems] = await Promise.all([getWardrobe(userId), listItems(userId)]);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            items.value = savedItems;
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    }

    // Saves one more wear for an item, then updates the item on the page too,
    // so the new count and cost per wear show without loading everything again
    const wearItem = async (item) => {
        errorMessage.value = "";

        try {
            await markItemWorn(auth.currentUser.uid, item.id);
            item.timesWorn = (item.timesWorn || 0) + 1;
            item.lastWornAt = new Date();
        } catch {
            errorMessage.value = "Could not save the wear. Please try again.";
        }
    }

    onMounted(load);

    return {
        items,
        currency,
        isLoading,
        errorMessage,
        wearItem,
    }
}