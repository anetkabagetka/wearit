<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import Navigation from '@/components/layout/Navigation.vue'
import CpwCard from '@/components/ui/CpwCard.vue'
import ListRow from '@/components/ui/ListRow.vue'
import ItemRow from '@/components/items/ItemRow.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import OutfitCollage from '@/components/outfits/OutfitCollage.vue'
import OutfitLoggedSummary from '@/components/outfits/OutfitLoggedSummary.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

import { useOutfitDetail } from '@/composables/outfits/useOutfitDetail'
import { useDropdown } from '@/composables/useDropdown'
import { costPerWear, outfitCostPerWear } from '@/utils/wardrobe/costPerWear'
import { formatDate, toJsDate } from '@/utils/format/formatDate'
import { formatMoney } from '@/utils/format/formatMoney'
import { wornToday } from '@/utils/wardrobe/wornToday'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import editIcon from '@/assets/icons/edit.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import trashIcon from '@/assets/icons/trash.svg'
import moreIcon from '@/assets/icons/more.svg'
import closeIcon from '@/assets/icons/close.svg'

// The outfit's ID comes from the address, e.g. /outfit/abc123 → "abc123"
const route = useRoute()

const { outfit, outfitItems, missingCount, currency, isLoading, isNotFound, isSaving, errorMessage, logWear, remove } =
    useOutfitDetail(route.params.outfitId)

// What wearing the outfit costs now: its items' costs per wear added up
const outfitCpw = computed(() => outfitCostPerWear(outfitItems.value))

// e.g. "Sum of its 4 items' cost per wear"
const cpwFormula = computed(() => `Sum of its ${outfitItems.value.length} items' cost per wear`)

// e.g. "4 items · Added 3 Aug 2026"
const metaText = computed(() => {
    const count = outfitItems.value.length
    const countText = `${count} ${count === 1 ? 'item' : 'items'}`
    return outfit.value.createdAt ? `${countText} · Added ${formatDate(outfit.value.createdAt)}` : countText
})

// e.g. "Your next wear lowers it to €13.93".
// Items already worn today won't get a wear (one a day), so their cost stays the same
const nextWearText = computed(() => {
    if (outfitItems.value.every(wornToday)) {
        return 'All its items are logged today. You can log it again tomorrow.'
    }
    const next = outfitItems.value.reduce(
        (total, item) => total + costPerWear(item.price, item.timesWorn + (wornToday(item) ? 0 : 1)),
        0,
    )
    return `Your next wear lowers it to ${formatMoney(next, currency.value)}`
})

// "Today", a date like "19 Sep 2026", or "-" when it wasn't logged yet
const lastWornText = computed(() => {
    if (!outfit.value.lastWornAt) {
        return '-'
    }
    const date = formatDate(outfit.value.lastWornAt)
    return date === formatDate(new Date()) ? 'Today' : date
})

// What its items cost together, e.g. €426
const totalPrice = computed(() => outfitItems.value.reduce((total, item) => total + (item.price || 0), 0))

// How many wears an item had on the day of an outfit wear: its wears now, minus the ones on later days.
// An item is worn once a day at most, so its wear on that same day is the outfit's
const wearsOn = (item, date) => {
    const endOfDay = toJsDate(date)
    endOfDay.setHours(23, 59, 59, 999)
    const laterWears = (item.wornDates ?? []).filter((wornDate) => toJsDate(wornDate) > endOfDay)
    return item.timesWorn - laterWears.length
}

// Logged wears of the outfit, newest first, e.g. { number: 9, date: "Sat 19 Sep 2026", cpw: "€14.44" }.
// cpw is what the outfit cost to wear that day: each item's price ÷ its wears on that day, added up
const wearHistory = computed(() => {
    // [...list] makes a copy, so reverse() doesn't flip the outfit's own list
    const newestFirst = [...(outfit.value.wornDates ?? [])].reverse()

    return newestFirst.map((date, index) => {
        const cpw = outfitItems.value.reduce((total, item) => total + costPerWear(item.price, wearsOn(item, date)), 0)
        return {
            number: outfit.value.timesWorn - index,
            date: formatDate(date, { weekday: true }),
            cpw: formatMoney(cpw, currency.value),
        }
    })
})

// The 5 newest wears, or all of them after clicking "See all"
const showAllWears = ref(false)
const visibleWears = computed(() => (showAllWears.value ? wearHistory.value : wearHistory.value.slice(0, 5)))

// The "… icon" menu in the top bar
const { openMenu, toggleMenu, closeMenu } = useDropdown()

// true while the "Delete outfit?" pop-up is open
const isDeleteOpen = ref(false)

// Closes the pop-up first, so an error message on the page isn't hidden behind it
const confirmDelete = () => {
    isDeleteOpen.value = false
    remove()
}

// "Log outfit". When every item was already worn today, a pop-up says so instead.
// Otherwise it saves, then "Outfit logged" shows the new cost per wear and which items were skipped
const isWornTodayOpen = ref(false)
const isLoggedOpen = ref(false)
const cpwBefore = ref(0) // The outfit's cost per wear before this wear, for "Was €14.30"
const loggedItems = ref([]) // The items that just got a wear

const handleLogWear = async () => {
    if (outfitItems.value.every(wornToday)) {
        isWornTodayOpen.value = true
        return
    }
    cpwBefore.value = outfitCpw.value
    const logged = await logWear()
    if (logged) {
        loggedItems.value = logged
        isLoggedOpen.value = true
    }
}
</script>

<template>
    <Navigation />
    <main class="container outfit-page stack">
        <div class="top-bar">
            <RouterLink :to="{ name: 'wardrobe', query: { tab: 'outfits' } }" class="back-button"
                aria-label="Back to outfits">
                <img :src="chevronLeftIcon" alt="" />
            </RouterLink>
            <h1 class="title-m page-title">{{ outfit?.name || 'Outfit' }}</h1>

            <!-- Pencil and "…" on the right, once the outfit has loaded -->
            <template v-if="outfit">
                <RouterLink :to="{ name: 'edit-outfit', params: { outfitId: outfit.id } }" class="back-button"
                    aria-label="Edit outfit">
                    <img :src="editIcon" alt="" />
                </RouterLink>

                <!-- Same small menu as on the item page -->
                <div class="menu-wrapper" @click.stop @keydown.esc="closeMenu">
                    <button type="button" class="back-button" aria-label="More actions" aria-haspopup="menu"
                        :aria-expanded="openMenu === 'outfit'" @click="toggleMenu('outfit')">
                        <img :src="moreIcon" alt="" />
                    </button>

                    <div v-if="openMenu === 'outfit'" class="menu" role="menu">
                        <button type="button" role="menuitem" class="menu-danger"
                            @click="closeMenu(); isDeleteOpen = true">
                            Delete outfit
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <LoadingSkeleton v-if="isLoading" variant="detail" />

        <p v-else-if="isNotFound">This outfit doesn't exist anymore.</p>

        <!-- Two columns on wide screens, one column on phones, like the item page -->
        <div v-else-if="outfit" class="split split-top detail-layout">
            <!-- Left column: the photos, its items and the wear history.
                 On phones both columns become one list (see the CSS) -->
            <div class="stack detail-column">
                <OutfitCollage :items="outfitItems" :photo-url="outfit.photoUrl" class="outfit-photo" />

                <!-- Each row opens that item's page -->
                <section class="phone-order-1">
                    <h2 class="title-m">In this outfit</h2>
                    <ItemRow v-for="item in outfitItems" :key="item.id" :item="item" :currency="currency" />
                </section>

                <section class="stack-small phone-order-3">
                    <div class="section-header">
                        <h2 class="title-m">Wear history</h2>
                        <button v-if="wearHistory.length > 5 && !showAllWears" type="button" class="see-all"
                            @click="showAllWears = true">
                            See all {{ wearHistory.length }}
                        </button>
                    </div>

                    <p v-if="wearHistory.length === 0" class="caption">
                        No wears logged yet. Every time you click "Log outfit", the date shows up here.
                    </p>

                    <ul v-else class="wear-list">
                        <li v-for="wear in visibleWears" :key="wear.number" class="wear-row">
                            <span>{{ wear.date }}</span>
                            <span class="wear-row-value">Wear #{{ wear.number }} · {{ wear.cpw }}</span>
                        </li>
                    </ul>
                </section>
            </div>

            <!-- Right column: name, cost per wear, log outfit, metrics, manage -->
            <div class="stack detail-column">
                <div class="stack-small">
                    <h2 class="outfit-name">{{ outfit.name }}</h2>
                    <p class="caption">{{ metaText }}</p>
                    <div v-if="outfit.tags?.length" class="chips">
                        <span v-for="tag in outfit.tags" :key="tag" class="chip">{{ tag }}</span>
                    </div>
                </div>

                <!-- CpwCard divides the price by the wears, so the sum with 1 wear shows the sum itself -->
                <CpwCard label="Outfit cost per wear" :price="outfitCpw" :times-worn="1" :currency="currency"
                    :formula="cpwFormula" inverse />

                <!-- Only an outfit with items still in the wardrobe can be worn -->
                <div v-if="outfitItems.length" class="stack-small">
                    <button type="button" class="btn btn-primary width-full log-button" :disabled="isSaving"
                        @click="handleLogWear">
                        <img :src="shirtIcon" alt="" width="20" height="20" />
                        Log outfit
                    </button>
                    <p class="caption log-hint">{{ nextWearText }}</p>
                </div>

                <section class="stack-small phone-order-2">
                    <h2 class="title-m">Key metrics</h2>
                    <div class="stats">
                        <div class="stat-card">
                            <span class="field-label">Times worn</span>
                            <strong class="stat-value">{{ outfit.timesWorn }}</strong>
                            <span v-if="outfit.createdAt" class="caption">
                                Since {{ formatDate(outfit.createdAt) }}
                            </span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Last worn</span>
                            <strong class="stat-value">{{ lastWornText }}</strong>
                            <span v-if="outfit.lastWornAt" class="caption">Wear #{{ outfit.timesWorn }}</span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Outfit value</span>
                            <strong class="stat-value">{{ formatMoney(totalPrice, currency, { wholeNumbers: true })
                            }}</strong>
                            <span class="caption">Total purchase price</span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Items</span>
                            <strong class="stat-value">{{ outfitItems.length }}</strong>
                            <span class="caption">
                                {{ missingCount ? `${missingCount} no longer in your wardrobe` : 'All in your wardrobe'
                                }}
                            </span>
                        </div>
                    </div>
                </section>

                <section class="phone-order-2">
                    <h2 class="title-m">Manage</h2>
                    <ListRow :icon="editIcon" label="Edit outfit"
                        :to="{ name: 'edit-outfit', params: { outfitId: outfit.id } }" />
                    <ListRow :icon="trashIcon" label="Delete outfit" @click="isDeleteOpen = true" />
                </section>

                <AppDialog v-model="isDeleteOpen">
                    <div class="stack">
                        <h2 class="title-m">Delete {{ outfit.name }}?</h2>
                        <p class="notes">The outfit and its {{ outfit.timesWorn }} logged {{ outfit.timesWorn === 1 ?
                            'wear' : 'wears' }} will be removed. Your items keep their own wears.</p>
                        <div class="stack-small">
                            <button type="button" class="btn btn-primary" :disabled="isSaving" @click="confirmDelete">
                                Delete outfit
                            </button>
                            <!-- autofocus: Cancel is selected when the pop-up opens, so pressing Enter can't delete by accident -->
                            <button type="button" class="btn btn-secondary" autofocus @click="isDeleteOpen = false">
                                Cancel
                            </button>
                        </div>
                    </div>
                </AppDialog>

                <AppDialog v-model="isWornTodayOpen">
                    <div class="stack">
                        <h2 class="title-m">Already logged today</h2>
                        <p class="notes">Every item in {{ outfit.name }} is already logged today. You can log the
                            outfit again tomorrow.</p>
                        <button type="button" class="btn btn-primary" autofocus @click="isWornTodayOpen = false">
                            OK
                        </button>
                    </div>
                </AppDialog>

                <!-- Like "Wear logged" on Home: the outfit, its new cost per wear, and which items were skipped -->
                <AppDialog v-model="isLoggedOpen">
                    <div class="stack">
                        <div class="section-header">
                            <h2 class="title-m">Outfit logged</h2>
                            <button type="button" class="back-button" aria-label="Close" @click="isLoggedOpen = false">
                                <img :src="closeIcon" alt="" />
                            </button>
                        </div>

                        <!-- The same as "Outfit logged" on Home -->
                        <OutfitLoggedSummary :outfit="outfit" :items="outfitItems" :logged-items="loggedItems"
                            :cpw-before="cpwBefore" :currency="currency" />

                        <button type="button" class="btn btn-primary" @click="isLoggedOpen = false">Done</button>
                    </div>
                </AppDialog>
            </div>
        </div>
    </main>
</template>

<style scoped>
.outfit-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

.page-title {
    flex: 1;
}

.outfit-photo {
    width: 100%;
    aspect-ratio: 9 / 8;
}

.outfit-name {
    font-size: 24px;
    letter-spacing: 0.5px;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}

.log-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    img {
        filter: var(--icon-on-black-filter);
    }
}

.log-hint {
    text-align: center;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.see-all {
    padding: 0;
    border: none;
    background: none;
    color: var(--gray);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.wear-list {
    list-style: none;
}

.wear-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--light-gray);
    font-size: 15px;
}

.wear-row-value {
    color: var(--gray);
}

/* Phones: the two columns become one list (display: contents), so the order can be mixed:
   photo, name, cost per wear and "Log outfit" first (order 0), then its items (1),
   key metrics and manage (2), and the wear history last (3) */
@media (max-width: 767px) {
    .detail-layout {
        gap: 16px;
    }

    .detail-column {
        display: contents;
    }

    .phone-order-1 {
        order: 1;
    }

    .phone-order-2 {
        order: 2;
    }

    .phone-order-3 {
        order: 3;
    }
}
</style>