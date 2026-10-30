<script setup>
import leafIcon from '@/assets/icons/leaf.svg'

// The gray "Wear them or sell them!" box on Home: a nudge to wear the least worn items, or let them go.
// Both buttons only offer the 3 least worn items; the page opens the matching pop-up
defineEmits(['log-wear', 'sell'])
</script>

<template>
    <div class="tip-box stack-small">
        <h2 class="tip-title">
            <img :src="leafIcon" alt="" width="20" height="20" />
            Wear them or sell them!
        </h2>
        <p class="notes">These are worn the least, so every wear lowers their cost per wear the most.</p>
        <div class="tip-buttons">
            <button type="button" class="btn btn-primary" @click="$emit('log-wear')">Log a wear</button>
            <button type="button" class="btn btn-secondary" @click="$emit('sell')">Sell or donate</button>
        </div>
    </div>
</template>

<style scoped>
.tip-box {
    padding: 16px;
    border-radius: 8px;
    background-color: var(--subtle-gray);
}

.tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}

.tip-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>
