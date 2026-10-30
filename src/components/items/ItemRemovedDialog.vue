<script setup>
import AppDialog from '@/components/ui/AppDialog.vue'
import { removeOptions } from '@/utils/wardrobe/itemOptions'

// The pop-up after an item was sold, donated or given away, on the item page and on Home.
// The parent opens it with v-model; the button closes it, and the parent decides what happens next
const isOpen = defineModel({ type: Boolean, default: false })

defineProps({
    item: { type: Object, default: null },
    reason: { type: String, default: 'sold' }, // "sold", "donated" or "gave-away"
    buttonLabel: { type: String, default: 'OK' },
})

// e.g. "given away", from the matching choice in removeOptions
const reasonText = (reason) => removeOptions.find((option) => option.value === reason)?.doneText ?? 'removed'
</script>

<template>
    <AppDialog v-model="isOpen">
        <div class="stack">
            <h2 class="title-m">Marked as {{ reasonText(reason) }}</h2>
            <p class="notes">
                {{ item?.name }} has been marked as {{ reasonText(reason) }} and removed from your wardrobe.
                Its logged wears and final cost per wear stay in your history.
            </p>
            <button type="button" class="btn btn-primary" autofocus @click="isOpen = false">
                {{ buttonLabel }}
            </button>
        </div>
    </AppDialog>
</template>

<style scoped>
.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}
</style>
