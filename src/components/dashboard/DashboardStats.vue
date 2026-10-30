<script setup>
import { computed } from 'vue'

import { formatMoney } from '@/utils/format/formatMoney'

// The four number cards on Home: total items, wardrobe value, wears this month, not worn in 90 days
const props = defineProps({
    itemCount: { type: Number, required: true },
    addedThisMonth: { type: Number, required: true },
    totalSpent: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    wearsThisMonth: { type: Number, required: true },
    wearsLastMonth: { type: Number, required: true },
    notWornLately: { type: Number, required: true },
})

// e.g. "+12% vs September" or "-20% vs September". Last month's name comes from a date one month back
const monthCompareText = computed(() => {
    const lastMonth = new Date()
    lastMonth.setDate(1)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const monthName = lastMonth.toLocaleString('en-GB', { month: 'long' })

    // Can't compare with 0 (dividing by 0), so just say nothing was logged
    if (props.wearsLastMonth === 0) {
        return `Nothing logged in ${monthName}`
    }
    const percent = Math.round(((props.wearsThisMonth - props.wearsLastMonth) / props.wearsLastMonth) * 100)
    return `${percent >= 0 ? '+' : ''}${percent}% vs ${monthName}`
})
</script>

<template>
    <div class="stats">
        <div class="stat-card">
            <span class="field-label">Total items</span>
            <strong class="stat-value">{{ itemCount }}</strong>
            <span class="caption">+{{ addedThisMonth }} this month</span>
        </div>
        <div class="stat-card">
            <span class="field-label">Wardrobe value</span>
            <strong class="stat-value">{{ formatMoney(totalSpent, currency, { wholeNumbers: true }) }}</strong>
            <span class="caption">Total purchase price</span>
        </div>
        <div class="stat-card">
            <span class="field-label">Wears this month</span>
            <strong class="stat-value">{{ wearsThisMonth }}</strong>
            <span class="caption">{{ monthCompareText }}</span>
        </div>
        <div class="stat-card">
            <span class="field-label">Not worn in 90 days</span>
            <strong class="stat-value">{{ notWornLately }}</strong>
            <span class="caption">Wear them or sell them</span>
        </div>
    </div>
</template>
