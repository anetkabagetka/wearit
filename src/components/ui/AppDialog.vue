<script setup>
import { ref, watch } from 'vue'

// A pop-up window on top of the page, e.g. "Delete item?".
// The parent opens and closes it with v-model (true = open)
const isOpen = defineModel({ type: Boolean, default: false })

const dialog = ref(null)

// Gives the pop-up a name for screen readers: its first heading, e.g. "Delete Wool blazer?".
// aria-labelledby points to the heading's id, so it's read out when the pop-up opens
const nameFromHeading = () => {
    const heading = dialog.value.querySelector('h1, h2, h3')
    if (!heading) {
        return
    }
    heading.id ||= `dialog-title-${Math.random().toString(36).slice(2)}`
    dialog.value.setAttribute('aria-labelledby', heading.id)
}

// <dialog> is built into the browser: showModal() opens it with a dark backdrop, close() closes it.
// It also keeps the keyboard inside the pop-up, closes on Esc, and puts focus back where it was
watch(isOpen, (open) => {
    if (open) {
        nameFromHeading()
        dialog.value.showModal()
    } else {
        dialog.value.close()
    }
})
</script>

<template>
    <!-- @close also runs when the user presses Esc, so isOpen stays correct -->
    <dialog ref="dialog" class="app-dialog" @close="isOpen = false">
        <slot />
    </dialog>
</template>

<style scoped>
.app-dialog {
    width: calc(100% - 32px);
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: none;
    border-radius: 16px;
}

/* the dark layer behind the pop-up */
.app-dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.3);
}
</style>