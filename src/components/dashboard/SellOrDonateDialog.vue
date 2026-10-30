<script setup>
import { ref, watch } from 'vue'

import AppDialog from '@/components/ui/AppDialog.vue'
import RemoveItemDialog from '@/components/items/RemoveItemDialog.vue'
import ItemRemovedDialog from '@/components/items/ItemRemovedDialog.vue'

import { costPerWear } from '@/utils/wardrobe/costPerWear'
import { formatMoney } from '@/utils/format/formatMoney'
import { formatWears } from '@/utils/format/formatWears'

import closeIcon from '@/assets/icons/close.svg'

// "Sell or donate" in "Wear them or sell them" on Home, in three steps:
// 1. pick one of the 3 least worn items, 2. the same "Remove from wardrobe" pop-up as on the item page,
// 3. "Marked as sold" says what happened. The page opens step 1 with v-model
const isOpen = defineModel({ type: Boolean, default: false })

const props = defineProps({
    leastWorn: { type: Array, required: true },
    currency: { type: String, default: 'EUR' },
    // Takes the item out of the wardrobe, from useDashboard. Returns whether it worked
    removeItem: { type: Function, required: true },
})

const pickedId = ref('')
const itemToRemove = ref(null) // The picked item, kept here while the next pop-ups are open
const isRemoveOpen = ref(false)
const isRemoving = ref(false)
const isRemovedOpen = ref(false)
const removedReason = ref('sold')

// Opens with the least worn item already selected
watch(isOpen, (open) => {
    if (open) {
        pickedId.value = props.leastWorn[0]?.id ?? ''
    }
})

// "Next": close step 1 and open "Remove from wardrobe" for the picked item
const goToRemove = () => {
    itemToRemove.value = props.leastWorn.find((item) => item.id === pickedId.value)
    isOpen.value = false
    isRemoveOpen.value = true
}

// "Confirm" in "Remove from wardrobe": the item leaves the wardrobe, then "Marked as sold" opens
const handleRemove = async (reason, salePrice) => {
    isRemoving.value = true
    if (await props.removeItem(itemToRemove.value, reason, salePrice)) {
        isRemoveOpen.value = false
        removedReason.value = reason
        isRemovedOpen.value = true
    }
    isRemoving.value = false
}
</script>

<template>
    <!-- Step 1: which of the 3 least worn items -->
    <AppDialog v-model="isOpen">
        <form class="stack" @submit.prevent="goToRemove">
            <div class="section-header">
                <h2 class="title-m">Sell or donate</h2>
                <button type="button" class="back-button" aria-label="Close" @click="isOpen = false">
                    <img :src="closeIcon" alt="" />
                </button>
            </div>
            <p class="notes">Which of your least worn items is leaving your wardrobe?</p>

            <!-- Option rows like in "Remove from wardrobe", with the item's photo in front -->
            <fieldset class="stack-small">
                <label v-for="item in leastWorn" :key="item.id" class="option-row">
                    <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="option-photo" />
                    <div v-else class="option-photo"></div>
                    <span class="option-row-text">
                        <span class="option-row-label">{{ item.name }}</span>
                        <span class="option-row-description">
                            {{ formatWears(item.timesWorn) }} ·
                            {{ formatMoney(costPerWear(item.price, item.timesWorn), currency) }} per wear
                        </span>
                    </span>
                    <input v-model="pickedId" type="radio" name="remove-item" :value="item.id" />
                </label>
            </fieldset>

            <button type="submit" class="btn btn-primary">Next</button>
        </form>
    </AppDialog>

    <!-- Step 2: the same pop-up as "Mark as sold or donated" on the item page -->
    <RemoveItemDialog v-model="isRemoveOpen" :item="itemToRemove" :currency="currency" :is-saving="isRemoving"
        @confirm="handleRemove" />

    <!-- Step 3 -->
    <ItemRemovedDialog v-model="isRemovedOpen" :item="itemToRemove" :reason="removedReason" />
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

/* Small photo at the start of each option */
.option-photo {
    flex-shrink: 0;
    width: 40px;
    height: 48px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}
</style>
