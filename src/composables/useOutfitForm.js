import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { getWardrobe, listItems } from "@/services/wardrobes";
import { addOutfit } from "@/services/outfits";
import { outfitCostPerWear } from "@/utils/costPerWear";
import { categoryOptions, defaultTags } from "@/utils/itemOptions";

// State and actions for the Create outfit page: pick items, name the outfit, save it
export function useOutfitForm() {
    const router = useRouter();

    const items = ref([]); // Every item in the wardrobe, to pick from
    const pickedIds = ref([]); // IDs of the picked items, in the order they were picked
    const name = ref("");
    const tags = ref([]);
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const search = ref("");
    const category = ref("all"); // The chosen chip: "all" or a category like "Tops"
    const isLoading = ref(true);
    const isSaving = ref(false);
    const errorMessage = ref("");
    const pickError = ref(""); // Shown when Save is clicked with fewer than 2 items

    // The picked items themselves, in the order they were picked
    const pickedItems = computed(() =>
        pickedIds.value.map((id) => items.value.find((item) => item.id === id)),
    );

    // What wearing the outfit costs: its items' costs per wear added up
    const outfitCpw = computed(() => outfitCostPerWear(pickedItems.value));

    // The category chips: only categories that are in the wardrobe, in the usual order
    const categories = computed(() =>
        categoryOptions.filter((option) => items.value.some((item) => item.category === option)),
    );

    // Tags to pick from: the usual ones plus every tag already used on an item. new Set removes duplicates
    const tagOptions = computed(() => [
        ...new Set([...defaultTags, ...items.value.flatMap((item) => item.tags ?? [])]),
    ]);

    // Items that match the search bar and the chosen chip
    const visibleItems = computed(() => {
        const text = search.value.toLowerCase();

        return items.value
            .filter((item) => `${item.name} ${item.brand ?? ""}`.toLowerCase().includes(text))
            .filter((item) => category.value === "all" || item.category === category.value);
    });

    const isPicked = (item) => pickedIds.value.includes(item.id);

    // "Add" puts an item in the outfit, "Added" takes it out again
    const togglePick = (item) => {
        if (isPicked(item)) {
            pickedIds.value = pickedIds.value.filter((id) => id !== item.id);
        } else {
            pickedIds.value = [...pickedIds.value, item.id];
        }
        pickError.value = "";
    };

    // Loads the wardrobe's currency and its items
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            // Promise.all loads both at the same time instead of one after the other
            const [wardrobe, savedItems] = await Promise.all([getWardrobe(userId), listItems(userId)]);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            // Sold, donated and given away items aren't in the wardrobe anymore, so they can't be picked
            items.value = savedItems.filter((item) => !item.removedAs);
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Saves the outfit, then opens the Outfits tab of the Wardrobe page
    const save = async () => {
        if (pickedIds.value.length < 2) {
            pickError.value = "Pick at least 2 items.";
            return;
        }

        isSaving.value = true;
        errorMessage.value = "";

        try {
            await addOutfit(auth.currentUser.uid, {
                name: name.value.trim(),
                itemIds: pickedIds.value,
                tags: tags.value,
            });
            await router.push({ name: "wardrobe", query: { tab: "outfits" } });
        } catch {
            errorMessage.value = "Could not save the outfit. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        name,
        tags,
        currency,
        search,
        category,
        isLoading,
        isSaving,
        errorMessage,
        pickError,
        pickedItems,
        outfitCpw,
        categories,
        tagOptions,
        visibleItems,
        isPicked,
        togglePick,
        save,
    };
}