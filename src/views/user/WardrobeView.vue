<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import Navigation from '@/components/Navigation.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemRow from '@/components/ItemRow.vue'
import OutfitCard from '@/components/OutfitCard.vue'
import AppDialog from '@/components/AppDialog.vue'

import { useWardrobe } from '@/composables/useWardrobe'
import { formatMoney } from '@/utils/formatMoney'
import { categoryOptions, colorOptions, cpwSliderMax, seasonOptions } from '@/utils/itemOptions'

import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'
import gridIcon from '@/assets/icons/grid.svg'
import listIcon from '@/assets/icons/list.svg'
import filterIcon from '@/assets/icons/filter.svg'
import closeIcon from '@/assets/icons/close.svg'

const { items, outfits, currency, isLoading, errorMessage, search, filters, brandOptions, resetFilters, visibleItems, visibleOutfits } =
    useWardrobe()

// "items" or "outfits". It's in the address (/wardrobe?tab=outfits), so Back and saving an outfit open the right tab
const route = useRoute()
const tab = computed(() => (route.query.tab === 'outfits' ? 'outfits' : 'items'))

// "grid" or "list", changed by the view toggle
const view = ref('grid')

// true while the Filters pop-up is open
const isFiltersOpen = ref(false)

// The chip groups in the pop-up: their title, their choices, and which list in filters they fill.
// Brand is left out while no item has a brand
const filterGroups = computed(() =>
    [
        { title: 'Category', key: 'categories', options: categoryOptions },
        { title: 'Brand', key: 'brands', options: brandOptions.value },
        { title: 'Color', key: 'colors', options: colorOptions },
        { title: 'Season', key: 'seasons', options: seasonOptions },
    ].filter((group) => group.options.length > 0),
)

// true when the CPW slider isn't at "everything"
const isCpwFiltered = computed(() => filters.value.minCpw > 0 || filters.value.maxCpw < cpwSliderMax)

// How many filters are on, for the "Filters · 2" button: the CPW slider counts as one,
// plus every group that has something picked
const activeFilterCount = computed(() => {
    const pickedGroups = filterGroups.value.filter((group) => filters.value[group.key].length > 0)
    return (isCpwFiltered.value ? 1 : 0) + pickedGroups.length
})

// e.g. "Show items between €2 and €30 per wear". At the top of the slider it says "€50+"
const cpwRangeText = computed(() => {
    const { minCpw, maxCpw } = filters.value
    const min = formatMoney(minCpw, currency.value, { wholeNumbers: true })
    const max = formatMoney(maxCpw, currency.value, { wholeNumbers: true })
    return `Show items between ${min} and ${maxCpw === cpwSliderMax ? `${max}+` : max} per wear`
})
</script>

<template>
    <Navigation />
    <main class="container wardrobe-page stack">
        <div class="top-bar">
            <h1 class="wardrobe-title">Wardrobe</h1>
            <!-- + adds an item, or on the Outfits tab creates an outfit -->
            <RouterLink :to="{ name: tab === 'outfits' ? 'create-outfit' : 'add-item' }" class="icon-link"
                :aria-label="tab === 'outfits' ? 'Create outfit' : 'Add item'">
                <img :src="plusIcon" alt="" width="24" height="24" />
            </RouterLink>
        </div>

        <!-- Items | Outfits, like the Figma: the open tab has a border -->
        <nav class="wardrobe-tabs" aria-label="Wardrobe">
            <RouterLink :to="{ name: 'wardrobe' }" class="btn tab-button"
                :class="tab === 'items' ? 'btn-secondary' : 'btn-ghost'"
                :aria-current="tab === 'items' ? 'page' : 'false'">
                Items
            </RouterLink>
            <RouterLink :to="{ name: 'wardrobe', query: { tab: 'outfits' } }" class="btn tab-button"
                :class="tab === 'outfits' ? 'btn-secondary' : 'btn-ghost'"
                :aria-current="tab === 'outfits' ? 'page' : 'false'">
                Outfits
            </RouterLink>
        </nav>

        <!-- Shown above, everything, so the items stay visible if only one "wear" fails -->
        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <p v-if="isLoading">Loading your wardrobe...</p>

        <!-- The Outfits tab -->
        <template v-else-if="tab === 'outfits'">
            <div v-if="outfits.length === 0 && !errorMessage" class="stack-small">
                <p>No outfits yet.</p>
                <p class="caption">Put 2 or more items together to see what the whole outfit costs to wear.</p>
                <RouterLink :to="{ name: 'create-outfit' }" class="btn btn-primary create-first">
                    Create outfit
                </RouterLink>
            </div>

            <template v-else>
                <label class="input-icon search">
                    <img :src="searchIcon" alt="" width="20" height="20" />
                    <input v-model="search" type="text" placeholder="Search your outfits"
                        aria-label="Search your outfits" />
                </label>

                <p class="field-label">
                    {{ visibleOutfits.length }} {{ visibleOutfits.length === 1 ? 'outfit' : 'outfits' }} · sorted by
                    CPW, lowest first
                </p>

                <ul class="outfit-grid">
                    <li v-for="outfit in visibleOutfits" :key="outfit.id">
                        <OutfitCard :outfit="outfit" :currency="currency" />
                    </li>
                </ul>
            </template>
        </template>

        <!-- Nothing saved yet (and no error, because then we dont know if there are any items) -->
        <div v-else-if="items.length === 0 && !errorMessage" class="stack-small">
            <p>Your wardrobe is empty.</p>
            <p class="caption">Add your first item to start tracking its cost per wear.</p>
        </div>

        <!-- Show the search bar and the items -->
        <template v-else>
            <label class="input-icon search">
                <img :src="searchIcon" alt="" width="20" height="20" />
                <input v-model="search" type="text" placeholder="Search your wardrobe"
                    aria-label="Search your wardrobe" />
            </label>

            <!-- Opens the Filters pop-up. Turns black and shows how many filters are on, e.g. "Filters · 2" -->
            <button type="button" class="chip filter-button" :class="{ 'chip-selected': activeFilterCount > 0 }"
                @click="isFiltersOpen = true">
                Filters{{ activeFilterCount > 0 ? ` · ${activeFilterCount}` : '' }}
                <img :src="filterIcon" alt="" width="16" height="16" />
            </button>

            <div class="toolbar">
                <p class="field-label">
                    {{ visibleItems.length }} {{ visibleItems.length === 1 ? 'item' : 'items' }} · sorted by CPW, lowest
                    first
                </p>

                <!-- Grid / list switch. Same trick as .chip: the radio is hidden, the label is what you see -->
                <div class="view-toggle">
                    <label>
                        <input v-model="view" type="radio" name="view" value="grid" />
                        <img :src="gridIcon" alt="Grid view" width="18" height="18" />
                    </label>
                    <label>
                        <input v-model="view" type="radio" name="view" value="list" />
                        <img :src="listIcon" alt="List view" width="18" height="18" />
                    </label>
                </div>
            </div>

            <ul v-if="view === 'grid'" class="item-grid">
                <li v-for="item in visibleItems" :key="item.id">
                    <ItemCard :item="item" :currency="currency" />
                </li>
            </ul>
            <ul v-else class="item-list">
                <li v-for="item in visibleItems" :key="item.id">
                    <ItemRow :item="item" :currency="currency" />
                </li>
            </ul>
        </template>

        <!-- Changes show on the page right away, the button at the bottom just closes the pop-up -->
        <AppDialog v-model="isFiltersOpen">
            <div class="stack">
                <div class="toolbar">
                    <h2 class="title-m">Filters</h2>
                    <button type="button" class="back-button" aria-label="Close" @click="isFiltersOpen = false">
                        <img :src="closeIcon" alt="" />
                    </button>
                </div>

                <fieldset class="filter-group">
                    <legend>Cost per wear</legend>
                    <label class="range-field">
                        <span class="caption">From</span>
                        <input v-model.number="filters.minCpw" type="range" min="0" :max="cpwSliderMax" step="1" />
                    </label>
                    <label class="range-field">
                        <span class="caption">To</span>
                        <input v-model.number="filters.maxCpw" type="range" min="0" :max="cpwSliderMax" step="1" />
                    </label>
                    <p class="caption">{{ cpwRangeText }}</p>
                </fieldset>

                <!-- Same chips as the tags in the item form: a hidden checkbox inside each label -->
                <fieldset v-for="group in filterGroups" :key="group.key" class="filter-group">
                    <legend>{{ group.title }}</legend>
                    <div class="chips">
                        <label v-for="option in group.options" :key="option" class="chip">
                            <input v-model="filters[group.key]" type="checkbox" :value="option" />
                            {{ option }}
                        </label>
                    </div>
                </fieldset>

                <div class="filter-buttons">
                    <button type="button" class="btn btn-secondary" @click="resetFilters">Reset</button>
                    <button type="button" class="btn btn-primary" @click="isFiltersOpen = false">
                        Show {{ visibleItems.length }} {{ visibleItems.length === 1 ? 'item' : 'items' }}
                    </button>
                </div>
            </div>
        </AppDialog>
    </main>
</template>

<style scoped>
.wardrobe-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

.wardrobe-title {
    flex: 1;
    font-size: 24px;
    letter-spacing: 0.5px;
}

.icon-link {
    display: flex;
    padding: 8px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.view-toggle {
    display: flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;

    label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
    }

    input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
}

/*  chosen view gets a black square, invert(1) turns its black icon white */
.view-toggle label:has(input:checked) {
    background-color: var(--black);

    img {
        filter: var(--icon-on-black-filter);
    }
}

.view-toggle label:has(input:focus-visible) {
    outline: 2px solid var(--black);
    outline-offset: 2px;
}

.wardrobe-tabs {
    display: flex;
    gap: 4px;
}

/* Smaller than a normal button, like the Figma's small buttons */
.tab-button {
    padding: 8px 16px;
    font-size: 13px;
}

.create-first {
    align-self: flex-start;
}

/* Like the item grid, but 4 per row on desktop, so the photos in each outfit stay big enough */
.outfit-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

@media (min-width: 768px) {
    .outfit-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .outfit-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.item-list {
    list-style: none;
}

/* 2 cards per row on phones, 3 on tablets, 5 on desktop */
.item-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

@media (min-width: 768px) {
    .item-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .item-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

.filter-button {
    align-self: flex-start;
    gap: 4px;
    font-family: inherit;
    cursor: pointer;
}

.filter-button.chip-selected img {
    filter: var(--icon-on-black-filter);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--black);

    legend {
        margin-bottom: 8px;
        font-family: var(--font-title);
        font-size: 18px;
    }
}

.range-field {
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    gap: 8px;

    input {
        padding: 0;
        border: none;
        accent-color: var(--black);
    }
}

.filter-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>