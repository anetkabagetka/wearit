<script setup>
// A box with a title and a gray caption, with one chart inside (the slot).
// It's a .stat-card from main.css with more space between the title and the chart
defineProps({
    title: { type: String, required: true },
    caption: { type: String, default: "" },
});
</script>

<template>
    <section class="stat-card chart-card">
        <div class="chart-card-header">
            <h3 class="chart-card-title">{{ title }}</h3>
            <p v-if="caption" class="caption">{{ caption }}</p>
        </div>

        <div class="chart-card-body">
            <slot />
        </div>
    </section>
</template>

<style scoped>
.chart-card {
    gap: 16px;
}

.chart-card-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* h3 is small, bold and gray in main.css. Chart titles look like the other titles instead */
.chart-card-title {
    font-family: var(--font-title);
    font-weight: normal;
    font-size: 15px;
    letter-spacing: 0.5px;
    color: var(--black);
}

.chart-card-body {
    max-width: 326px;
}
</style>