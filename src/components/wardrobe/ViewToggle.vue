<script setup>
import gridIcon from '@/assets/icons/grid.svg'
import listIcon from '@/assets/icons/list.svg'

// The grid / list switch on the wardrobe page: "grid" or "list", used with v-model.
// Same trick as .chip: the radio is hidden, the label is what you see
const view = defineModel({ type: String, default: 'grid' })
</script>

<template>
    <div class="view-toggle">
        <label>
            <input v-model="view" type="radio" name="view" value="grid" />
            <img :src="gridIcon" alt="Grid view" width="18" height="18" />
        </label>
        <label>
            <input v-model="view" type="radio" name="view" value="list" />
            <img :src="listIcon" alt="List view" width="18" height="18" />
        </label>
    </div>
</template>

<style scoped>
.view-toggle {
    display: flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;

    label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
    }

    input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
}

/* The chosen view gets a black square, and its black icon turns white */
.view-toggle label:has(input:checked) {
    background-color: var(--black);

    img {
        filter: var(--icon-on-black-filter);
    }
}

.view-toggle label:has(input:focus-visible) {
    outline: 2px solid var(--black);
    outline-offset: 2px;
}
</style>
