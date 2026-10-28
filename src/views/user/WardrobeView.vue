<script setup>
import Navigation from '@/components/Navigation.vue'
import ItemCard from '@/components/ItemCard.vue'

import { useWardrobe } from '@/composables/useWardrobe'

import plusIcon from '@/assets/icons/plus.svg'
import searchIcon from '@/assets/icons/search.svg'

const { items, currency, isLoading, errorMessage, search, visibleItems } = useWardrobe()
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

            <p class="field-label">
                {{ visibleItems.length }} {{ visibleItems.length === 1 ? 'item' : 'items' }} · sorted by CPW, lowest
                first
            </p>

            <ul class="item-grid">
                <li v-for="item in visibleItems" :key="item.id">
                    <ItemCard :item="item" :currency="currency" />
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