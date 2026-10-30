import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { getWardrobe, listItems } from "@/services/wardrobes";
import { addOutfit, getOutfit, updateOutfit } from "@/services/outfits";
import { uploadOutfitPhoto } from "@/services/cloudinary";
import { outfitCostPerWear } from "@/utils/wardrobe/costPerWear";
import { categoryOptions, defaultTags, mainCategory } from "@/utils/wardrobe/itemOptions";

// Largest photo we accept, in megabytes
const MAX_SIZE_MB = 10;

// State and actions for the outfit form: pick items, name the outfit, save it.
// Without an outfitId it creates a new outfit, with an outfitId it edits that outfit
export function useOutfitForm(outfitId = null) {
    const router = useRouter();
    const isEditing = outfitId !== null;

    const items = ref([]); // Every item in the wardrobe, to pick from
    const pickedIds = ref([]); // IDs of the picked items, in the order they were picked
    const name = ref("");
    const tags = ref([]);
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const search = ref("");
    const category = ref("all"); // The chosen chip: "all" or a category like "Tops"
    const isLoading = ref(true);
    const isNotFound = ref(false); // true when the outfit in the address doesn't exist
    const isSaving = ref(false);
    const errorMessage = ref("");
    const pickError = ref(""); // Shown when Save is clicked with fewer than 2 items
    const photoFile = ref(null); // A new photo of the outfit the user picked, or null
    const previewUrl = ref(""); // A temporary local address for photoFile, to show it before it's saved
    const savedPhotoUrl = ref(null); // The photo the outfit already has (edit only)
    const isPhotoRemoved = ref(false); // true after "Remove photo", until Save
    // Name, items and tags when the page opened, as text, to spot changes. Empty until an outfit loads
    const savedForm = ref(JSON.stringify({ name: "", itemIds: [], tags: [] }));

    // The picked items themselves, in the order they were picked
    const pickedItems = computed(() =>
        pickedIds.value.map((id) => items.value.find((item) => item.id === id)),
    );

    // What wearing the outfit costs: its items' costs per wear added up
    const outfitCpw = computed(() => outfitCostPerWear(pickedItems.value));

    // The category chips: only categories that are in the wardrobe, in the usual order
    const categories = computed(() =>
        categoryOptions.filter((option) => items.value.some((item) => mainCategory(item.category) === option)),
    );

    // Tags to pick from: the usual ones, every tag already used on an item, and the outfit's own.
    // new Set removes duplicates
    const tagOptions = computed(() => [
        ...new Set([...defaultTags, ...items.value.flatMap((item) => item.tags ?? []), ...tags.value]),
    ]);

    // Items that match the search bar and the chosen chip
    const visibleItems = computed(() => {
        const text = search.value.toLowerCase();

        return items.value
            .filter((item) => `${item.name} ${item.brand ?? ""}`.toLowerCase().includes(text))
            .filter((item) => category.value === "all" || mainCategory(item.category) === category.value);
    });

    const isPicked = (item) => pickedIds.value.includes(item.id);

    // The parts of the form that get saved, as text, so two versions are easy to compare
    const formText = () => JSON.stringify({ name: name.value, itemIds: pickedIds.value, tags: tags.value });

    // true when something was changed and not saved yet (see useUnsavedChanges).
    // While saving it's false, so opening the outfit after Save isn't stopped
    const hasUnsavedChanges = computed(
        () => !isSaving.value && (photoFile.value !== null || isPhotoRemoved.value || formText() !== savedForm.value),
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

    // The outfit's own photo: the new one, else the saved one (unless "Remove photo" was clicked).
    // Empty means the collage of its items shows instead
    const shownPhoto = computed(() => previewUrl.value || (isPhotoRemoved.value ? "" : savedPhotoUrl.value) || "");

    // Called when the user picks a photo with "Add your own photo"
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

    // "Remove photo": forget a new photo, and take the saved one off when Save is clicked
    const removePhoto = () => {
        photoFile.value = null;
        isPhotoRemoved.value = true;
    };

    // "Add" puts an item in the outfit, "Added" takes it out again
    const togglePick = (item) => {
        if (isPicked(item)) {
            pickedIds.value = pickedIds.value.filter((id) => id !== item.id);
        } else {
            pickedIds.value = [...pickedIds.value, item.id];
        }
        pickError.value = "";
    };

    // Loads the wardrobe's currency and its items, and when editing also the outfit itself
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            // Promise.all loads all three at the same time instead of one after the other
            const [wardrobe, savedItems, savedOutfit] = await Promise.all([
                getWardrobe(userId),
                listItems(userId),
                isEditing ? getOutfit(userId, outfitId) : null,
            ]);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            // Sold, donated and given away items aren't in the wardrobe anymore, so they can't be picked
            items.value = savedItems.filter((item) => !item.removedAs);

            if (isEditing) {
                if (!savedOutfit) {
                    isNotFound.value = true;
                    return;
                }
                name.value = savedOutfit.name;
                tags.value = savedOutfit.tags ?? [];
                savedPhotoUrl.value = savedOutfit.photoUrl ?? null;
                // Only items that are still in the wardrobe stay picked
                pickedIds.value = savedOutfit.itemIds.filter((id) => items.value.some((item) => item.id === id));
            }
            savedForm.value = formText();
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Saves the outfit. A new one opens the Outfits tab, a changed one goes back to its own page
    const save = async () => {
        if (pickedIds.value.length < 2) {
            pickError.value = "Pick at least 2 items.";
            return;
        }

        isSaving.value = true;
        errorMessage.value = "";

        try {
            const userId = auth.currentUser.uid;

            // Keep the old photo unless the user picked a new one or removed it
            let photoUrl = isPhotoRemoved.value ? null : savedPhotoUrl.value;
            if (photoFile.value) {
                photoUrl = await uploadOutfitPhoto(userId, photoFile.value);
            }

            const outfit = {
                name: name.value.trim(),
                itemIds: pickedIds.value,
                tags: tags.value,
                photoUrl,
            };

            if (isEditing) {
                await updateOutfit(userId, outfitId, outfit);
                await router.push({ name: "outfit", params: { outfitId } });
            } else {
                await addOutfit(userId, outfit);
                await router.push({ name: "wardrobe", query: { tab: "outfits" } });
            }
        } catch {
            errorMessage.value = "Could not save the outfit. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        isEditing,
        name,
        tags,
        currency,
        search,
        category,
        isLoading,
        isNotFound,
        isSaving,
        errorMessage,
        pickError,
        shownPhoto,
        choosePhoto,
        removePhoto,
        pickedItems,
        outfitCpw,
        categories,
        tagOptions,
        visibleItems,
        isPicked,
        togglePick,
        save,
        hasUnsavedChanges,
    };
}