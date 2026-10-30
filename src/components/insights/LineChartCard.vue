<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

import ChartCard from '@/components/ui/ChartCard.vue'
import { chartColors } from '@/utils/charts'

// A card with a line chart, one value per month: "Average CPW trend" and "Wears per month" on Insights
const props = defineProps({
    title: { type: String, required: true },
    caption: { type: String, default: '' },
    points: { type: Array, required: true }, // { label: "Sep", value: 6.85 }, oldest first
    formatValue: { type: Function, required: true }, // Writes a value for the pop-up, e.g. "€6.85" or "19 wears"
})

const colors = chartColors()

// The month names along the bottom, one value per month,
// and a dot only on the newest month (pointRadius 4 for the last one, 0 for the rest)
const data = computed(() => ({
    labels: props.points.map((point) => point.label),
    datasets: [
        {
            data: props.points.map((point) => point.value),
            borderColor: colors.chart[0],
            borderWidth: 2,
            pointBackgroundColor: colors.chart[0],
            pointRadius: props.points.map((point, index) => (index === props.points.length - 1 ? 4 : 0)),
        },
    ],
}))

const options = {
    maintainAspectRatio: false, // Use the height of the box around the chart (.line-box)
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (point) => props.formatValue(point.raw) } },
    },
    scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text } },
        // No numbers on the left, just 3 gray guide lines like in the Figma
        y: { grid: { color: colors.grid }, border: { display: false }, ticks: { display: false, maxTicksLimit: 3 } },
    },
}
</script>

<template>
    <ChartCard :title="title" :caption="caption">
        <div v-if="points.length" class="line-box">
            <Line :data="data" :options="options" />
        </div>
    </ChartCard>
</template>

<style scoped>
/* The chart takes the height of this box. Chart.js needs position: relative on it */
.line-box {
    position: relative;
    height: 150px;
}
</style>
