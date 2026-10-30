<script setup>
import { computed } from "vue";

import OutfitCollage from "@/components/outfits/OutfitCollage.vue";
import chevronRightIcon from "@/assets/icons/chevron-right.svg";
import { outfitCostPerWear } from "@/utils/wardrobe/costPerWear";
import { formatMoney } from "@/utils/format/formatMoney";
import { formatWears } from "@/utils/format/formatWears";

// One outfit in a list, like ItemRow: its photos, name, items and wears, what it costs to wear.
// Clicking it opens the outfit's page. outfit.items are its items that are still in the wardrobe
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
    <RouterLink :to="{ name: 'outfit', params: { outfitId: outfit.id } }" class="outfit-row">
        <OutfitCollage :items="outfit.items" :photo-url="outfit.photoUrl" class="outfit-row-photo" />

        <span class="outfit-row-text">
            <span class="outfit-row-name">{{ outfit.name }}</span>
            <span class="caption">{{ itemCount }} · {{ formatWears(outfit.timesWorn) }}</span>
        </span>

        <span class="outfit-row-cpw">
            <span class="outfit-row-value">{{ cpwText }}</span>
            <span class="caption">per wear</span>
        </span>

        <img :src="chevronRightIcon" alt="" width="20" height="20" />
    </RouterLink>
</template>

<style scoped>
/* The same sizes as ItemRow, so items and outfits line up in one list */
.outfit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--light-gray);
    color: var(--black);
}

.outfit-row-photo {
    flex-shrink: 0;
    width: 48px;
    height: 56px;
}

.outfit-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.outfit-row-name {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.outfit-row-cpw {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.outfit-row-value {
    font-family: var(--font-title);
    font-size: 15px;
}
</style>