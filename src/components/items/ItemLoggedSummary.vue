<script setup>
import { computed } from "vue";

import CpwCard from "@/components/ui/CpwCard.vue";
import { formatMoney } from "@/utils/format/formatMoney";
import { formatWears } from "@/utils/format/formatWears";

import checkIcon from "@/assets/icons/check.svg";

// What "Wear logged" shows, on Home and on the item page: the item and its new cost per wear.
// Like OutfitLoggedSummary, but for one item
const props = defineProps({
    item: { type: Object, required: true }, // Already has the new wear in timesWorn
    cpwBefore: { type: Number, required: true }, // What it cost to wear before this wear
    currency: { type: String, default: "EUR" },
    goal: { type: Number, default: null },
});

// e.g. "€126 ÷ 31 wears · was €4.20"
const loggedFormula = computed(() => {
    const price = formatMoney(props.item.price, props.currency, { wholeNumbers: true });
    return `${price} ÷ ${formatWears(props.item.timesWorn)} · was ${formatMoney(props.cpwBefore, props.currency)}`;
});
</script>

<template>
    <div class="stack">
        <div class="logged-item">
            <span class="logged-check">
                <img :src="checkIcon" alt="" width="20" height="20" class="white-icon" />
            </span>
            <span class="stack-small">
                <span class="logged-name">{{ item.name }}</span>
                <span class="caption">Worn today · wear #{{ item.timesWorn }}</span>
            </span>
        </div>

        <CpwCard label="New cost per wear" :price="item.price" :times-worn="item.timesWorn" :currency="currency"
            :goal="goal" :formula="loggedFormula" />
    </div>
</template>

<style scoped>
.logged-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* The black circle with a check */
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
</style>
