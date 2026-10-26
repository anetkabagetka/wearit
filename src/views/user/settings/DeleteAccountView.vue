<script setup>
import Navigation from '@/components/Navigation.vue'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
</script>

<template>
  <Navigation />
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Delete account</h1>
    </div>
  </main>
</template>

<style scoped>
.settings-subpage {
  padding-top: 24px;
  padding-bottom: 80px;
}
</style>