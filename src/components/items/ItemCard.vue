<script setup>
import { computed } from "vue";

import { costPerWear } from "@/utils/wardrobe/costPerWear";
import { formatMoney } from "@/utils/format/formatMoney";
import { formatWears } from "@/utils/format/formatWears";

// One tile in the wardrobe grid: photo, name, cost per wear, wears and brand.
// Clicking it opens the item's edit page
const props = defineProps({
    item: { type: Object, required: true },
    currency: { type: String, default: "EUR" },
});

const cpwText = computed(() => formatMoney(costPerWear(props.item.price, props.item.timesWorn), props.currency));
</script>

<template>
    <RouterLink :to="{ name: 'item', params: { itemId: item.id } }" class="item-card">
        <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="item-card-photo" />
        <!-- Gray box when the item has no photo -->
        <div v-else class="item-card-photo"></div>

        <div class="item-card-info">
            <span class="item-card-name">{{ item.name }}</span>
            <span class="item-card-cpw">
                <span class="item-card-value">{{ cpwText }}</span>
                <span class="caption">/ wear</span>
            </span>
            <span class="caption">
                {{ formatWears(item.timesWorn) }}<template v-if="item.brand"> · {{ item.brand }}</template>
            </span>
        </div>
    </RouterLink>
</template>

<style scoped>
.item-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--black);
}

.item-card-photo {
    width: 100%;
    height: 214px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

.item-card-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item-card-name {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Long names end with "..." instead of breaking the grid */
}

.item-card-cpw {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.item-card-value {
    font-family: var(--font-title);
    font-size: 18px;
}
</style>