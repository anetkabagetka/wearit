<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

import ChartCard from '@/components/ui/ChartCard.vue'
import { chartColors } from '@/utils/charts'

// "Items by category" on Insights: a donut with the item count in the middle, and a legend next to it
const props = defineProps({
    categories: { type: Array, required: true }, // { name, count, percent }, biggest first, at most 4
    itemCount: { type: Number, required: true },
    caption: { type: String, default: '' },
})

const colors = chartColors()

// One piece per category, in the 4 grays. cutout is how big the hole is
const data = computed(() => ({
    labels: props.categories.map((category) => category.name),
    datasets: [{ data: props.categories.map((category) => category.count), backgroundColor: colors.chart, borderWidth: 0 }],
}))
const options = { maintainAspectRatio: false, cutout: '58%', plugins: { legend: { display: false } } }
</script>

<template>
    <ChartCard title="Items by category" :caption="caption">
        <div class="donut-row">
            <div class="donut">
                <Doughnut :data="data" :options="options" />
                <span class="donut-total">{{ itemCount }}<br />{{ itemCount === 1 ? 'item' : 'items' }}</span>
            </div>

            <ul class="legend">
                <li v-for="(category, index) in categories" :key="category.name">
                    <span class="swatch" :style="{ backgroundColor: colors.chart[index] }"></span>
                    <span class="legend-name">{{ category.name }}</span>
                    <span class="caption">{{ category.percent }}%</span>
                </li>
            </ul>
        </div>
    </ChartCard>
</template>

<style scoped>
/* The donut and its legend side by side */
.donut-row {
    display: flex;
    align-items: center;
    gap: 24px;
}

.donut {
    position: relative;
    flex-shrink: 0;
    width: 132px;
    height: 132px;
}

/* "124 items" in the hole of the donut. pointer-events: none lets the mouse reach the chart underneath */
.donut-total {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    pointer-events: none;
}

.legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
}

.legend li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.legend-name {
    flex: 1;
}

.swatch {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 2px;
}
</style>
