<script setup>
import Navigation from '@/components/Navigation.vue'

import { useWardrobe } from '@/composables/useWardrobe'

const { items, isLoading, errorMessage } = useWardrobe()
</script>

<template>
    <Navigation />
    <main class="container wardrobe-page stack">
        <div class="wardrobe-header">
            <h1>Wardrobe</h1>
            <RouterLink :to="{ name: 'add-item' }" class="btn btn-primary">Add item</RouterLink>
        </div>

        <!-- Shown above, everything, so the items stay visible if only one "wear" fails -->
        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <p v-if="isLoading">Loading your wardrobe...</p>

        <!-- Nothing saved yet (and no error, because then we dont know if there are any items) -->
        <div v-else-if="items.length === 0 && !errorMessage" class="stack-small">
            <p>Your wardrobe is empty.</p>
            <p class="caption">Add your first item to start tracking its cost per wear.</p>
        </div>

        <!-- Temporary simple list, will be replaced with cards according to figma design -->
        <ul v-else>
            <li v-for="item in items" :key="item.id">{{ item.name }}</li>
        </ul>
    </main>
</template>

<style scoped>
.wardrobe-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

.wardrobe-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}
</style>