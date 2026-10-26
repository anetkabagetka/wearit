import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { addItem, getWardrobe } from "@/services/wardrobes";
import { uploadItemPhoto } from "@/services/cloudinary";
import { defaultTags } from "@/utils/itemOptions";

// State and actions for the add item page
export function useAddItem() {
    const router = useRouter();

    const item = ref({
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
    });
    const photoFile = ref(null); // The photo the user picked, or null
    const currency = ref("EUR"); // Replaced by the wardrobe's currency once it has loaded
    const goal = ref(null); // The target cost per wear set in onboarding, or null without a goal
    const tagOptions = ref([...defaultTags]); // Copy, so adding a tag doesn't change defaultTags
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Items use the currency and goal the user picked for their whole wardrobe in onboarding
    const loadWardrobe = async () => {
        try {
            const wardrobe = await getWardrobe(auth.currentUser.uid);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            goal.value = wardrobe?.targetCostPerWear ?? null;
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
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

    // Uploads the photo (if there is one), saves the item, then opens the wardrobe
    const save = async () => {
        isSaving.value = true;
        errorMessage.value = "";

        try {
            const userId = auth.currentUser.uid;

            let photoUrl = null;
            if (photoFile.value) {
                photoUrl = await uploadItemPhoto(userId, photoFile.value);
            }

            await addItem(userId, { ...item.value, photoUrl });
            await router.push({ name: "wardrobe" });
        } catch (error) {
            errorMessage.value =
                error instanceof Error ? error.message : "Could not save the item. Please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(loadWardrobe);

    return {
        item,
        photoFile,
        currency,
        goal,
        tagOptions,
        isSaving,
        errorMessage,
        addTag,
        save,
    };
}