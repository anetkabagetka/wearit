<script setup>
import { computed } from 'vue'

import ChartCard from '@/components/ui/ChartCard.vue'
import { chartColors, wearsWord } from '@/utils/charts'
import { formatDate } from '@/utils/format/formatDate'

// "When you wear clothes most" on Insights: the last 4 weeks, one gray box per day, darker = more wears
const props = defineProps({
    weeks: { type: Array, required: true }, // 4 weeks of 7 days: { date, wears, isFuture }
})

const colors = chartColors()
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// A day's gray: no wears is the lightest, the busiest day the darkest, the rest in between
const busiestDay = computed(() => Math.max(1, ...props.weeks.flat().map((day) => day.wears)))
const heatColor = (day) => (day.wears === 0 ? colors.chart[3] : colors.chart[3 - Math.ceil((day.wears / busiestDay.value) * 3)])
</script>

<template>
    <ChartCard title="When you wear clothes most" caption="Wears per weekday · last 4 weeks">
        <!-- A grid of 7 columns: first the day names, then 4 weeks of days, one gray box each -->
        <div class="heatmap">
            <span v-for="weekday in weekdays" :key="weekday" class="caption heatmap-day">{{ weekday }}</span>
            <template v-for="week in weeks" :key="week[0].date.getTime()">
                <span v-for="day in week" :key="day.date.getTime()" class="heat-cell"
                    :class="{ 'heat-future': day.isFuture }"
                    :style="day.isFuture ? {} : { backgroundColor: heatColor(day) }"
                    :title="`${formatDate(day.date, { weekday: true })}: ${wearsWord(day.wears)}`"></span>
            </template>
        </div>
        <div class="heat-legend caption">
            Less
            <span v-for="gray in [...colors.chart].reverse()" :key="gray" class="swatch"
                :style="{ backgroundColor: gray }"></span>
            More
        </div>
    </ChartCard>
</template>

<style scoped>
/* 7 columns, one per weekday */
.heatmap {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
}

.heatmap-day {
    text-align: center;
}

.heat-cell {
    height: 28px;
    border-radius: 4px;
}

/* Days still to come this week: only an outline */
.heat-future {
    border: 1px dashed var(--light-gray);
}

.heat-legend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
}

.swatch {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 2px;
}
</style>
