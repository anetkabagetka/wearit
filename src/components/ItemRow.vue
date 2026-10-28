<script setup>
import { computed } from "vue";

import chevronRightIcon from "@/assets/icons/chevron-right.svg";
import { costPerWear } from "@/utils/costPerWear";
import { formatMoney } from "@/utils/formatMoney";
import { formatWears } from "@/utils/formatWears";

// One row in the wardrobe list: photo, name, brand and wears, cost per wear.
// Clicking it opens the item's edit page
const props = defineProps({
    item: { type: Object, required: true },
    currency: { type: String, default: "EUR" },
});

const cpwText = computed(() => formatMoney(costPerWear(props.item.price, props.item.timesWorn), props.currency));
</script>

<template>
    <RouterLink :to="{ name: 'edit-item', params: { itemId: item.id } }" class="item-row">
        <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="item-row-photo" />
        <!-- Gray box when the item has no photo -->
        <div v-else class="item-row-photo"></div>

        <span class="item-row-text">
            <span class="item-row-name">{{ item.name }}</span>
            <span class="caption">
                <template v-if="item.brand">{{ item.brand }} · </template>{{ formatWears(item.timesWorn) }}
            </span>
        </span>

        <span class="item-row-cpw">
            <span class="item-row-value">{{ cpwText }}</span>
            <span class="caption">per wear</span>
        </span>

        <img :src="chevronRightIcon" alt="" width="20" height="20" />
    </RouterLink>
</template>

<style scoped>
.item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--light-gray);
    color: var(--black);
}

.item-row-photo {
    flex-shrink: 0;
    width: 48px;
    height: 56px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

.item-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item-row-name {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-row-cpw {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.item-row-value {
    font-family: var(--font-title);
    font-size: 15px;
}
</style>