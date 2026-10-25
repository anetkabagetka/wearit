<script setup>
// AI Generated component to show the progress of the onboarding steps. 
// It takes two props: current (the current step) and total (the total number of steps). 
// It renders a series of bars, with the active bar highlighted based on the current step.
defineProps({
    current: { type: Number, required: true },
    total: { type: Number, default: 4 },
});
</script>

<template>
    <div class="step-progress" :aria-label="`Step ${current} of ${total}`">
        <span
            v-for="n in total"
            :key="n"
            class="step-progress-bar"
            :class="{ active: n <= current }"
        ></span>
    </div>
</template>

<style scoped>
.step-progress {
    display: flex;
    gap: 8px;
}

.step-progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background-color: var(--subtle-gray);
}

.step-progress-bar.active {
    background-color: var(--black);
}
</style>