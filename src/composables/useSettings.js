import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { auth } from "@/firebase";
import { useAuth } from "@/composables/useAuth";
import { getWardrobe, listItems } from "@/services/wardrobes";
import { averageCostPerWear } from "@/utils/costPerWear";

// State and actions for the main settings page
export function useSettings() {
    const router = useRouter();
    const { profile, userEmail, logout } = useAuth();

    const currency = ref("EUR");
    const itemCount = ref(0);
    const averageCpw = ref(0);
    const isLoading = ref(true);
    const errorMessage = ref("");

    // Loads the wardrobe's currency and the items, for the stats on the profile card
    const load = async () => {
        try {
            const userId = auth.currentUser.uid;
            // Promise.all loads both at the same time instead of one after the other
            const [wardrobe, items] = await Promise.all([getWardrobe(userId), listItems(userId)]);

            if (wardrobe?.currency) {
                currency.value = wardrobe.currency;
            }
            itemCount.value = items.length;
            averageCpw.value = averageCostPerWear(items);
        } catch {
            errorMessage.value = "Could not load your wardrobe. Please refresh the page.";
        } finally {
            isLoading.value = false;
        }
    };

    // Logs out, then goes to the landing page
    const handleLogout = async () => {
        try {
            await logout();
            await router.push({ name: "landing" });
        } catch {
            errorMessage.value = "Could not log out. Please try again.";
        }
    };

    onMounted(load);

    return {
        profile,
        userEmail,
        currency,
        itemCount,
        averageCpw,
        isLoading,
        errorMessage,
        handleLogout,
    };
}