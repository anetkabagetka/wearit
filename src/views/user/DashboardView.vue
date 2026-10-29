<script setup>
import { computed, ref } from 'vue'

import Navigation from '@/components/Navigation.vue'
import CpwCard from '@/components/CpwCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemRow from '@/components/ItemRow.vue'
import AppDialog from '@/components/AppDialog.vue'

import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { costPerWear } from '@/utils/costPerWear'
import { toJsDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/formatMoney'
import { formatWears } from '@/utils/formatWears'
import { categoryOptions } from '@/utils/itemOptions'

import shirtIcon from '@/assets/icons/shirt.svg'
import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'
import closeIcon from '@/assets/icons/close.svg'
import checkIcon from '@/assets/icons/check.svg'
import bellIcon from '@/assets/icons/bell.svg'
import leafIcon from '@/assets/icons/leaf.svg'

// Take the profile and userEmail from the useAuth composable
const { profile, userEmail } = useAuth()

const {
    items,
    currency,
    goal,
    isLoading,
    errorMessage,
    wearItem,
    totalSpent,
    totalWears,
    addedThisMonth,
    wearsThisMonth,
    wearsLastMonth,
    notWornLately,
    recentlyWorn,
    recentlyAdded,
    mostWorn,
    leastWorn,
} = useDashboard()

// Username, or the part of the email before "@" if there is no username
const displayName = computed(() => profile.value?.username || userEmail.value.split("@")[0])

// e.g. "€4,280 spent ÷ 625 wears across your wardrobe"
const averageFormula = computed(() => {
    const spent = formatMoney(totalSpent.value, currency.value, { wholeNumbers: true })
    return `${spent} spent ÷ ${totalWears.value} wears across your wardrobe`
})

// e.g. "+12% vs September" or "-20% vs September". Last month's name comes from a date one month back
const monthCompareText = computed(() => {
    const lastMonth = new Date()
    lastMonth.setDate(1)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const monthName = lastMonth.toLocaleString('en-GB', { month: 'long' })

    // Can't compare with 0 (dividing by 0), so just say nothing was logged
    if (wearsLastMonth.value === 0) {
        return `Nothing logged in ${monthName}`
    }
    const percent = Math.round(((wearsThisMonth.value - wearsLastMonth.value) / wearsLastMonth.value) * 100)
    return `${percent >= 0 ? '+' : ''}${percent}% vs ${monthName}`
})

// "Log a wear" pop-up: open or not, the search text, the chosen chip, and the item that was just logged
const isLogOpen = ref(false)
const logSearch = ref('')
const logCategory = ref('recent') // "recent" shows everything, or a category like "Tops"
const loggedItem = ref(null)
const cpwBefore = ref(0) // The logged item's cost per wear before this wear, for "was €4.20"

// The category chips in the pop-up: only categories that are in the wardrobe, in the usual order
const logCategories = computed(() =>
    categoryOptions.filter((category) => items.value.some((item) => item.category === category)),
)

// Items in the pop-up that match its search and chip, the most recently worn first.
// Never worn items count as worn in 1970 (date 0), so they go last
const logList = computed(() => {
    const text = logSearch.value.toLowerCase()
    return items.value
        .filter((item) => item.name.toLowerCase().includes(text))
        .filter((item) => logCategory.value === 'recent' || item.category === logCategory.value)
        .sort((a, b) => toJsDate(b.lastWornAt ?? 0) - toJsDate(a.lastWornAt ?? 0))
})

// Opens the pop-up fresh: empty search, "Recent" chip, back to the list. "Log another wear" uses it too
const openLogWear = () => {
    logSearch.value = ''
    logCategory.value = 'recent'
    loggedItem.value = null
    isLogOpen.value = true
}

// Logs the wear, then shows "Wear logged" with the new cost per wear
const logWear = async (item) => {
    cpwBefore.value = costPerWear(item.price, item.timesWorn)
    if (await wearItem(item)) {
        loggedItem.value = item
    }
}

// e.g. "€126 ÷ 31 wears · was €4.20"
const loggedFormula = computed(() => {
    const item = loggedItem.value
    const price = formatMoney(item.price, currency.value, { wholeNumbers: true })
    return `${price} ÷ ${formatWears(item.timesWorn)} · was ${formatMoney(cpwBefore.value, currency.value)}`
})
</script>

<template>
    <Navigation />
    <main class="container dashboard-page stack">
        <div class="top-bar">
            <h1 class="dashboard-title">Hi, {{ displayName }}</h1>
            <RouterLink :to="{ name: 'wardrobe' }" class="icon-link" aria-label="Search your wardrobe">
                <img :src="searchIcon" alt="" width="24" height="24" />
            </RouterLink>
            <RouterLink :to="{ name: 'settings-notifications' }" class="icon-link" aria-label="Notifications">
                <img :src="bellIcon" alt="" width="24" height="24" />
            </RouterLink>
        </div>

        <p v-if="errorMessage && !isLogOpen" class="form-error" role="alert">{{ errorMessage }}</p>

        <p v-if="isLoading">Loading your wardrobe...</p>

        <!-- A brand new wardrobe: nothing to count yet -->
        <div v-else-if="items.length === 0" class="stack-small">
            <p>Your wardrobe is empty.</p>
            <RouterLink :to="{ name: 'add-item' }" class="btn btn-primary add-first">Add your first item</RouterLink>
        </div>

        <!-- Two columns on wide screens, one column on phones -->
        <div v-else class="dashboard-columns">
            <!-- Left column: average cost per wear, buttons, recently worn and recently added -->
            <div class="stack">
                <CpwCard label="Average cost per wear" :price="totalSpent" :times-worn="totalWears" :currency="currency"
                    :goal="goal" :formula="averageFormula" inverse />

                <div class="dashboard-buttons">
                    <button type="button" class="btn btn-primary icon-button" @click="openLogWear">
                        <img :src="shirtIcon" alt="" width="20" height="20" class="white-icon" />
                        Log a wear
                    </button>
                    <RouterLink :to="{ name: 'add-item' }" class="btn btn-secondary icon-button">
                        <img :src="plusIcon" alt="" width="20" height="20" />
                        Add item
                    </RouterLink>
                </div>

                <section v-if="recentlyWorn.length">
                    <div class="section-header">
                        <h2 class="title-m">Recently worn</h2>
                        <RouterLink :to="{ name: 'wardrobe' }" class="see-all">See all</RouterLink>
                    </div>
                    <ItemRow v-for="item in recentlyWorn" :key="item.id" :item="item" :currency="currency" />
                </section>

                <section v-if="recentlyAdded.length" class="stack-small">
                    <div class="section-header">
                        <h2 class="title-m">Recently added</h2>
                        <RouterLink :to="{ name: 'wardrobe' }" class="see-all">See all</RouterLink>
                    </div>
                    <ul class="added-grid">
                        <li v-for="item in recentlyAdded" :key="item.id">
                            <ItemCard :item="item" :currency="currency" />
                        </li>
                    </ul>
                </section>
            </div>

            <!-- Right column: numbers, most worn and least worn -->
            <div class="stack">
                <div class="stats">
                    <div class="stat-card">
                        <span class="field-label">Total items</span>
                        <strong class="stat-value">{{ items.length }}</strong>
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

                <section>
                    <h2 class="title-m">Most worn</h2>
                    <ItemRow v-for="item in mostWorn" :key="item.id" :item="item" :currency="currency" />
                </section>

                <section>
                    <h2 class="title-m">Least worn</h2>
                    <ItemRow v-for="item in leastWorn" :key="item.id" :item="item" :currency="currency" />
                </section>

                <!-- A nudge to wear the least worn items, or let them go -->
                <div class="tip-box stack-small">
                    <h2 class="tip-title">
                        <img :src="leafIcon" alt="" width="20" height="20" />
                        Wear them or sell them!
                    </h2>
                    <p class="notes">These are worn the least, so every wear lowers their cost per wear the most.</p>
                    <div class="tip-buttons">
                        <button type="button" class="btn btn-primary" @click="openLogWear">Log a wear</button>
                        <!-- "Mark as sold or donated" is on the item page, so this opens the least worn item -->
                        <RouterLink :to="{ name: 'item', params: { itemId: leastWorn[0].id } }" class="btn btn-secondary">
                            Sell or donate
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- Log a wear: pick an item from the list, then see its new cost per wear -->
        <AppDialog v-model="isLogOpen">
            <div class="stack">
                <div class="section-header">
                    <h2 class="title-m">{{ loggedItem ? 'Wear logged' : 'Log a wear' }}</h2>
                    <button type="button" class="back-button" aria-label="Close" @click="isLogOpen = false">
                        <img :src="closeIcon" alt="" />
                    </button>
                </div>

                <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

                <!-- After logging: the item and its new cost per wear -->
                <template v-if="loggedItem">
                    <div class="logged-item">
                        <span class="logged-check">
                            <img :src="checkIcon" alt="" width="20" height="20" class="white-icon" />
                        </span>
                        <span class="stack-small">
                            <span class="logged-name">{{ loggedItem.name }}</span>
                            <span class="caption">Worn today · wear #{{ loggedItem.timesWorn }}</span>
                        </span>
                    </div>

                    <CpwCard label="New cost per wear" :price="loggedItem.price" :times-worn="loggedItem.timesWorn"
                        :currency="currency" :goal="goal" :formula="loggedFormula" />

                    <div class="stack-small">
                        <button type="button" class="btn btn-primary" @click="isLogOpen = false">Done</button>
                        <button type="button" class="btn btn-secondary" @click="openLogWear">Log another wear</button>
                    </div>
                </template>

                <!-- Before logging: search and the list of items -->
                <template v-else>
                    <label class="input-icon search">
                        <img :src="searchIcon" alt="" width="20" height="20" />
                        <input v-model="logSearch" type="text" placeholder="Search item to log..."
                            aria-label="Search item to log" />
                    </label>

                    <!-- Same chips as the role filter on the admin page: a hidden radio inside each label -->
                    <div class="chips">
                        <label class="chip">
                            <input v-model="logCategory" type="radio" name="log-category" value="recent" />
                            Recent
                        </label>
                        <label v-for="category in logCategories" :key="category" class="chip">
                            <input v-model="logCategory" type="radio" name="log-category" :value="category" />
                            {{ category }}
                        </label>
                    </div>

                    <ul class="log-list">
                        <li v-for="item in logList" :key="item.id" class="log-row">
                            <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="log-row-photo" />
                            <!-- Gray box when the item has no photo -->
                            <div v-else class="log-row-photo"></div>
                            <span class="log-row-text">
                                <span class="logged-name">{{ item.name }}</span>
                                <span class="caption">
                                    {{ formatMoney(costPerWear(item.price, item.timesWorn), currency) }} per wear ·
                                    {{ formatWears(item.timesWorn) }}
                                </span>
                            </span>
                            <button type="button" class="btn btn-secondary" @click="logWear(item)">Log wear</button>
                        </li>
                    </ul>
                    <p v-if="logList.length === 0" class="caption">No items match.</p>
                </template>
            </div>
        </AppDialog>
    </main>
</template>

<style scoped>
.dashboard-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

/* The greeting takes the free space, so the two icons sit on the right */
.dashboard-title {
    flex: 1;
    font-size: 24px;
    letter-spacing: 0.5px;
}

.icon-link {
    display: flex;
    padding: 8px;
}

.add-first {
    align-self: flex-start;
}

/* Wide left column, narrow right column, like the Figma. One column on phones */
.dashboard-columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
}

@media (min-width: 1024px) {
    .dashboard-columns {
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        align-items: start;
    }
}

/* "Log a wear" and "Add item" side by side, both the same width */
.dashboard-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

/* Icon and text side by side, in the middle of the button */
.icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.white-icon {
    filter: var(--icon-on-black-filter);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.see-all {
    color: var(--gray);
    font-size: 13px;
    font-weight: 500;
}

/* 2 cards per row on phones, 5 on bigger screens */
.added-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

@media (min-width: 768px) {
    .added-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

/* The black circle with a check mark in "Wear logged" */
.logged-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logged-check {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--black);
}

.logged-name {
    font-family: var(--font-title);
    font-size: 15px;
    color: var(--black);
}

.log-list {
    list-style: none;
}

/* Like ListRow: one row per item with a gray line under it */
.log-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--light-gray);
}

.log-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* Small photo at the start of each row in the pop-up */
.log-row-photo {
    flex-shrink: 0;
    width: 40px;
    height: 48px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

/* The gray "Wear them or sell them!" box */
.tip-box {
    padding: 16px;
    border-radius: 8px;
    background-color: var(--subtle-gray);
}

.tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}

.tip-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>