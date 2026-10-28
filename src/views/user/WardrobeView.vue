<script setup>
import { ref } from 'vue'

import Navigation from '@/components/Navigation.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemRow from '@/components/ItemRow.vue'

import { useWardrobe } from '@/composables/useWardrobe'

import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'
import gridIcon from '@/assets/icons/grid.svg'
import listIcon from '@/assets/icons/list.svg'

const { items, currency, isLoading, errorMessage, search, visibleItems } = useWardrobe()

// "grid" or "list", changed by the view toggle
const view = ref('grid')
</script>

<template>
    <Navigation />
    <main class="container wardrobe-page stack">
        <div class="top-bar">
            <h1 class="wardrobe-title">Wardrobe</h1>
            <RouterLink :to="{ name: 'add-item' }" class="icon-link" aria-label="Add item">
                <img :src="plusIcon" alt="" width="24" height="24" />
            </RouterLink>
        </div>

        <!-- Shown above, everything, so the items stay visible if only one "wear" fails -->
        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <p v-if="isLoading">Loading your wardrobe...</p>

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
        filter: invert(1);
    }
}

.view-toggle label:has(input:focus-visible) {
    outline: 2px solid var(--black);
    outline-offset: 2px;
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