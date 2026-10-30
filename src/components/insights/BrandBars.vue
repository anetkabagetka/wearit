<script setup>
import ChartCard from '@/components/ui/ChartCard.vue'
import { chartColors } from '@/utils/charts'
import { formatMoney } from '@/utils/format/formatMoney'

// "Spend by brand" on Insights: one bar per brand, as wide as its share
defineProps({
    brands: { type: Array, required: true }, // { name, amount, width }, biggest first
    currency: { type: String, default: 'EUR' },
    caption: { type: String, default: '' },
})

const colors = chartColors()
</script>

<template>
    <ChartCard title="Spend by brand" :caption="caption">
        <!-- Each bar is a box as wide as its share: the biggest brand fills the row and is black, the others gray -->
        <ul class="bars">
            <li v-for="(brand, index) in brands" :key="brand.name" class="bar-row">
                <span class="bar-name" :title="brand.name">{{ brand.name }}</span>
                <span class="bar-track">
                    <span class="bar"
                        :style="{ width: `${brand.width}%`, backgroundColor: colors.chart[index === 0 ? 0 : 1] }"></span>
                </span>
                <span class="caption bar-amount">{{ formatMoney(brand.amount, currency, { wholeNumbers: true }) }}</span>
            </li>
        </ul>
    </ChartCard>
</template>

<style scoped>
.bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
}

/* Name, bar, amount */
.bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 0.5px;
}

/* A bit wider than the Figma's 52px, so names like "Vagabond" fit.
   Longer ones end with "..." (the full name shows when you point at it) */
.bar-name {
    flex-shrink: 0;
    width: 76px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bar-track {
    flex: 1;
}

.bar {
    display: block;
    height: 12px;
    border-radius: 2px;
}

.bar-amount {
    flex-shrink: 0;
    width: 44px;
    text-align: right;
}
</style>
