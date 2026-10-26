import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { addItem, deleteItem, getItem, getWardrobe, updateItem } from "@/services/wardrobes";
import { uploadItemPhoto } from "@/services/cloudinary";
import { defaultTags } from "@/utils/itemOptions";

// An empty form, used when adding a new item
function emptyItem() {
    return {
        name: "",
        brand: "",
        category: "",
        color: "",
        season: "",
        price: null,
        purchaseDate: "",
        timesWorn: 0, // Wears before adding the item, e.g. a coat worn for two winters
        tags: [],
        notes: "",
    };
}

// Turns a saved item into form values. Firestore saves empty fields as null,
// but inputs and selects need "" to show as empty
function toFormItem(savedItem) {
    return {
        name: savedItem.name ?? "",
        brand: savedItem.brand ?? "",
        category: savedItem.category ?? "",
        color: savedItem.color ?? "",
        season: savedItem.season ?? "",
        price: savedItem.price ?? null,
        purchaseDate: savedItem.purchaseDate ?? "",
        timesWorn: savedItem.timesWorn ?? 0,
        tags: savedItem.tags ?? [],
        notes: savedItem.notes ?? "",
    };
}

// State and actions for the item form.
// Without an itemId it adds a new item, with an itemId it edits that item
export function useItemForm(itemId = null) {
    const router = useRouter();
    const isEditing = itemId !== null;

    const item = ref(emptyItem());
    const photoFile = ref(null); // A new photo the user picked, or null
    const savedPhotoUrl = ref(null); // The photo the item already has (edit only)
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const goal = ref(null); // The target cost per wear set in onboarding, or null without a goal
    const tagOptions = ref([...defaultTags]); // Copy, so adding a tag doesn't change defaultTags
    const isLoading = ref(true);
    const isNotFound = ref(false); // true when the item in the address doesn't exist
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Loads the wardrobe's currency and goal, and when editing also the item itself
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;

            const wardrobe = await getWardrobe(userId);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            goal.value = wardrobe?.targetCostPerWear ?? null;

            if (isEditing) {
                const savedItem = await getItem(userId, itemId);

                if (!savedItem) {
                    isNotFound.value = true;
                    return;
                }

                item.value = toFormItem(savedItem);
                savedPhotoUrl.value = savedItem.photoUrl ?? null;
                // Show the item's own tags as chips too, also ones the user added themselves.
                // new Set removes duplicates
                tagOptions.value = [...new Set([...defaultTags, ...item.value.tags])];
            }
        } catch {
            errorMessage.value = "Could not load the item. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Adds a new tag chip and selects it right away
    const addTag = (tag) => {
        const cleanTag = tag.trim();

        if (!cleanTag) {
            return;
        }
        if (!tagOptions.value.includes(cleanTag)) {
            tagOptions.value.push(cleanTag);
        }
        if (!item.value.tags.includes(cleanTag)) {
            item.value.tags.push(cleanTag);
        }
    };

    // Uploads a new photo (if one was picked), saves the item, then opens the wardrobe
    const save = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            const userId = auth.currentUser.uid;

            // Keep the old photo unless the user picked a new one
            let photoUrl = savedPhotoUrl.value;
            if (photoFile.value) {
                photoUrl = await uploadItemPhoto(userId, photoFile.value);
            }

            if (isEditing) {
                await updateItem(userId, itemId, { ...item.value, photoUrl });
            } else {
                await addItem(userId, { ...item.value, photoUrl });
            }
            await router.push({ name: "wardrobe" });
        } catch (error) {
            errorMessage.value =
                error instanceof Error ? error.message : "Could not save the item. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    // Deletes the item after asking, then opens the wardrobe (edit only)
    const remove = async () => {
        if (!confirm(`Delete ${item.value.name || "this item"}? This can't be undone.`)) {
            return;
        }

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

    onMounted(load);

    return {
        isEditing,
        item,
        photoFile,
        currency,
        goal,
        tagOptions,
        isLoading,
        isNotFound,
        isSaving,
        errorMessage,
        addTag,
        save,
        remove,
    };
}