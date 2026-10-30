<script setup>
import { computed, ref } from 'vue'

import Navigation from '@/components/Navigation.vue'
import CpwCard from '@/components/CpwCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemRow from '@/components/ItemRow.vue'
import OutfitRow from '@/components/OutfitRow.vue'
import OutfitCollage from '@/components/OutfitCollage.vue'
import OutfitLoggedSummary from '@/components/OutfitLoggedSummary.vue'
import AppDialog from '@/components/AppDialog.vue'
import RemoveItemDialog from '@/components/RemoveItemDialog.vue'

import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { costPerWear, outfitCostPerWear } from '@/utils/costPerWear'
import { toJsDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/formatMoney'
import { formatWears } from '@/utils/formatWears'
import { categoryOptions, mainCategory } from '@/utils/itemOptions'
import { wornToday } from '@/utils/wornToday'

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
    wearOutfit,
    outfitsWithItems,
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
    removeItem,
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
const logCategory = ref('recent') // "recent" shows everything, "outfits" the outfits, or a category like "Tops"
const loggedItem = ref(null)
const loggedOutfitId = ref(null) // The outfit that was just logged, or null
const loggedOutfitItems = ref([]) // Its items that got a wear
const cpwBefore = ref(0) // The logged item's cost per wear before this wear, for "was €4.20"
// true when it was opened from "Wear them or sell them": then it only lists the 3 least worn items
const onlyLeastWorn = ref(false)

// The category chips in the pop-up: only categories that are in the wardrobe, in the usual order
const logCategories = computed(() =>
    categoryOptions.filter((category) => items.value.some((item) => mainCategory(item.category) === category)),
)

// Items in the pop-up that match its search and chip, the most recently worn first.
// Never worn items count as worn in 1970 (date 0), so they go last
const logList = computed(() => {
    if (onlyLeastWorn.value) {
        return leastWorn.value
    }
    const text = logSearch.value.toLowerCase()
    return items.value
        .filter((item) => item.name.toLowerCase().includes(text))
        .filter((item) => logCategory.value === 'recent' || mainCategory(item.category) === logCategory.value)
        .sort((a, b) => toJsDate(b.lastWornAt ?? 0) - toJsDate(a.lastWornAt ?? 0))
})

// Outfits under the Outfits chip that match the search, the most recently worn first.
// Outfits whose items all left the wardrobe can't be worn, so they're left out
const logOutfits = computed(() => {
    const text = logSearch.value.toLowerCase()
    return outfitsWithItems.value
        .filter((outfit) => outfit.items.length > 0 && outfit.name.toLowerCase().includes(text))
        .sort((a, b) => toJsDate(b.lastWornAt ?? 0) - toJsDate(a.lastWornAt ?? 0))
})

// The outfit that was just logged, with its items and its new numbers
const loggedOutfit = computed(() => outfitsWithItems.value.find((outfit) => outfit.id === loggedOutfitId.value))

// Opens the pop-up fresh: empty search, "Recent" chip, back to the list. "Log another wear" uses it too
// leastOnly is true for the "Log a wear" button in "Wear them or sell them"
const openLogWear = (leastOnly) => {
    onlyLeastWorn.value = leastOnly
    logSearch.value = ''
    logCategory.value = 'recent'
    loggedItem.value = null
    loggedOutfitId.value = null
    isLogOpen.value = true
}

// A small pop-up on top of "Log a wear" when the item's wear is already logged today
const wornTodayItem = ref(null)
const isWornTodayOpen = ref(false)

// Logs the wear, then shows "Wear logged" with the new cost per wear.
// "Log a wear" works once a day per item, so a second one today only opens the "Already logged" pop-up
const logWear = async (item) => {
    if (wornToday(item)) {
        wornTodayItem.value = item
        isWornTodayOpen.value = true
        return
    }
    cpwBefore.value = costPerWear(item.price, item.timesWorn)
    if (await wearItem(item)) {
        loggedItem.value = item
    }
}

// "Log wear" on an outfit: a wear for the outfit and its items, then "Outfit logged".
// When every item was already worn today, only the "Already logged" pop-up opens
const logOutfit = async (outfit) => {
    if (outfit.items.every(wornToday)) {
        wornTodayItem.value = outfit
        isWornTodayOpen.value = true
        return
    }
    cpwBefore.value = outfitCostPerWear(outfit.items)
    const logged = await wearOutfit(outfit)
    if (logged) {
        loggedOutfitItems.value = logged
        loggedOutfitId.value = outfit.id
    }
}

// e.g. "€126 ÷ 31 wears · was €4.20"
const loggedFormula = computed(() => {
    const item = loggedItem.value
    const price = formatMoney(item.price, currency.value, { wholeNumbers: true })
    return `${price} ÷ ${formatWears(item.timesWorn)} · was ${formatMoney(cpwBefore.value, currency.value)}`
})


// "Sell or donate" in "Wear them or sell them": first pick one of the 3 least worn items,
// then the same "Remove from wardrobe" pop-up as on the item page
const isPickOpen = ref(false)
const pickedId = ref('')
const itemToRemove = ref(null) // The picked item, kept here while the second pop-up is open
const isRemoveOpen = ref(false)
const isRemoving = ref(false)

// Opens the first pop-up, with the least worn item already selected
const openSellOrDonate = () => {
    pickedId.value = leastWorn.value[0].id
    isPickOpen.value = true
}

// "Next": close the first pop-up and open "Remove from wardrobe" for the picked item
const goToRemove = () => {
    itemToRemove.value = leastWorn.value.find((item) => item.id === pickedId.value)
    isPickOpen.value = false
    isRemoveOpen.value = true
}

// "Confirm" in "Remove from wardrobe": the item leaves the wardrobe and the lists on this page
const handleRemove = async (reason, salePrice) => {
    isRemoving.value = true
    if (await removeItem(itemToRemove.value, reason, salePrice)) {
        isRemoveOpen.value = false
    }
    isRemoving.value = false
}
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
                    <button type="button" class="btn btn-primary icon-button" @click="openLogWear(false)">
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
                    <!-- Items and outfits together, newest first -->
                    <template v-for="worn in recentlyWorn" :key="`${worn.kind}-${worn.id}`">
                        <OutfitRow v-if="worn.kind === 'outfit'" :outfit="worn.outfit" :currency="currency" />
                        <ItemRow v-else :item="worn.item" :currency="currency" />
                    </template>
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
                        <strong class="stat-value">{{ formatMoney(totalSpent, currency, { wholeNumbers: true })
                            }}</strong>
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
                    <!-- Both buttons only offer the 3 least worn items listed above -->
                    <div class="tip-buttons">
                        <button type="button" class="btn btn-primary" @click="openLogWear(true)">Log a wear</button>
                        <button type="button" class="btn btn-secondary" @click="openSellOrDonate">
                            Sell or donate
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Log a wear: pick an item from the list, then see its new cost per wear -->
        <AppDialog v-model="isLogOpen">
            <div class="stack">
                <div class="section-header">
                    <h2 class="title-m">{{ loggedItem ? 'Wear logged' : loggedOutfit ? 'Outfit logged' : 'Log a wear' }}
                    </h2>
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
                        <button type="button" class="btn btn-secondary" @click="openLogWear(onlyLeastWorn)">
                            Log another wear
                        </button>
                    </div>
                </template>

                <!-- After logging an outfit: its new cost per wear, and the items that were skipped -->
                <template v-else-if="loggedOutfit">
                    <OutfitLoggedSummary :outfit="loggedOutfit" :items="loggedOutfit.items"
                        :logged-items="loggedOutfitItems" :cpw-before="cpwBefore" :currency="currency" />

                    <div class="stack-small">
                        <button type="button" class="btn btn-primary" @click="isLogOpen = false">Done</button>
                        <button type="button" class="btn btn-secondary" @click="openLogWear(false)">
                            Log another wear
                        </button>
                    </div>
                </template>

                <!-- Before logging: search and the list of items -->
                <template v-else>
                    <p v-if="onlyLeastWorn" class="notes">Your 3 least worn items. Every wear lowers their cost per
                        wear the most.</p>

                    <!-- Search and chips only for the whole wardrobe -->
                    <label v-if="!onlyLeastWorn" class="input-icon search">
                        <img :src="searchIcon" alt="" width="20" height="20" />
                        <input v-model="logSearch" type="text"
                            :placeholder="logCategory === 'outfits' ? 'Search outfit to log...' : 'Search item to log...'"
                            :aria-label="logCategory === 'outfits' ? 'Search outfit to log' : 'Search item to log'" />
                    </label>

                    <div v-if="!onlyLeastWorn" class="chips">
                        <label class="chip">
                            <input v-model="logCategory" type="radio" name="log-category" value="recent" />
                            Recent
                        </label>
                        <!-- Only when there are outfits -->
                        <label v-if="outfitsWithItems.length" class="chip">
                            <input v-model="logCategory" type="radio" name="log-category" value="outfits" />
                            Outfits
                        </label>
                        <label v-for="category in logCategories" :key="category" class="chip">
                            <input v-model="logCategory" type="radio" name="log-category" :value="category" />
                            {{ category }}
                        </label>
                    </div>

                    <ul v-if="logCategory !== 'outfits'" class="log-list">
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
                    <p v-if="logCategory !== 'outfits' && logList.length === 0" class="caption">No items match.</p>

                    <!-- The Outfits chip: each outfit with its photos, like the items -->
                    <ul v-if="logCategory === 'outfits'" class="log-list">
                        <li v-for="outfit in logOutfits" :key="outfit.id" class="log-row">
                            <OutfitCollage :items="outfit.items" class="log-row-photo" />
                            <span class="log-row-text">
                                <span class="logged-name">{{ outfit.name }}</span>
                                <span class="caption">
                                    {{ formatMoney(outfitCostPerWear(outfit.items), currency) }} per wear ·
                                    {{ formatWears(outfit.timesWorn) }}
                                </span>
                            </span>
                            <button type="button" class="btn btn-secondary" @click="logOutfit(outfit)">Log wear</button>
                        </li>
                    </ul>
                    <p v-if="logCategory === 'outfits' && logOutfits.length === 0" class="caption">
                        No outfits match.
                    </p>
                </template>
            </div>
        </AppDialog>


        <!-- On top of "Log a wear": this item's wear is already logged today -->
        <AppDialog v-model="isWornTodayOpen">
            <div class="stack">
                <h2 class="title-m">Already logged today</h2>
                <!-- itemIds: it's an outfit, and every item in it was already worn today -->
                <p v-if="wornTodayItem?.itemIds" class="notes">Every item in {{ wornTodayItem.name }} is already
                    logged today. You can log the outfit again tomorrow.</p>
                <p v-else class="notes">You already logged a wear of {{ wornTodayItem?.name }} today. You can log the
                    next
                    one tomorrow.</p>
                <button type="button" class="btn btn-primary" autofocus @click="isWornTodayOpen = false">OK</button>
            </div>
        </AppDialog>

        <!-- Sell or donate, step 1: which of the 3 least worn items -->
        <AppDialog v-model="isPickOpen">
            <form class="stack" @submit.prevent="goToRemove">
                <div class="section-header">
                    <h2 class="title-m">Sell or donate</h2>
                    <button type="button" class="back-button" aria-label="Close" @click="isPickOpen = false">
                        <img :src="closeIcon" alt="" />
                    </button>
                </div>
                <p class="notes">Which of your least worn items is leaving your wardrobe?</p>

                <!-- Option rows like in "Remove from wardrobe", with the item's photo in front -->
                <fieldset class="stack-small">
                    <label v-for="item in leastWorn" :key="item.id" class="option-row">
                        <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="log-row-photo" />
                        <div v-else class="log-row-photo"></div>
                        <span class="option-row-text">
                            <span class="option-row-label">{{ item.name }}</span>
                            <span class="option-row-description">
                                {{ formatWears(item.timesWorn) }} ·
                                {{ formatMoney(costPerWear(item.price, item.timesWorn), currency) }} per wear
                            </span>
                        </span>
                        <input v-model="pickedId" type="radio" name="remove-item" :value="item.id" />
                    </label>
                </fieldset>

                <button type="submit" class="btn btn-primary">Next</button>
            </form>
        </AppDialog>

        <!-- Sell or donate, step 2: the same pop-up as "Mark as sold or donated" on the item page -->
        <RemoveItemDialog v-model="isRemoveOpen" :item="itemToRemove" :currency="currency" :is-saving="isRemoving"
            @confirm="handleRemove" />
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

/* Wide left column, narrow right column. One column on phones */
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