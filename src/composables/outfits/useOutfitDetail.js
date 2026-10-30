import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { getWardrobe, listItems } from "@/services/wardrobes";
import { deleteOutfit, getOutfit, logOutfitWear } from "@/services/outfits";
import { wornToday } from "@/utils/wardrobe/wornToday";

// One more wear on the page, the same way useItemDetail does it after "Log a wear"
function addWear(thing) {
    thing.timesWorn = (thing.timesWorn || 0) + 1;
    thing.lastWornAt = new Date();
    // ?? [] starts an empty list when there is no wear history yet
    thing.wornDates = [...(thing.wornDates ?? []), new Date()];
}

// State and actions for the outfit page: the outfit and its items, "Log outfit" and delete
export function useOutfitDetail(outfitId) {
    const router = useRouter();
    const outfit = ref(null);
    const items = ref([]); // Every item in the wardrobe, to find the outfit's items in
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const isLoading = ref(true);
    const isNotFound = ref(false); // true when the outfit in the address doesn't exist
    const isSaving = ref(false);
    const errorMessage = ref("");

    // The outfit's items that are still in the wardrobe, in the order they were picked.
    // Deleted items aren't found, sold, donated and given away ones have removedAs
    const outfitItems = computed(() =>
        (outfit.value?.itemIds ?? [])
            .map((id) => items.value.find((item) => item.id === id))
            .filter((item) => item && !item.removedAs),
    );

    // How many of its items aren't in the wardrobe anymore
    const missingCount = computed(() => (outfit.value?.itemIds.length ?? 0) - outfitItems.value.length);

    // Loads the wardrobe (for the currency), all items and the outfit at the same time
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            const [wardrobe, savedItems, savedOutfit] = await Promise.all([
                getWardrobe(userId),
                listItems(userId),
                getOutfit(userId, outfitId),
            ]);

            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            if (!savedOutfit) {
                isNotFound.value = true;
                return;
            }
            items.value = savedItems;
            outfit.value = savedOutfit;
        } catch {
            errorMessage.value = "Could not load the outfit. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Logs a wear of the outfit and of each of its items, except items already worn today
    // (one wear a day per item). Returns the items that got a wear, or null when it couldn't be saved
    const logWear = async () => {
        const itemsToLog = outfitItems.value.filter((item) => !wornToday(item));

        isSaving.value = true;
        errorMessage.value = "";

        try {
            await logOutfitWear(
                auth.currentUser.uid,
                outfitId,
                itemsToLog.map((item) => item.id),
            );
            // Show the new numbers without loading everything again
            addWear(outfit.value);
            itemsToLog.forEach(addWear);
            return itemsToLog;
        } catch {
            errorMessage.value = "Could not save the wear. Please try again.";
            return null;
        } finally {
            isSaving.value = false;
        }
    };

    // Deletes the outfit, then opens the Outfits tab. Its items and their wears stay
    const remove = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            await deleteOutfit(auth.currentUser.uid, outfitId);
            await router.push({ name: "wardrobe", query: { tab: "outfits" } });
        } catch {
            errorMessage.value = "Could not delete the outfit. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        outfit,
        outfitItems,
        missingCount,
        currency,
        isLoading,
        isNotFound,
        isSaving,
        errorMessage,
        logWear,
        remove,
    };
}