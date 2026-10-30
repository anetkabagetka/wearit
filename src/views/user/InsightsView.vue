<script setup>
import { computed } from 'vue'

import Navigation from '@/components/layout/Navigation.vue'
import ItemRow from '@/components/items/ItemRow.vue'
import OutfitRow from '@/components/outfits/OutfitRow.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import LineChartCard from '@/components/insights/LineChartCard.vue'
import CategoryDonut from '@/components/insights/CategoryDonut.vue'
import BrandBars from '@/components/insights/BrandBars.vue'
import WearHeatmap from '@/components/insights/WearHeatmap.vue'

import { periodOptions, useInsights } from '@/composables/useInsights'
import { wearsWord } from '@/utils/charts'
import { formatMoney } from '@/utils/format/formatMoney'

const {
    items,
    currency,
    isLoading,
    errorMessage,
    period,
    periodText,
    periodItems,
    totalSpent,
    totalWears,
    averageCpw,
    cpwChange,
    highestCpw,
    lowestCpw,
    mostWornOutfits,
    categoryCount,
    categories,
    brandSpend,
    cpwTrend,
    wearsPerMonth,
    wearWeeks,
} = useInsights()

// "124 items this year"
const itemsText = computed(() => {
    const count = periodItems.value.length
    return `${count} ${count === 1 ? 'item' : 'items'} ${periodText.value}`
})

// "↓ €0.42 vs last month". Down is good: each wear costs less
const cpwChangeText = computed(() => {
    if (cpwChange.value === null) {
        return wearsWord(totalWears.value)
    }
    if (Math.abs(cpwChange.value) < 0.005) {
        return 'Same as last month'
    }
    const arrow = cpwChange.value < 0 ? '↓' : '↑'
    return `${arrow} ${formatMoney(Math.abs(cpwChange.value), currency.value)} vs last month`
})

// "Last 6 months · down from €8.10 to €6.85"
const trendText = computed(() => {
    const points = cpwTrend.value
    if (points.length < 2) {
        return 'Last 6 months'
    }
    const from = formatMoney(points[0].value, currency.value)
    const to = formatMoney(points.at(-1).value, currency.value)
    if (from === to) {
        return `Last 6 months · steady at ${to}`
    }
    return `Last 6 months · ${points.at(-1).value < points[0].value ? 'down' : 'up'} from ${from} to ${to}`
})

// "124 items across 4 categories"
const categoryText = computed(() => {
    const count = periodItems.value.length
    const kinds = categoryCount.value
    return `${count} ${count === 1 ? 'item' : 'items'} across ${kinds} ${kinds === 1 ? 'category' : 'categories'}`
})

// "This year · top 5 brands"
const brandText = computed(() => {
    const count = brandSpend.value.length
    const when = periodText.value[0].toUpperCase() + periodText.value.slice(1)
    return `${when} · top ${count} ${count === 1 ? 'brand' : 'brands'}`
})

// "14 wears in October · best month yet"
const wearsText = computed(() => {
    const thisMonth = wearsPerMonth.value.at(-1)
    const best = Math.max(...wearsPerMonth.value.map((month) => month.value))
    const text = `${wearsWord(thisMonth.value)} in ${thisMonth.longName}`
    return thisMonth.value > 0 && thisMonth.value === best ? `${text} · best month yet` : text
})

// How the line charts write a value when you point at it
const formatCpw = (value) => formatMoney(value, currency.value)
</script>

<template>
    <Navigation />
    <main class="container insights-page stack">
        <h1 class="insights-title">Insights</h1>

        <!-- The same chips as the role filter on the admin page: a hidden radio button in each -->
        <div class="chips">
            <label v-for="option in periodOptions" :key="option.value" class="chip">
                <input v-model="period" type="radio" name="period" :value="option.value" />{{ option.label }}
            </label>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <LoadingSkeleton v-if="isLoading" variant="rows" />

        <!-- A brand new wardrobe: nothing to count yet -->
        <div v-else-if="items.length === 0" class="stack-small">
            <p>Add a few items to see your insights.</p>
            <RouterLink :to="{ name: 'add-item' }" class="btn btn-primary add-first">Add your first item</RouterLink>
        </div>

        <!-- Two columns on wide screens, one column on phones -->
        <div v-else class="insights-columns">
            <!-- Left column: money and cost per wear -->
            <div class="insights-column">
                <section class="stack-small">
                    <h2 class="title-m">Financial summary</h2>

                    <div class="stats">
                        <div class="stat-card stat-card-inverse">
                            <span class="field-label">Total invested</span>
                            <strong class="stat-value">{{ formatMoney(totalSpent, currency, { wholeNumbers: true })
                                }}</strong>
                            <span class="caption">{{ itemsText }}</span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Average CPW</span>
                            <strong class="stat-value">{{ formatMoney(averageCpw, currency) }}</strong>
                            <span class="caption">{{ cpwChangeText }}</span>
                        </div>
                    </div>

                    <LineChartCard title="Average CPW trend" :caption="trendText" :points="cpwTrend"
                        :format-value="formatCpw" />
                </section>

                <section v-if="highestCpw.length">
                    <h2 class="title-m">Highest CPW · regrets</h2>
                    <ItemRow v-for="item in highestCpw" :key="item.id" :item="item" :currency="currency" />
                </section>

                <section v-if="lowestCpw.length">
                    <h2 class="title-m">Lowest CPW · favorites</h2>
                    <ItemRow v-for="item in lowestCpw" :key="item.id" :item="item" :currency="currency" />
                </section>

                <!-- All time, like the charts. Each row opens its outfit -->
                <section v-if="mostWornOutfits.length">
                    <h2 class="title-m">Most worn outfits</h2>
                    <OutfitRow v-for="outfit in mostWornOutfits" :key="outfit.id" :outfit="outfit"
                        :currency="currency" />
                </section>
            </div>

            <!-- Right column: what's in the wardrobe, and when it's worn -->
            <div class="insights-column">
                <section class="stack-small">
                    <h2 class="title-m">Wardrobe overview</h2>

                    <p v-if="periodItems.length === 0" class="caption">Nothing bought {{ periodText }}.</p>

                    <CategoryDonut v-if="categories.length" :categories="categories" :item-count="periodItems.length"
                        :caption="categoryText" />

                    <BrandBars v-if="brandSpend.length" :brands="brandSpend" :currency="currency" :caption="brandText" />
                </section>

                <section class="stack-small">
                    <h2 class="title-m">Wear frequency</h2>

                    <WearHeatmap :weeks="wearWeeks" />

                    <LineChartCard title="Wears per month" :caption="wearsText" :points="wearsPerMonth"
                        :format-value="wearsWord" />
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.insights-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

.insights-title {
    font-size: 24px;
    letter-spacing: 0.5px;
}

.add-first {
    align-self: flex-start;
}

/* Two columns of the same width, like the Figma. One column on phones */
.insights-columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
}

@media (min-width: 1024px) {
    .insights-columns {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: start;
    }
}

.insights-column {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

/* Total invested: the black card. In the dark theme it turns white, like the other black parts */
.stat-card-inverse {
    background-color: var(--black);
    border-color: var(--black);
}

.stat-card-inverse .field-label,
.stat-card-inverse .stat-value,
.stat-card-inverse .caption {
    color: var(--white);
}

</style>