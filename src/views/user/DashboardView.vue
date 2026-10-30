<script setup>
import { computed, ref } from 'vue'

import Navigation from '@/components/layout/Navigation.vue'
import CpwCard from '@/components/ui/CpwCard.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import ItemRow from '@/components/items/ItemRow.vue'
import OutfitRow from '@/components/outfits/OutfitRow.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import WearOrSellTip from '@/components/dashboard/WearOrSellTip.vue'
import LogWearDialog from '@/components/dashboard/LogWearDialog.vue'
import SellOrDonateDialog from '@/components/dashboard/SellOrDonateDialog.vue'

import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { formatMoney } from '@/utils/format/formatMoney'

import shirtIcon from '@/assets/icons/shirt.svg'
import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'
import bellIcon from '@/assets/icons/bell.svg'

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

// "Log a wear" pop-up (LogWearDialog). leastOnly is true when it's opened from "Wear them or sell them":
// then it only lists the 3 least worn items
const isLogOpen = ref(false)
const logLeastOnly = ref(false)

const openLogWear = (leastOnly) => {
    logLeastOnly.value = leastOnly
    isLogOpen.value = true
}

// "Sell or donate" in "Wear them or sell them" (SellOrDonateDialog)
const isSellOpen = ref(false)
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

        <!-- While "Log a wear" is open, the message shows inside it instead -->
        <p v-if="errorMessage && !isLogOpen" class="form-error" role="alert">{{ errorMessage }}</p>

        <LoadingSkeleton v-if="isLoading" variant="rows" />

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
                <DashboardStats :item-count="items.length" :added-this-month="addedThisMonth" :total-spent="totalSpent"
                    :currency="currency" :wears-this-month="wearsThisMonth" :wears-last-month="wearsLastMonth"
                    :not-worn-lately="notWornLately" />

                <section>
                    <h2 class="title-m">Most worn</h2>
                    <ItemRow v-for="item in mostWorn" :key="item.id" :item="item" :currency="currency" />
                </section>

                <section>
                    <h2 class="title-m">Least worn</h2>
                    <ItemRow v-for="item in leastWorn" :key="item.id" :item="item" :currency="currency" />
                </section>

                <WearOrSellTip @log-wear="openLogWear(true)" @sell="isSellOpen = true" />
            </div>
        </div>

        <LogWearDialog v-model="isLogOpen" :items="items" :outfits="outfitsWithItems" :least-worn="leastWorn"
            :least-only="logLeastOnly" :currency="currency" :goal="goal" :error-message="errorMessage"
            :wear-item="wearItem" :wear-outfit="wearOutfit" />

        <SellOrDonateDialog v-model="isSellOpen" :least-worn="leastWorn" :currency="currency"
            :remove-item="removeItem" />
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
</style>
