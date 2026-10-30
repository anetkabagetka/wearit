<script setup>
import { useRoute } from 'vue-router'

import Navigation from '@/components/layout/Navigation.vue'
import ItemForm from '@/components/items/ItemForm.vue'

// The item's ID comes from the address, e.g. /edit-item/abc123 → "abc123"
const route = useRoute()
</script>

<template>
  <Navigation />
  <main class="container">
    <!-- :key reloads the form when you go from one item's edit page straight to another's -->
    <ItemForm :key="route.params.itemId" :item-id="route.params.itemId" />
  </main>
</template>