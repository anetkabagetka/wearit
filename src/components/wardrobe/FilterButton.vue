<script setup>
import filterIcon from '@/assets/icons/filter.svg'

// The "Filters" chip that opens the Filters pop-up, on both wardrobe tabs.
// Turns black and shows how many filters are on, e.g. "Filters · 2"
defineProps({
    count: { type: Number, default: 0 },
})
</script>

<template>
    <button type="button" class="chip filter-button" :class="{ 'chip-selected': count > 0 }">
        Filters{{ count > 0 ? ` · ${count}` : '' }}
        <img :src="filterIcon" alt="" width="16" height="16" />
    </button>
</template>

<style scoped>
.filter-button {
    align-self: flex-start;
    gap: 4px;
    font-family: inherit;
    cursor: pointer;
}

.filter-button.chip-selected img {
    filter: var(--icon-on-black-filter);
}
</style>
