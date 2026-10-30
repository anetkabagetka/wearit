import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { deleteItem, getWardrobe, listItems, markItemRemoved, markItemWorn } from "@/services/wardrobes";
import { listOutfits } from "@/services/outfits";

// State and actions for the item detail page: the item, the currency and goal, "Log a wear" and delete
export function useItemDetail(itemId) {
    const router = useRouter();
    const item = ref(null);
    const itemOutfits = ref([]); // The outfits this item is in, with their items filled in
    const currency = ref("");
    const goal = ref(null); // The target cost per wear set in onboarding, or null without a goal
    const isLoading = ref(true);
    const isNotFound = ref(false); // true when the item in the address doesn't exist
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Loads the wardrobe (for the currency and goal), all items and all outfits at the same time.
    // All items, so the outfits this item is in can show their photos and cost per wear
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            const [wardrobe, savedItems, savedOutfits] = await Promise.all([
                getWardrobe(userId),
                listItems(userId),
                listOutfits(userId),
            ]);
            const savedItem = savedItems.find((saved) => saved.id === itemId);

            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            goal.value = wardrobe?.targetCostPerWear ?? null;

            if (!savedItem) {
                isNotFound.value = true;
                return;
            }
            item.value = savedItem;
            // Outfits with this item in them. Their items that left the wardrobe drop out, like on the outfit page
            itemOutfits.value = savedOutfits
                .filter((outfit) => outfit.itemIds.includes(itemId))
                .map((outfit) => ({
                    ...outfit,
                    items: outfit.itemIds
                        .map((id) => savedItems.find((saved) => saved.id === id))
                        .filter((saved) => saved && !saved.removedAs),
                }));
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

    // Deletes the item (its wear history goes with it), then opens the wardrobe
    const remove = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await deleteItem(auth.currentUser.uid, itemId);
            await router.push({ name: "wardrobe" });
        } catch {
            errorMessage.value = "Could not delete the item. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    // Takes the item out of the wardrobe (sold, donated or given away), then opens the wardrobe.
    // The sale price is only saved when it was sold
    const markRemoved = async (reason, salePrice) => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await markItemRemoved(auth.currentUser.uid, itemId, {
                reason,
                salePrice: reason === "sold" ? salePrice : null,
            });
            await router.push({ name: "wardrobe" });
        } catch {
            errorMessage.value = "Could not save the change. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        item,
        itemOutfits,
        currency,
        goal,
        isLoading,
        isNotFound,
        isSaving,
        errorMessage,
        logWear,
        remove,
        markRemoved,
    };
}