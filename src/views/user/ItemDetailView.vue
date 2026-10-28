<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Navigation from '@/components/Navigation.vue'
import CpwCard from '@/components/CpwCard.vue'
import ListRow from '@/components/ListRow.vue'

import { useItemDetail } from '@/composables/useItemDetail'
import { costPerWear } from '@/utils/costPerWear'
import { formatDate } from '@/utils/formatDate'
import { formatMoney } from '@/utils/formatMoney'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import editIcon from '@/assets/icons/edit.svg'
import shirtIcon from '@/assets/icons/shirt.svg'

// The item's ID comes from the address, e.g. /item/abc123 → "abc123"
const route = useRoute()

const { item, currency, goal, isLoading, isNotFound, isSaving, errorMessage, logWear } = useItemDetail(route.params.itemId)

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
        return '–'
    }
    const date = formatDate(item.value.lastWornAt)
    return date === formatDate(new Date()) ? 'Today' : date
})

// Wears per month since buying it, e.g. 30 wears in 7 months = "4.3". Needs a purchase date
const wornPerMonth = computed(() => {
    if (!item.value.purchaseDate) {
        return '–'
    }
    const days = (Date.now() - new Date(item.value.purchaseDate)) / 86400000 // 86400000 ms = 1 day
    const months = Math.max(days / 30, 1) // min 1 month, so a brand new item doesn't show huge numbers
    return (item.value.timesWorn / months).toFixed(1)
})
</script>

<template>
    <Navigation />
    <main class="container item-page stack">
        <div class="top-bar">
            <RouterLink :to="{ name: 'wardrobe' }" class="back-button" aria-label="Back to wardrobe">
                <img :src="chevronLeftIcon" alt="" />
            </RouterLink>
            <h1 class="title-m">{{ item?.name || 'Item' }}</h1>
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
                    <div v-if="item.tags?.length" class="chips">
                        <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
                    </div>
                </div>

                <CpwCard :price="item.price" :times-worn="item.timesWorn" :currency="currency" :goal="goal" inverse />

                <div class="stack-small">
                    <button type="button" class="btn btn-primary width-full log-button" :disabled="isSaving"
                        @click="logWear">
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
                            <strong class="stat-value">{{ formatMoney(item.price, currency, { wholeNumbers: true }) }}</strong>
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
                            <span class="caption">Since you bought it</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="title-m">Manage</h2>
                    <ListRow :icon="editIcon" label="Edit item"
                        :to="{ name: 'edit-item', params: { itemId: item.id } }" />
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.item-page {
    padding-top: 24px;
    padding-bottom: 80px;
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
        filter: invert(1);
    }
}

.log-hint {
    text-align: center;
}
</style>