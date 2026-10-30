<script setup>
import { computed } from 'vue'

import AppDialog from '@/components/ui/AppDialog.vue'
import { formatMoney } from '@/utils/format/formatMoney'
import { cpwSliderMax } from '@/utils/wardrobe/itemOptions'

import closeIcon from '@/assets/icons/close.svg'

// The Filters pop-up on the wardrobe page. The page opens it with v-model.
// Changes show on the page right away, the button at the bottom just closes the pop-up
const isOpen = defineModel({ type: Boolean, default: false })

// The open tab's filters: { minCpw, maxCpw, categories, ... }. The sliders and chips change them directly
const filters = defineModel('filters', { type: Object, required: true })

const props = defineProps({
    groups: { type: Array, required: true }, // The chip groups: { title, key, options }
    word: { type: String, required: true }, // "items" or "outfits", for the texts
    shownCount: { type: Number, required: true }, // How many match, for "Show 6 outfits"
    currency: { type: String, default: 'EUR' },
})

defineEmits(['reset'])

// e.g. "Show items between €2 and €30 per wear". At the top of the slider it says "€50+"
const cpwRangeText = computed(() => {
    const { minCpw, maxCpw } = filters.value
    const min = formatMoney(minCpw, props.currency, { wholeNumbers: true })
    const max = formatMoney(maxCpw, props.currency, { wholeNumbers: true })
    return `Show ${props.word} between ${min} and ${maxCpw === cpwSliderMax ? `${max}+` : max} per wear`
})
</script>

<template>
    <AppDialog v-model="isOpen">
        <div class="stack">
            <div class="dialog-header">
                <h2 class="title-m">Filters</h2>
                <button type="button" class="back-button" aria-label="Close" @click="isOpen = false">
                    <img :src="closeIcon" alt="" />
                </button>
            </div>

            <fieldset class="filter-group">
                <legend>Cost per wear</legend>
                <label class="range-field">
                    <span class="caption">From</span>
                    <input v-model.number="filters.minCpw" type="range" min="0" :max="cpwSliderMax" step="1" />
                </label>
                <label class="range-field">
                    <span class="caption">To</span>
                    <input v-model.number="filters.maxCpw" type="range" min="0" :max="cpwSliderMax" step="1" />
                </label>
                <p class="caption">{{ cpwRangeText }}</p>
            </fieldset>

            <!-- Same chips as the tags in the item form: a hidden checkbox inside each label -->
            <fieldset v-for="group in groups" :key="group.key" class="filter-group">
                <legend>{{ group.title }}</legend>
                <div class="chips">
                    <label v-for="option in group.options" :key="option" class="chip">
                        <input v-model="filters[group.key]" type="checkbox" :value="option" />
                        {{ option }}
                    </label>
                </div>
            </fieldset>

            <div class="filter-buttons">
                <button type="button" class="btn btn-secondary" @click="$emit('reset')">Reset</button>
                <button type="button" class="btn btn-primary" @click="isOpen = false">
                    Show {{ shownCount }} {{ shownCount === 1 ? word.slice(0, -1) : word }}
                </button>
            </div>
        </div>
    </AppDialog>
</template>

<style scoped>
.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--black);

    legend {
        margin-bottom: 8px;
        font-family: var(--font-title);
        font-size: 18px;
    }
}

.range-field {
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    gap: 8px;

    input {
        padding: 0;
        border: none;
        accent-color: var(--black);
    }
}

.filter-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>
