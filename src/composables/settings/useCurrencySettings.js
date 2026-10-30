import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { changeWardrobeCurrency, getWardrobe, listItems } from "@/services/wardrobes";
import { convertAmount } from "@/utils/wardrobe/currencyOptions";

// State and actions for the currency settings page
export function useCurrencySettings() {
    const router = useRouter();

    const currency = ref("EUR"); // The currency picked on the page
    const savedCurrency = ref("EUR"); // The currency the wardrobe uses now
    const savedGoal = ref(null); // The target cost per wear, in the current currency
    const isLoading = ref(true);
    const isSaving = ref(false);
    const errorMessage = ref("");

    // Loads the wardrobe's currency and goal, so the current currency is selected
    const load = async () => {
        try {
            const wardrobe = await getWardrobe(auth.currentUser.uid);
            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
                savedCurrency.value = wardrobe.currency;
            }
            savedGoal.value = wardrobe?.targetCostPerWear ?? null;
        } catch {
            errorMessage.value = "Could not load your currency. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // The "Convert all your prices?" pop-up on the page (AppDialog)
    const isConfirmOpen = ref(false);

    // Save: when nothing changed there's nothing to convert, so just go back. Otherwise ask first
    const save = async () => {
        if (currency.value === savedCurrency.value) {
            await router.push({ name: "settings" });
            return;
        }
        isConfirmOpen.value = true;
    };

    // "Convert prices" in the pop-up: converts every price and the goal to the new currency
    // and saves it all together
    const convertAndSave = async () => {
        const from = savedCurrency.value;
        const to = currency.value;

        isSaving.value = true;
        errorMessage.value = "";

        try {
            const userId = auth.currentUser.uid;
            const items = await listItems(userId);

            await changeWardrobeCurrency(userId, {
                currency: to,
                targetCostPerWear: savedGoal.value ? convertAmount(savedGoal.value, from, to) : null,
                items: items.map((item) => ({
                    id: item.id,
                    price: convertAmount(item.price || 0, from, to),
                })),
            });

            await router.push({ name: "settings" });
        } catch {
            // Close the pop-up, so the message on the page shows
            isConfirmOpen.value = false;
            errorMessage.value = "Could not change your currency. Nothing was changed, please try again.";
        } finally {
            isSaving.value = false;
        }
    };

    onMounted(load);

    return {
        currency,
        isLoading,
        isSaving,
        errorMessage,
        save,
        savedCurrency,
        isConfirmOpen,
        convertAndSave,
    };
}