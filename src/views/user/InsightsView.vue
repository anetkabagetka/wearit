<script setup>
import { computed } from 'vue'
import { ArcElement, CategoryScale, Chart, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { Doughnut, Line } from 'vue-chartjs'

import Navigation from '@/components/layout/Navigation.vue'
import ItemRow from '@/components/items/ItemRow.vue'
import OutfitRow from '@/components/outfits/OutfitRow.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

import { periodOptions, useInsights } from '@/composables/useInsights'
import { formatDate } from '@/utils/format/formatDate'
import { formatMoney } from '@/utils/format/formatMoney'

// Chart.js only loads these parts: lines with points, the donut (Arc),
// the month names and values (the two Scales) and the pop-up when you point at a value (Tooltip)
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip)
Chart.defaults.font.family = 'Karla, sans-serif'

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

// The four chart gray colors, and the colours of the guide lines and month names.
// Chart.js draws on a <canvas> element, which can't use CSS variables like var(--black), so they're written out here:
// the grays on a light page, the same grays the other way round in the dark theme
const isDark = document.documentElement.dataset.theme === 'dark'
const colors = isDark
    ? { chart: ['#fff', '#a3a3a3', '#5c5c5c', '#292929'], grid: '#333', text: '#a3a3a3' }
    : { chart: ['#000', '#5c5c5c', '#a3a3a3', '#d6d6d6'], grid: '#e4e4e4', text: '#6e6e6e' }

// "1 wear" or "12 wears"
const wearsWord = (count) => `${count} ${count === 1 ? 'wear' : 'wears'}`

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

// What a line chart shows: the month names along the bottom, one value per month,
// and a dot only on the newest month (pointRadius 4 for the last one, 0 for the rest)
const lineData = (points) => ({
    labels: points.map((point) => point.label),
    datasets: [
        {
            data: points.map((point) => point.value),
            borderColor: colors.chart[0],
            borderWidth: 2,
            pointBackgroundColor: colors.chart[0],
            pointRadius: points.map((point, index) => (index === points.length - 1 ? 4 : 0)),
        },
    ],
})

// How a line chart looks. formatValue writes a value for the pop-up, e.g. "€6.85" or "19 wears"
const lineOptions = (formatValue) => ({
    maintainAspectRatio: false, // Use the height of the box around the chart (.line-box)
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (point) => formatValue(point.raw) } },
    },
    scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text } },
        // No numbers on the left, just 3 gray guide lines like in the Figma
        y: { grid: { color: colors.grid }, border: { display: false }, ticks: { display: false, maxTicksLimit: 3 } },
    },
})

const trendData = computed(() => lineData(cpwTrend.value))
const trendOptions = lineOptions((value) => formatMoney(value, currency.value))
const wearsData = computed(() => lineData(wearsPerMonth.value))
const wearsOptions = lineOptions(wearsWord)

// The donut: one piece per category, in the 4 grays. cutout is how big the hole is
const donutData = computed(() => ({
    labels: categories.value.map((category) => category.name),
    datasets: [{ data: categories.value.map((category) => category.count), backgroundColor: colors.chart, borderWidth: 0 }],
}))
const donutOptions = { maintainAspectRatio: false, cutout: '58%', plugins: { legend: { display: false } } }

// The heatmap's gray for a day: no wears is the lightest, the busiest day the darkest, the rest in between
const busiestDay = computed(() => Math.max(1, ...wearWeeks.value.flat().map((day) => day.wears)))
const heatColor = (day) => (day.wears === 0 ? colors.chart[3] : colors.chart[3 - Math.ceil((day.wears / busiestDay.value) * 3)])

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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

                    <ChartCard title="Average CPW trend" :caption="trendText">
                        <div v-if="cpwTrend.length" class="line-box">
                            <Line :data="trendData" :options="trendOptions" />
                        </div>
                    </ChartCard>
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

                    <ChartCard v-if="categories.length" title="Items by category" :caption="categoryText">
                        <div class="donut-row">
                            <div class="donut">
                                <Doughnut :data="donutData" :options="donutOptions" />
                                <span class="donut-total">{{ periodItems.length }}<br />{{ periodItems.length === 1 ?
                                    'item' : 'items' }}</span>
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

                    <ChartCard v-if="brandSpend.length" title="Spend by brand" :caption="brandText">
                        <!-- Each bar is a box as wide as its share: the biggest brand fills the row and is black, the others gray -->
                        <ul class="bars">
                            <li v-for="(brand, index) in brandSpend" :key="brand.name" class="bar-row">
                                <span class="bar-name" :title="brand.name">{{ brand.name }}</span>
                                <span class="bar-track">
                                    <span class="bar"
                                        :style="{ width: `${brand.width}%`, backgroundColor: colors.chart[index === 0 ? 0 : 1] }"></span>
                                </span>
                                <span class="caption bar-amount">{{ formatMoney(brand.amount, currency, {
                                    wholeNumbers:
                                    true }) }}</span>
                            </li>
                        </ul>
                    </ChartCard>
                </section>

                <section class="stack-small">
                    <h2 class="title-m">Wear frequency</h2>

                    <ChartCard title="When you wear clothes most" caption="Wears per weekday · last 4 weeks">
                        <!-- A grid of 7 columns: first the day names, then 4 weeks of days, one gray box each -->
                        <div class="heatmap">
                            <span v-for="weekday in weekdays" :key="weekday" class="caption heatmap-day">{{ weekday
                                }}</span>
                            <template v-for="week in wearWeeks" :key="week[0].date.getTime()">
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

                    <ChartCard title="Wears per month" :caption="wearsText">
                        <div class="line-box">
                            <Line :data="wearsData" :options="wearsOptions" />
                        </div>
                    </ChartCard>
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

/* The line charts take the height of this box. Chart.js needs position: relative on it */
.line-box {
    position: relative;
    height: 150px;
}

.swatch {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 2px;
}

/* Items by category: the donut and its legend side by side */
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

/* Spend by brand: name, bar, amount */
.bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
}

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

/* When you wear clothes most: 7 columns, one per weekday */
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
</style>