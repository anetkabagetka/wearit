<script setup>
import { computed } from "vue";

import OutfitCollage from "@/components/outfits/OutfitCollage.vue";
import { outfitCostPerWear } from "@/utils/wardrobe/costPerWear";
import { formatMoney } from "@/utils/format/formatMoney";
import { formatWears } from "@/utils/format/formatWears";

// One tile in the Outfits grid: its items' photos, name, what it costs to wear, wears and how many items.
// outfit.items are its items that are still in the wardrobe (useWardrobe fills them in)
const props = defineProps({
    outfit: { type: Object, required: true },
    currency: { type: String, default: "EUR" },
});

const cpwText = computed(() => formatMoney(outfitCostPerWear(props.outfit.items), props.currency));

// e.g. "4 items"
const itemCount = computed(() => {
    const count = props.outfit.items.length;
    return `${count} ${count === 1 ? "item" : "items"}`;
});
</script>

<template>
    <!-- Like ItemCard, with the collage instead of one photo. Clicking it opens the outfit's page -->
    <RouterLink :to="{ name: 'outfit', params: { outfitId: outfit.id } }" class="outfit-card">
        <OutfitCollage :items="outfit.items" :photo-url="outfit.photoUrl" class="outfit-card-photo" />

        <div class="outfit-card-info">
            <span class="outfit-card-name">{{ outfit.name }}</span>
            <span class="outfit-card-cpw">
                <span class="outfit-card-value">{{ cpwText }}</span>
                <span class="caption">/ wear</span>
            </span>
            <span class="caption">{{ formatWears(outfit.timesWorn) }} · {{ itemCount }}</span>
        </div>
    </RouterLink>
</template>

<style scoped>
.outfit-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--black);
}

/* Same height as the photo in ItemCard */
.outfit-card-photo {
    height: 214px;
}

.outfit-card-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.outfit-card-name {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Long names end with "..." instead of breaking the grid */
}

.outfit-card-cpw {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.outfit-card-value {
    font-family: var(--font-title);
    font-size: 18px;
}
</style>