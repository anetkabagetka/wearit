<script setup>
import { computed } from "vue";

import CpwCard from "@/components/ui/CpwCard.vue";
import { outfitCostPerWear } from "@/utils/wardrobe/costPerWear";
import { formatMoney } from "@/utils/format/formatMoney";

import checkIcon from "@/assets/icons/check.svg";
import infoIcon from "@/assets/icons/info.svg";

// What "Outfit logged" shows, on Home and on the outfit page: the outfit, its new cost per wear,
// and which items were skipped because they were already worn today
const props = defineProps({
    outfit: { type: Object, required: true }, // For its name and wear count
    items: { type: Array, required: true }, // Its items that are in the wardrobe
    loggedItems: { type: Array, required: true }, // The items that just got a wear
    cpwBefore: { type: Number, required: true }, // What the outfit cost to wear before this wear
    currency: { type: String, default: "EUR" },
});

// What it costs to wear now, after the wear
const cpwNow = computed(() => outfitCostPerWear(props.items));

// Items that didn't get a wear because they were already worn today
const skippedItems = computed(() => props.items.filter((item) => !props.loggedItems.includes(item)));

// e.g. "Was €14.30 (↓ €0.37) · 3 of 4 items got a wear"
const loggedFormula = computed(() => {
    const before = formatMoney(props.cpwBefore, props.currency);
    const drop = formatMoney(props.cpwBefore - cpwNow.value, props.currency);
    const logged = props.loggedItems.length;
    const total = props.items.length;
    const itemsText = logged === total ? `all ${total} items got a wear` : `${logged} of ${total} items got a wear`;
    return `Was ${before} (↓ ${drop}) · ${itemsText}`;
});

// e.g. "Wool blazer was already logged today" or "Wool blazer and Leather loafers were already logged today"
const skippedTitle = computed(() => {
    const names = skippedItems.value.map((item) => item.name);
    if (names.length === 1) {
        return `${names[0]} was already logged today`;
    }
    return `${names.slice(0, -1).join(", ")} and ${names.at(-1)} were already logged today`;
});

const skippedText = computed(() => {
    const logged = props.loggedItems.length;
    const skipped = skippedItems.value.length === 1 ? "it was" : "they were";
    return `One wear a day per item, so ${skipped} skipped. The other ${logged} ${logged === 1 ? "item" : "items"} got a wear.`;
});
</script>

<template>
    <div class="stack">
        <!-- The black circle with a check, like "Wear logged" on Home -->
        <div class="logged-item">
            <span class="logged-check">
                <img :src="checkIcon" alt="" width="20" height="20" class="white-icon" />
            </span>
            <span class="stack-small">
                <span class="logged-name">{{ outfit.name }}</span>
                <span class="caption">Worn today · wear #{{ outfit.timesWorn }}</span>
            </span>
        </div>

        <!-- CpwCard divides the price by the wears, so the sum with 1 wear shows the sum itself -->
        <CpwCard label="New outfit cost per wear" :price="cpwNow" :times-worn="1" :currency="currency"
            :formula="loggedFormula" />

        <!-- The gray box from Home, only when some items were already worn today -->
        <div v-if="skippedItems.length" class="tip-box stack-small">
            <h4 class="tip-title">
                <img :src="infoIcon" alt="" width="20" height="20" />
                {{ skippedTitle }}
            </h4>
            <p class="notes">{{ skippedText }}</p>
        </div>
    </div>
</template>

<style scoped>
.logged-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logged-check {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--black);
}

.logged-name {
    font-family: var(--font-title);
    font-size: 15px;
    color: var(--black);
}

.white-icon {
    filter: var(--icon-on-black-filter);
}

.tip-box {
    padding: 16px;
    border-radius: 8px;
    background-color: var(--subtle-gray);
}

.tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}
</style>