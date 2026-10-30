<script setup>
import { computed } from "vue";

import { costPerWear } from "@/utils/wardrobe/costPerWear";
import { formatMoney } from "@/utils/format/formatMoney";

// The "CPW summary" card: cost per wear, how it's calculated,
// and (only when a goal is set) a progress bar towards the goal
const props = defineProps({
    label: { type: String, default: "Cost per wear" },
    price: { type: Number, default: 0 },
    timesWorn: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    // Target cost per wear, e.g. 2 for "€2.00 per wear". No goal, no progress bar
    goal: { type: Number, default: null },
    // Replaces the line under the price
    formula: { type: String, default: "" },
    // Black card with white text
    inverse: { type: Boolean, default: false },
});

// 0 wears counts as 1, the same as costPerWear does, so we never divide by 0
const wears = computed(() => Math.max(props.timesWorn, 1));

const valueText = computed(() => formatMoney(costPerWear(props.price, props.timesWorn), props.currency));

// e.g. "€126 purchase price ÷ 30 wears"
const formulaText = computed(() => {
    if (props.formula) {
        return props.formula;
    }
    const price = formatMoney(props.price, props.currency, { wholeNumbers: true });
    return `${price} purchase price ÷ ${wears.value} ${wears.value === 1 ? "wear" : "wears"}`;
});

const showGoal = computed(() => props.goal > 0 && props.price > 0);
// How many wears in total it takes to get down to the goal, e.g. €126 ÷ €2 = 63 wears
const wearsNeeded = computed(() => Math.ceil(props.price / props.goal));
const wearsToGo = computed(() => Math.max(wearsNeeded.value - props.timesWorn, 0));
// How far along the bar is, from 0 to 100
const progressPercent = computed(() => Math.min((props.timesWorn / wearsNeeded.value) * 100, 100));
const goalText = computed(() => `Goal: ${formatMoney(props.goal, props.currency)} per wear`);

const remainingText = computed(() => {
    if (wearsToGo.value === 0) {
        return "Goal reached";
    }
    return `${wearsToGo.value} ${wearsToGo.value === 1 ? "wear" : "wears"} to go`;
});
</script>

<template>
    <div class="cpw-card" :class="{ 'cpw-card-inverse': inverse }">
        <div class="cpw-card-label">{{ label }}</div>

        <div class="cpw-card-value-row">
            <span class="cpw-card-value">{{ valueText }}</span>
            <span class="cpw-card-unit">per wear</span>
        </div>

        <div class="cpw-card-formula">{{ formulaText }}</div>

        <div v-if="showGoal" class="cpw-card-goal">
            <div class="cpw-card-track" role="progressbar" :aria-valuenow="Math.round(progressPercent)"
                aria-valuemin="0" aria-valuemax="100" :aria-label="`${goalText}, ${remainingText}`">
                <div class="cpw-card-progress" :style="{ width: `${progressPercent}%` }"></div>
            </div>

            <div class="cpw-card-goal-row">
                <span>{{ goalText }}</span>
                <span class="cpw-card-remaining">{{ remainingText }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cpw-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    border: 1px solid var(--black);
    border-radius: 8px;
    background-color: var(--white);
    color: var(--gray);
}

.cpw-card-label {
    font-size: 11px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
}

.cpw-card-value-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.cpw-card-value {
    font-family: var(--font-title);
    font-size: 32px;
    letter-spacing: 1px;
    color: var(--black);
}

.cpw-card-unit {
    font-size: 15px;
}

.cpw-card-formula {
    font-size: 13px;
}

.cpw-card-goal {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.cpw-card-track {
    height: 6px;
    border-radius: 999px;
    background-color: var(--light-gray);
    overflow: hidden;
}

.cpw-card-progress {
    height: 100%;
    border-radius: 999px;
    background-color: var(--black);
}

.cpw-card-goal-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 0.5px;
}

.cpw-card-remaining {
    color: var(--black);
}

.cpw-card-inverse {
    background-color: var(--black);
    color: var(--white);

    .cpw-card-value,
    .cpw-card-remaining {
        color: var(--white);
    }

    .cpw-card-track {
        background-color: #5c5c5c;
    }

    .cpw-card-progress {
        background-color: var(--white);
    }
}
</style>
