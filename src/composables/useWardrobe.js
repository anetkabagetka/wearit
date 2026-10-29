import { computed, onMounted, ref } from "vue";

import { auth } from "@/firebase";
import { getWardrobe, listItems, markItemRemoved, markItemWorn } from "@/services/wardrobes";
import { listOutfits } from "@/services/outfits";
import { costPerWear, outfitCostPerWear } from "@/utils/costPerWear";
import { cpwSliderMax } from "@/utils/itemOptions";

// What the Filters pop-up starts with. Empty lists mean "show everything"
function emptyFilters() {
    return {
        minCpw: 0,
        maxCpw: cpwSliderMax,
        categories: [],
        brands: [],
        colors: [],
        seasons: [],
    };
}

// true when nothing is picked in a list (so everything counts), or when the value is picked
function isPicked(list, value) {
    return list.length === 0 || list.includes(value);
}

// State and actions for the wardrobe page: the items, the currency, and "Worn today"
export function useWardrobe() {
    const items = ref([]);
    const outfits = ref([]); // Saved outfits: a name plus the IDs of their items
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const goal = ref(null); // The target cost per wear set in onboarding, or null without a goal
    const isLoading = ref(true);
    const errorMessage = ref("");
    const search = ref("");
    const filters = ref(emptyFilters());

    // Does an item fit everything picked in the Filters pop-up?
    const matchesFilters = (item) => {
        const { minCpw, maxCpw, categories, brands, colors, seasons } = filters.value;
        const cpw = costPerWear(item.price, item.timesWorn);

        return (
            cpw >= minCpw &&
            (maxCpw === cpwSliderMax || cpw <= maxCpw) && // At the top of the slider there's no upper limit
            isPicked(categories, item.category) &&
            isPicked(brands, item.brand) &&
            isPicked(colors, item.color) &&
            isPicked(seasons, item.season)
        );
    };

    // Items that match the search bar and the filters, lowest cost per wear first
    const visibleItems = computed(() => {
        const text = search.value.toLowerCase();

        return items.value
            .filter((item) => `${item.name} ${item.brand ?? ""}`.toLowerCase().includes(text) && matchesFilters(item))
            .sort((a, b) => costPerWear(a.price, a.timesWorn) - costPerWear(b.price, b.timesWorn));
    });

    // Every brand in the wardrobe once, A to Z, for the Brand chips. new Set removes duplicates
    const brandOptions = computed(() => [...new Set(items.value.map((item) => item.brand).filter(Boolean))].sort());

    // Outfits with their items filled in, in the order they were picked.
    // filter(Boolean) leaves out items that were deleted, sold, donated or given away
    const outfitsWithItems = computed(() =>
        outfits.value.map((outfit) => ({
            ...outfit,
            items: outfit.itemIds.map((id) => items.value.find((item) => item.id === id)).filter(Boolean),
        })),
    );

    // Outfits that match the search bar (by their name or an item in them), lowest cost per wear first
    const visibleOutfits = computed(() => {
        const text = search.value.toLowerCase();

        return outfitsWithItems.value
            .filter((outfit) =>
                [outfit.name, ...outfit.items.map((item) => item.name)].join(" ").toLowerCase().includes(text),
            )
            .sort((a, b) => outfitCostPerWear(a.items) - outfitCostPerWear(b.items));
    });

    // "Reset" in the Filters pop-up
    const resetFilters = () => {
        filters.value = emptyFilters();
    };

    // Loads the wardrobe (for the currency), all its items and all its outfits
    const load = async () => {
        try {
            const userId = auth.currentUser?.uid;
            // Promise.all loads all three at the same time instead of one after the other
            const [wardrobe, savedItems, savedOutfits] = await Promise.all([
                getWardrobe(userId),
                listItems(userId),
                listOutfits(userId),
            ]);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            goal.value = wardrobe?.targetCostPerWear ?? null;
            // Sold, donated and given away items stay saved (for their history), but aren't in the wardrobe anymore
            items.value = savedItems.filter((item) => !item.removedAs);
            outfits.value = savedOutfits;
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    }

    // Saves one more wear for an item, then updates the item on the page too,
    // so the new count and cost per wear show without loading everything again.
    // Returns true when it worked, so the page knows whether to show "Wear logged"
    const wearItem = async (item) => {
        errorMessage.value = "";

        try {
            await markItemWorn(auth.currentUser.uid, item.id);
            item.timesWorn = (item.timesWorn || 0) + 1;
            item.lastWornAt = new Date();
            // Items saved before wear history existed have no wornDates, ?? [] starts an empty list
            item.wornDates = [...(item.wornDates ?? []), new Date()];
            return true;
        } catch {
            errorMessage.value = "Could not save the wear. Please try again.";
            return false;
        }
    }

    // Takes an item out of the wardrobe (sold, donated or given away), then out of the list on the page too.
    // The sale price is only saved when it was sold. Returns true when it worked
    const removeItem = async (item, reason, salePrice) => {
        errorMessage.value = "";

        try {
            await markItemRemoved(auth.currentUser.uid, item.id, {
                reason,
                salePrice: reason === "sold" ? salePrice : null,
            });
            items.value = items.value.filter((saved) => saved.id !== item.id);
            return true;
        } catch {
            errorMessage.value = "Could not save the change. Please try again.";
            return false;
        }
    };


    onMounted(load);

    return {
        items,
        currency,
        goal,
        isLoading,
        errorMessage,
        search,
        filters,
        brandOptions,
        resetFilters,
        visibleItems,
        outfits,
        visibleOutfits,
        wearItem,
        removeItem,
    }
}