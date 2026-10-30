<script setup>
import { useRoute } from 'vue-router'

import Navigation from '@/components/Navigation.vue'
import OutfitForm from '@/components/OutfitForm.vue'

// The outfit's ID comes from the address, e.g. /edit-outfit/abc123 → "abc123"
const route = useRoute()
</script>

<template>
    <Navigation />
    <main class="container">
        <!-- :key reloads the form when you go from one outfit's edit page straight to another's -->
        <OutfitForm :key="route.params.outfitId" :outfit-id="route.params.outfitId" />
    </main>
</template>