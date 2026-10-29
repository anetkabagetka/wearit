<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import Navigation from '@/components/Navigation.vue'
import CpwCard from '@/components/CpwCard.vue'
import ListRow from '@/components/ListRow.vue'
import AppDialog from '@/components/AppDialog.vue'
import RemoveItemDialog from '@/components/RemoveItemDialog.vue'

import { useItemDetail } from '@/composables/useItemDetail'
import { useDropdown } from '@/composables/useDropdown'
import { costPerWear } from '@/utils/costPerWear'
import { formatDate, toJsDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/formatMoney'
import { removeOptions } from '@/utils/itemOptions'
import { wornToday } from '@/utils/wornToday'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import editIcon from '@/assets/icons/edit.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import trashIcon from '@/assets/icons/trash.svg'
import tagIcon from '@/assets/icons/tag.svg'
import moreIcon from '@/assets/icons/more.svg'

// The item's ID comes from the address, e.g. /item/abc123 → "abc123"
const route = useRoute()

const { item, currency, goal, isLoading, isNotFound, isSaving, errorMessage, logWear, remove, markRemoved } =
    useItemDetail(route.params.itemId)

// true while the "Delete item?" pop-up is open
const isDeleteOpen = ref(false)

// Closes the pop-up first, so an error message on the page isn't hidden behind it
const confirmDelete = () => {
    isDeleteOpen.value = false
    remove()
}

// "Remove from wardrobe" pop-up (RemoveItemDialog). Confirm in it sends the reason and sale price here
const isRemoveOpen = ref(false)

const handleRemove = (reason, salePrice) => {
    isRemoveOpen.value = false
    markRemoved(reason, salePrice)
}

// "Log a wear" works once a day. When today's wear is already logged, a pop-up says so instead
const isWornTodayOpen = ref(false)

const handleLogWear = () => {
    if (wornToday(item.value)) {
        isWornTodayOpen.value = true
        return
    }
    logWear()
}

// e.g. "COS · Outerwear · Black · Autumn". filter(Boolean) skips the empty ones
const metaText = computed(() =>
    [item.value.brand, item.value.category, item.value.color, item.value.season].filter(Boolean).join(' · '),
)

// e.g. "Your next wear lowers it to €4.06"
const nextWearText = computed(() => {
    const next = formatMoney(costPerWear(item.value.price, item.value.timesWorn + 1), currency.value)
    if (!item.value.timesWorn) {
        return `Your first wear sets it to ${next}`
    }
    return `Your next wear lowers it to ${next}`
})

// "Today", a date like "23 Sep 2026", or "–" when no wear was logged yet
const lastWornText = computed(() => {
    if (!item.value.lastWornAt) {
        return '-'
    }
    const date = formatDate(item.value.lastWornAt)
    return date === formatDate(new Date()) ? 'Today' : date
})

// Wears in the last 3 months ÷ 3, e.g. 13 wears = "4.3".
// Only wears logged with "Log a wear" have a date, so only those count
const wornPerMonth = computed(() => {
    const threeMonthsAgo = Date.now() - 90 * 86400000 // 90 days, 86400000 ms = 1 day
    const recentWears = (item.value.wornDates ?? []).filter((date) => toJsDate(date).getTime() > threeMonthsAgo)
    return (recentWears.length / 3).toFixed(1)
})

// Logged wears, newest first, e.g. { number: 30, date: "Wed, 23 Sept 2026", cpw: "€4.20" }.
// The newest wear is wear number timesWorn, the one before it timesWorn - 1, and so on
const wearHistory = computed(() => {
    // [...list] makes a copy, so reverse() doesn't flip the item's own list
    const newestFirst = [...(item.value.wornDates ?? [])].reverse()

    return newestFirst.map((date, index) => {
        const number = item.value.timesWorn - index
        return {
            number,
            date: formatDate(date, { weekday: true }),
            cpw: formatMoney(costPerWear(item.value.price, number), currency.value),
        }
    })
})

// The 5 newest wears, or all of them after clicking "See all"
const showAllWears = ref(false)
const visibleWears = computed(() => (showAllWears.value ? wearHistory.value : wearHistory.value.slice(0, 5)))
// The "… icon" menu in the top bar
const { openMenu, toggleMenu, closeMenu } = useDropdown()
// e.g. "Sold for €40", "Donated" or "Gave away". Empty while the item is still in the wardrobe
const removedText = computed(() => {
    if (!item.value.removedAs) {
        return ''
    }
    const label = removeOptions.find((option) => option.value === item.value.removedAs).label
    if (item.value.salePrice) {
        return `${label} for ${formatMoney(item.value.salePrice, currency.value, { wholeNumbers: true })}`
    }
    return label
})
</script>

<template>
    <Navigation />
    <main class="container item-page stack">
        <div class="top-bar">
            <RouterLink :to="{ name: 'wardrobe' }" class="back-button" aria-label="Back to wardrobe">
                <img :src="chevronLeftIcon" alt="" />
            </RouterLink>
            <h1 class="title-m page-title">{{ item?.name || 'Item' }}</h1>

            <!-- Pencil and "…" on the right, once the item has loaded -->
            <template v-if="item">
                <RouterLink :to="{ name: 'edit-item', params: { itemId: item.id } }" class="back-button"
                    aria-label="Edit item">
                    <img :src="editIcon" alt="" />
                </RouterLink>

                <!-- Same small menu as the profile menu in the navigation.
                     .stop keeps the click from reaching the page, which would close the menu again -->
                <div class="menu-wrapper" @click.stop @keydown.esc="closeMenu">
                    <button type="button" class="back-button" aria-label="More actions" aria-haspopup="menu"
                        :aria-expanded="openMenu === 'item'" @click="toggleMenu('item')">
                        <img :src="moreIcon" alt="" />
                    </button>

                    <div v-if="openMenu === 'item'" class="menu" role="menu">
                        <button v-if="!item.removedAs" type="button" role="menuitem"
                            @click="closeMenu(); isRemoveOpen = true">
                            Mark as sold or donated
                        </button>
                        <button type="button" role="menuitem" class="menu-danger"
                            @click="closeMenu(); isDeleteOpen = true">
                            Delete item
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <p v-if="isLoading">Loading...</p>

        <p v-else-if="isNotFound">This item doesn't exist anymore.</p>

        <!-- Two columns on wide screens, one column on phones -->
        <div v-else-if="item" class="split split-top">
            <!-- Left column: photo and notes -->
            <div class="stack">
                <img v-if="item.photoUrl" :src="item.photoUrl" :alt="item.name" class="item-photo" />
                <!-- Gray box when the item has no photo -->
                <div v-else class="item-photo"></div>
                <section class="stack-small">
                    <div class="section-header">
                        <h2 class="title-m">Wear history</h2>
                        <button v-if="wearHistory.length > 5 && !showAllWears" type="button" class="see-all"
                            @click="showAllWears = true">
                            See all {{ wearHistory.length }}
                        </button>
                    </div>

                    <p v-if="wearHistory.length === 0" class="caption">
                        No wears logged yet. Every time you click "Log a wear", the date shows up here.
                    </p>

                    <ul v-else class="wear-list">
                        <li v-for="wear in visibleWears" :key="wear.number" class="wear-row">
                            <span>{{ wear.date }}</span>
                            <span class="wear-row-value">Wear #{{ wear.number }} · {{ wear.cpw }}</span>
                        </li>
                    </ul>
                </section>

                <section v-if="item.notes" class="stack-small">
                    <h2 class="title-m">Notes & condition</h2>
                    <p class="notes">{{ item.notes }}</p>
                </section>
            </div>

            <!-- Right column: name, cost per wear, log a wear, metrics, manage -->
            <div class="stack">
                <div class="stack-small">
                    <h2 class="item-name">{{ item.name }}</h2>
                    <p class="caption">{{ metaText }}</p>
                    <div v-if="item.tags?.length || removedText" class="chips">
                        <!-- Black chip on sold, donated or given away items -->
                        <span v-if="removedText" class="chip chip-selected">{{ removedText }}</span>
                        <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
                    </div>
                </div>

                <CpwCard :price="item.price" :times-worn="item.timesWorn" :currency="currency" :goal="goal" inverse />

                <!-- Only items still in the wardrobe can be worn -->
                <div v-if="!item.removedAs" class="stack-small">
                    <button type="button" class="btn btn-primary width-full log-button" :disabled="isSaving"
                        @click="handleLogWear">
                        <img :src="shirtIcon" alt="" width="20" height="20" />
                        Log a wear
                    </button>
                    <p class="caption log-hint">{{ nextWearText }}</p>
                </div>

                <section class="stack-small">
                    <h2 class="title-m">Key metrics</h2>
                    <div class="stats">
                        <div class="stat-card">
                            <span class="field-label">Purchase price</span>
                            <strong class="stat-value">{{ formatMoney(item.price, currency, { wholeNumbers: true })
                            }}</strong>
                            <span class="caption">
                                {{ item.purchaseDate ? `Bought ${formatDate(item.purchaseDate)}` : 'No purchase date' }}
                            </span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Total wears</span>
                            <strong class="stat-value">{{ item.timesWorn }}</strong>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Last worn</span>
                            <strong class="stat-value">{{ lastWornText }}</strong>
                            <span v-if="item.lastWornAt" class="caption">Wear #{{ item.timesWorn }}</span>
                        </div>
                        <div class="stat-card">
                            <span class="field-label">Worn per month</span>
                            <strong class="stat-value">{{ wornPerMonth }}</strong>
                            <span class="caption">Last 3 months</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="title-m">Manage</h2>
                    <ListRow :icon="editIcon" label="Edit item"
                        :to="{ name: 'edit-item', params: { itemId: item.id } }" />
                    <ListRow v-if="!item.removedAs" :icon="tagIcon" label="Mark as sold or donated"
                        @click="isRemoveOpen = true" />
                    <ListRow :icon="trashIcon" label="Delete item" @click="isDeleteOpen = true" />
                </section>

                <AppDialog v-model="isDeleteOpen">
                    <div class="stack">
                        <h2 class="title-m">Delete {{ item.name }}?</h2>
                        <p class="notes">All logged wears and cost per wear history will be removed. This can't be
                            undone.</p>
                        <div class="stack-small">
                            <button type="button" class="btn btn-primary" :disabled="isSaving" @click="confirmDelete">
                                Delete item
                            </button>
                            <!-- autofocus: Cancel is selected when the pop-up opens, so pressing Enter can't delete by accident -->
                            <button type="button" class="btn btn-secondary" autofocus @click="isDeleteOpen = false">
                                Cancel
                            </button>
                        </div>
                    </div>
                </AppDialog>

                <RemoveItemDialog v-model="isRemoveOpen" :item="item" :currency="currency" :is-saving="isSaving"
                    @confirm="handleRemove" />

                <AppDialog v-model="isWornTodayOpen">
                    <div class="stack">
                        <h2 class="title-m">Already logged today</h2>
                        <p class="notes">You already logged a wear of {{ item.name }} today. You can log the next one
                            tomorrow.</p>
                        <button type="button" class="btn btn-primary" autofocus @click="isWornTodayOpen = false">
                            OK
                        </button>
                    </div>
                </AppDialog>
            </div>
        </div>
    </main>
</template>

<style scoped>
.item-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

.page-title {
    flex: 1;
}

.item-photo {
    width: 100%;
    aspect-ratio: 9 / 8;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

.item-name {
    font-size: 24px;
    letter-spacing: 0.5px;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}

/* Icon and text side by side, in the middle of the button */
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

/* A button that looks like a small gray link */
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

/* Like ListRow: one row per wear with a gray line under it */
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
</style>