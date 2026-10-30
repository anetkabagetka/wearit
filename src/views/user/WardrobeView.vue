<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import Navigation from '@/components/layout/Navigation.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import ItemRow from '@/components/items/ItemRow.vue'
import OutfitCard from '@/components/outfits/OutfitCard.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import WardrobeFiltersDialog from '@/components/wardrobe/WardrobeFiltersDialog.vue'
import FilterButton from '@/components/wardrobe/FilterButton.vue'
import ViewToggle from '@/components/wardrobe/ViewToggle.vue'

import { useWardrobe } from '@/composables/useWardrobe'
import { categoryOptions, colorOptions, cpwSliderMax, seasonOptions } from '@/utils/wardrobe/itemOptions'
import { fieldLimits } from '@/utils/forms/fieldLimits'

import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'

const {
    items,
    outfits,
    currency,
    isLoading,
    errorMessage,
    search,
    filters,
    brandOptions,
    itemTagOptions,
    resetFilters,
    visibleItems,
    visibleOutfits,
    outfitFilters,
    outfitTagOptions,
    resetOutfitFilters,
} = useWardrobe()

// "items" or "outfits". It's in the address (/wardrobe?tab=outfits), so Back and saving an outfit open the right tab
const route = useRoute()
const tab = computed(() => (route.query.tab === 'outfits' ? 'outfits' : 'items'))

// "grid" or "list", changed by the view toggle
const view = ref('grid')

// true while the Filters pop-up is open
const isFiltersOpen = ref(false)

// The Items tab and the Outfits tab each keep their own filters. The pop-up shows the open tab's
const shownFilters = computed(() => (tab.value === 'outfits' ? outfitFilters.value : filters.value))

// "items" or "outfits", for the texts in the pop-up
const shownWord = computed(() => tab.value)

// The chip groups in the pop-up: their title, their choices, and which list in the filters they fill.
// Brand is left out while no item has a brand, Tags while nothing on the open tab has a tag
const filterGroups = computed(() => {
    const groups =
        tab.value === 'outfits'
            ? [{ title: 'Tags', key: 'tags', options: outfitTagOptions.value }]
            : [
                { title: 'Category', key: 'categories', options: categoryOptions },
                { title: 'Brand', key: 'brands', options: brandOptions.value },
                { title: 'Color', key: 'colors', options: colorOptions },
                { title: 'Season', key: 'seasons', options: seasonOptions },
                { title: 'Tags', key: 'tags', options: itemTagOptions.value },
            ]
    return groups.filter((group) => group.options.length > 0)
})

// true when the CPW slider isn't at "everything"
const isCpwFiltered = computed(() => shownFilters.value.minCpw > 0 || shownFilters.value.maxCpw < cpwSliderMax)

// How many filters are on, for the "Filters · 2" button: the CPW slider counts as one,
// plus every group that has something picked
const activeFilterCount = computed(() => {
    const pickedGroups = filterGroups.value.filter((group) => shownFilters.value[group.key].length > 0)
    return (isCpwFiltered.value ? 1 : 0) + pickedGroups.length
})

// How many the open tab shows, for the button at the bottom of the pop-up, e.g. "Show 6 outfits"
const shownCount = computed(() => (tab.value === 'outfits' ? visibleOutfits.value.length : visibleItems.value.length))

// "Reset" in the pop-up resets only the open tab's filters
const resetShownFilters = () => (tab.value === 'outfits' ? resetOutfitFilters() : resetFilters())
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

        <!-- Items | Outfits: the open tab has a border -->
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

        <LoadingSkeleton v-if="isLoading" variant="cards" />

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
                    <input v-model="search" type="text" placeholder="Search your outfits" :maxlength="fieldLimits.search"
                        aria-label="Search your outfits" />
                </label>

                <!-- The same Filters button as on the Items tab, with the outfits' own filters -->
                <FilterButton :count="activeFilterCount" @click="isFiltersOpen = true" />

                <!-- A toolbar row like on the Items tab, so the line has the same space above and below -->
                <div class="toolbar count-row">
                    <p class="field-label">
                        {{ visibleOutfits.length }} {{ visibleOutfits.length === 1 ? 'outfit' : 'outfits' }} · sorted
                        by CPW, lowest first
                    </p>
                </div>

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
            <RouterLink :to="{ name: 'add-item' }" class="btn btn-primary create-first">
                Add item
            </RouterLink>
        </div>

        <!-- Show the search bar and the items -->
        <template v-else>
            <label class="input-icon search">
                <img :src="searchIcon" alt="" width="20" height="20" />
                <input v-model="search" type="text" placeholder="Search your wardrobe" :maxlength="fieldLimits.search"
                    aria-label="Search your wardrobe" />
            </label>

            <FilterButton :count="activeFilterCount" @click="isFiltersOpen = true" />

            <div class="toolbar">
                <p class="field-label">
                    {{ visibleItems.length }} {{ visibleItems.length === 1 ? 'item' : 'items' }} · sorted by CPW, lowest
                    first
                </p>

                <ViewToggle v-model="view" />
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

        <!-- Shows the open tab's filters -->
        <WardrobeFiltersDialog v-model="isFiltersOpen" :filters="shownFilters" :groups="filterGroups" :word="shownWord"
            :shown-count="shownCount" :currency="currency" @reset="resetShownFilters" />
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

.count-row {
    min-height: 38px;
}

.wardrobe-tabs {
    display: flex;
    gap: 4px;
}

/* Smaller than a normal button */
.tab-button {
    padding: 8px 16px;
    font-size: 13px;
}

/* "Add item" / "Create outfit" when the tab is empty: not full width, with a bit more space above than the text has */
.create-first {
    align-self: flex-start;
    margin-top: 8px;
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

</style>