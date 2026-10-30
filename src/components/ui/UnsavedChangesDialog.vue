<script setup>
import AppDialog from '@/components/ui/AppDialog.vue'

// The "Leave without saving?" pop-up. useUnsavedChanges opens it with v-model;
// "leave" means go anyway, closing it any other way means stay on the page
const isOpen = defineModel({ type: Boolean, default: false })

defineEmits(['leave'])
</script>

<template>
    <AppDialog v-model="isOpen">
        <div class="stack">
            <h2 class="title-m">Leave without saving?</h2>
            <p class="notes">You have changes that aren't saved yet. If you leave now, they'll be lost.</p>
            <div class="stack-small">
                <!-- autofocus: Keep editing is selected when the pop-up opens, so pressing Enter can't lose changes -->
                <button type="button" class="btn btn-primary" autofocus @click="isOpen = false">
                    Keep editing
                </button>
                <button type="button" class="btn btn-secondary" @click="$emit('leave')">
                    Leave without saving
                </button>
            </div>
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
