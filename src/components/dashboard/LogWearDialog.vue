<script setup>
import { computed, ref, watch } from 'vue'

import AppDialog from '@/components/ui/AppDialog.vue'
import OutfitCollage from '@/components/outfits/OutfitCollage.vue'
import OutfitLoggedSummary from '@/components/outfits/OutfitLoggedSummary.vue'
import ItemLoggedSummary from '@/components/items/ItemLoggedSummary.vue'

import { costPerWear, outfitCostPerWear } from '@/utils/wardrobe/costPerWear'
import { toJsDate } from '@/utils/format/formatDate'
import { formatMoney } from '@/utils/format/formatMoney'
import { formatWears } from '@/utils/format/formatWears'
import { categoryOptions, mainCategory } from '@/utils/wardrobe/itemOptions'
import { wornToday } from '@/utils/wardrobe/wornToday'
import { fieldLimits } from '@/utils/forms/fieldLimits'

import searchIcon from '@/assets/icons/search.svg'
import closeIcon from '@/assets/icons/close.svg'

// The "Log a wear" pop-up on Home: pick an item or outfit from the list, then see its new cost per wear.
// The page opens it with v-model. With leastOnly it only lists the 3 least worn items ("Wear them or sell them")
const isOpen = defineModel({ type: Boolean, default: false })

const props = defineProps({
    items: { type: Array, required: true },
    outfits: { type: Array, required: true }, // Outfits with their items filled in
    leastWorn: { type: Array, required: true },
    leastOnly: { type: Boolean, default: false },
    currency: { type: String, default: 'EUR' },
    goal: { type: Number, default: null },
    errorMessage: { type: String, default: '' },
    // Save the wear, from useDashboard. They return whether it worked (wearOutfit: the items that got a wear)
    wearItem: { type: Function, required: true },
    wearOutfit: { type: Function, required: true },
})

const search = ref('')
const category = ref('recent') // "recent" shows everything, "outfits" the outfits, or a category like "Tops"
const loggedItem = ref(null)
const loggedOutfitId = ref(null) // The outfit that was just logged, or null
const loggedOutfitItems = ref([]) // Its items that got a wear
const cpwBefore = ref(0) // The cost per wear before this wear, for "was €4.20"
const onlyLeastWorn = ref(false)

// Starts fresh: empty search, "Recent" chip, back to the list. "Log another wear" uses it too
const reset = (leastOnly) => {
    onlyLeastWorn.value = leastOnly
    search.value = ''
    category.value = 'recent'
    loggedItem.value = null
    loggedOutfitId.value = null
}

// Every time the pop-up opens it starts fresh
watch(isOpen, (open) => {
    if (open) {
        reset(props.leastOnly)
    }
})

// The category chips: only categories that are in the wardrobe, in the usual order
const categories = computed(() =>
    categoryOptions.filter((option) => props.items.some((item) => mainCategory(item.category) === option)),
)

// Items that match the search and chip, the most recently worn first.
// Never worn items count as worn in 1970 (date 0), so they go last
const itemList = computed(() => {
    if (onlyLeastWorn.value) {
        return props.leastWorn
    }
    const text = search.value.toLowerCase()
    return props.items
        .filter((item) => item.name.toLowerCase().includes(text))
        .filter((item) => category.value === 'recent' || mainCategory(item.category) === category.value)
        .sort((a, b) => toJsDate(b.lastWornAt ?? 0) - toJsDate(a.lastWornAt ?? 0))
})

// Outfits under the Outfits chip that match the search, the most recently worn first.
// Outfits whose items all left the wardrobe can't be worn, so they're left out
const outfitList = computed(() => {
    const text = search.value.toLowerCase()
    return props.outfits
        .filter((outfit) => outfit.items.length > 0 && outfit.name.toLowerCase().includes(text))
        .sort((a, b) => toJsDate(b.lastWornAt ?? 0) - toJsDate(a.lastWornAt ?? 0))
})

// The outfit that was just logged, with its items and its new numbers
const loggedOutfit = computed(() => props.outfits.find((outfit) => outfit.id === loggedOutfitId.value))

// A small pop-up on top when the wear is already logged today
const wornTodayThing = ref(null)
const isWornTodayOpen = ref(false)

// Logs the wear, then shows "Wear logged" with the new cost per wear.
// "Log a wear" works once a day per item, so a second one today only opens the "Already logged" pop-up
const logItem = async (item) => {
    if (wornToday(item)) {
        wornTodayThing.value = item
        isWornTodayOpen.value = true
        return
    }
    cpwBefore.value = costPerWear(item.price, item.timesWorn)
    if (await props.wearItem(item)) {
        loggedItem.value = item
    }
}

// "Log wear" on an outfit: a wear for the outfit and its items, then "Outfit logged".
// When every item was already worn today, only the "Already logged" pop-up opens
const logOutfit = async (outfit) => {
    if (outfit.items.every(wornToday)) {
        wornTodayThing.value = outfit
        isWornTodayOpen.value = true
        return
    }
    cpwBefore.value = outfitCostPerWear(outfit.items)
    const logged = await props.wearOutfit(outfit)
    if (logged) {
        loggedOutfitItems.value = logged
        loggedOutfitId.value = outfit.id
    }
}
</script>

<template>
    <AppDialog v-model="isOpen">
        <div class="stack">
            <div class="section-header">
                <h2 class="title-m">{{ loggedItem ? 'Wear logged' : loggedOutfit ? 'Outfit logged' : 'Log a wear' }}</h2>
                <button type="button" class="back-button" aria-label="Close" @click="isOpen = false">
                    <img :src="closeIcon" alt="" />
                </button>
            </div>

            <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

            <!-- After logging: the item and its new cost per wear -->
            <template v-if="loggedItem">
                <ItemLoggedSummary :item="loggedItem" :cpw-before="cpwBefore" :currency="currency" :goal="goal" />

                <div class="stack-small">
                    <button type="button" class="btn btn-primary" @click="isOpen = false">Done</button>
                    <button type="button" class="btn btn-secondary" @click="reset(onlyLeastWorn)">
                        Log another wear
                    </button>
                </div>
            </template>

            <!-- After logging an outfit: its new cost per wear, and the items that were skipped -->
            <template v-else-if="loggedOutfit">
                <OutfitLoggedSummary :outfit="loggedOutfit" :items="loggedOutfit.items"
                    :logged-items="loggedOutfitItems" :cpw-before="cpwBefore" :currency="currency" />

                <div class="stack-small">
                    <button type="button" class="btn btn-primary" @click="isOpen = false">Done</button>
                    <button type="button" class="btn btn-secondary" @click="reset(false)">Log another wear</button>
                </div>
            </template>

            <!-- Before logging: search and the list of items -->
            <template v-else>
                <p v-if="onlyLeastWorn" class="notes">Your 3 least worn items. Every wear lowers their cost per wear
                    the most.</p>

                <!-- Search and chips only for the whole wardrobe -->
                <label v-if="!onlyLeastWorn" class="input-icon search">
                    <img :src="searchIcon" alt="" width="20" height="20" />
                    <input v-model="search" type="text" :maxlength="fieldLimits.search"
                        :placeholder="category === 'outfits' ? 'Search outfit to log...' : 'Search item to log...'"
                        :aria-label="category === 'outfits' ? 'Search outfit to log' : 'Search item to log'" />
                </label>

                <div v-if="!onlyLeastWorn" class="chips">
                    <label class="chip">
                        <input v-model="category" type="radio" name="log-category" value="recent" />
                        Recent
                    </label>
                    <!-- Only when there are outfits -->
                    <label v-if="outfits.length" class="chip">
                        <input v-model="category" type="radio" name="log-category" value="outfits" />
                        Outfits
                    </label>
                    <label v-for="option in categories" :key="option" class="chip">
                        <input v-model="category" type="radio" name="log-category" :value="option" />
                        {{ option }}
                    </label>
                </div>

                <ul v-if="category !== 'outfits'" class="log-list">
                    <li v-for="item in itemList" :key="item.id" class="log-row">
                        <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="log-row-photo" />
                        <!-- Gray box when the item has no photo -->
                        <div v-else class="log-row-photo"></div>
                        <span class="log-row-text">
                            <span class="log-row-name">{{ item.name }}</span>
                            <span class="caption">
                                {{ formatMoney(costPerWear(item.price, item.timesWorn), currency) }} per wear ·
                                {{ formatWears(item.timesWorn) }}
                            </span>
                        </span>
                        <button type="button" class="btn btn-secondary" @click="logItem(item)">Log wear</button>
                    </li>
                </ul>
                <p v-if="category !== 'outfits' && itemList.length === 0" class="caption">No items match.</p>

                <!-- The Outfits chip: each outfit with its photos, like the items -->
                <ul v-if="category === 'outfits'" class="log-list">
                    <li v-for="outfit in outfitList" :key="outfit.id" class="log-row">
                        <OutfitCollage :items="outfit.items" :photo-url="outfit.photoUrl" class="log-row-photo" />
                        <span class="log-row-text">
                            <span class="log-row-name">{{ outfit.name }}</span>
                            <span class="caption">
                                {{ formatMoney(outfitCostPerWear(outfit.items), currency) }} per wear ·
                                {{ formatWears(outfit.timesWorn) }}
                            </span>
                        </span>
                        <button type="button" class="btn btn-secondary" @click="logOutfit(outfit)">Log wear</button>
                    </li>
                </ul>
                <p v-if="category === 'outfits' && outfitList.length === 0" class="caption">No outfits match.</p>
            </template>
        </div>
    </AppDialog>

    <!-- On top of "Log a wear": this wear is already logged today -->
    <AppDialog v-model="isWornTodayOpen">
        <div class="stack">
            <h2 class="title-m">Already logged today</h2>
            <!-- itemIds: it's an outfit, and every item in it was already worn today -->
            <p v-if="wornTodayThing?.itemIds" class="notes">Every item in {{ wornTodayThing.name }} is already logged
                today. You can log the outfit again tomorrow.</p>
            <p v-else class="notes">You already logged a wear of {{ wornTodayThing?.name }} today. You can log the next
                one tomorrow.</p>
            <button type="button" class="btn btn-primary" autofocus @click="isWornTodayOpen = false">OK</button>
        </div>
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

.log-list {
    list-style: none;
}

/* Like ListRow: one row per item with a gray line under it */
.log-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--light-gray);
}

.log-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.log-row-name {
    font-family: var(--font-title);
    font-size: 15px;
    color: var(--black);
}

/* Small photo at the start of each row */
.log-row-photo {
    flex-shrink: 0;
    width: 40px;
    height: 48px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}
</style>
