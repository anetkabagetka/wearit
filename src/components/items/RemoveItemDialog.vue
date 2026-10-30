<script setup>
import { computed, ref, watch } from 'vue'

import AppDialog from '@/components/ui/AppDialog.vue'
import FormField from '@/components/ui/FormField.vue'

import { costPerWear } from '@/utils/wardrobe/costPerWear'
import { formatMoney, getCurrencySymbol } from '@/utils/format/formatMoney'
import { isFormValid } from '@/utils/forms/isFormValid'
import { fieldLimits } from '@/utils/forms/fieldLimits'
import { removeOptions } from '@/utils/wardrobe/itemOptions'

import closeIcon from '@/assets/icons/close.svg'

// The "Remove from wardrobe" pop-up: sold, donated or given away, and what it sold for.
// The item page and the home page both use it. The parent opens it with v-model,
// and gets a "confirm" event with the reason and the sale price when Confirm is clicked
const isOpen = defineModel({ type: Boolean, default: false })

const props = defineProps({
    item: { type: Object, default: null },
    currency: { type: String, required: true },
    isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm'])

// Why the item left, and what it sold for
const reason = ref('sold')
const salePrice = ref(null)

// Every time the pop-up opens it starts again at "Sold" with no price, also when it's for another item
watch(isOpen, (open) => {
    if (open) {
        reason.value = 'sold'
        salePrice.value = null
    }
})

// e.g. "Final CPW after sale: €2.87 · (€126 − €40) ÷ 30 wears". Empty while there's no item yet
const finalCpwText = computed(() => {
    if (!props.item) {
        return ''
    }
    const price = props.item.price
    const sale = salePrice.value || 0
    const wears = Math.max(props.item.timesWorn, 1)
    const finalCpw = formatMoney(costPerWear(price - sale, props.item.timesWorn), props.currency)
    const priceText = formatMoney(price, props.currency, { wholeNumbers: true })
    const saleText = formatMoney(sale, props.currency, { wholeNumbers: true })
    return `Final CPW after sale: ${finalCpw} · (${priceText} − ${saleText}) ÷ ${wears} ${wears === 1 ? 'wear' : 'wears'}`
})

const handleConfirm = (event) => {
    // Stop here if the sale price is empty or wrong, FormField shows what to fix
    if (!isFormValid(event.target)) {
        return
    }
    emit('confirm', reason.value, salePrice.value)
}
</script>

<template>
    <AppDialog v-model="isOpen">
        <form class="stack" novalidate @submit.prevent="handleConfirm">
            <div class="section-header">
                <h2 class="title-m">Remove from wardrobe</h2>
                <button type="button" class="back-button" aria-label="Close" @click="isOpen = false">
                    <img :src="closeIcon" alt="" />
                </button>
            </div>
            <p class="notes">Removed items keep their history and final cost per wear.</p>

            <!-- Same option rows as the currency picker: the whole row is the radio button -->
            <fieldset class="stack-small">
                <label v-for="option in removeOptions" :key="option.value" class="option-row">
                    <span class="option-row-text">
                        <span class="option-row-label">{{ option.label }}</span>
                        <span class="option-row-description">{{ option.description }}</span>
                    </span>
                    <input v-model="reason" type="radio" name="reason" :value="option.value" />
                </label>
            </fieldset>

            <!-- The sale price only matters when it was sold -->
            <div v-if="reason === 'sold'" class="stack-small">
                <FormField label="Sale price">
                    <span class="input-icon">
                        <span class="input-prefix">{{ getCurrencySymbol(currency) }}</span>
                        <input v-model.number="salePrice" type="number" min="0" :max="fieldLimits.price" step="0.01" placeholder="0.00"
                            required />
                    </span>
                </FormField>
                <p class="caption">{{ finalCpwText }}</p>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="isSaving">Confirm</button>
        </form>
    </AppDialog>
</template>

<style scoped>
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notes {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray);
}
</style>