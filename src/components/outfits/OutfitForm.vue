<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import FormField from '@/components/ui/FormField.vue'
import CpwCard from '@/components/ui/CpwCard.vue'
import OutfitCollage from '@/components/outfits/OutfitCollage.vue'

import { useOutfitForm } from '@/composables/outfits/useOutfitForm'
import { isFormValid } from '@/utils/forms/isFormValid'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import searchIcon from '@/assets/icons/search.svg'
import checkIcon from '@/assets/icons/check.svg'

// The Create outfit and Edit outfit pages share this form.
// Without outfitId it creates a new outfit, with outfitId it edits that outfit
const props = defineProps({
    outfitId: { type: String, default: null },
})

const router = useRouter()

const {
    isEditing,
    name,
    tags,
    currency,
    search,
    category,
    isLoading,
    isNotFound,
    isSaving,
    errorMessage,
    pickError,
    pickedItems,
    outfitCpw,
    categories,
    tagOptions,
    visibleItems,
    isPicked,
    togglePick,
    save,
} = useOutfitForm(props.outfitId)

// The line under the price in the cost card, e.g. "Sum of its 4 items' cost per wear. Drops with every wear."
const formulaText = computed(() => {
    const count = pickedItems.value.length
    if (count < 2) {
        return 'Pick 2 or more items to see what the outfit costs to wear.'
    }
    return `Sum of its ${count} items' cost per wear. Drops with every wear.`
})

const handleSave = (event) => {
    // Stop here if the name is empty, FormField shows what to fix
    if (!isFormValid(event.target)) {
        return
    }
    save()
}
</script>

<template>
    <div class="outfit-form-page stack">
        <div class="top-bar">
            <button type="button" class="back-button" aria-label="Back" @click="router.back()">
                <img :src="chevronLeftIcon" alt="" />
            </button>
            <h1 class="title-m">{{ isEditing ? 'Edit outfit' : 'Create outfit' }}</h1>
        </div>

        <p v-if="isLoading">Loading...</p>

        <p v-else-if="isNotFound">
            This outfit doesn't exist anymore.
            <RouterLink :to="{ name: 'wardrobe', query: { tab: 'outfits' } }" class="link">Back to your outfits
            </RouterLink>
        </p>

        <!-- Wide screens: Pick items on the left, the outfit on the right. Phones: the outfit first -->
        <form v-else class="outfit-form" novalidate @submit.prevent="handleSave">
            <section class="outfit-pick stack">
                <div class="stack-small">
                    <h2 class="title-m">Pick items</h2>
                    <p class="caption">Pick 2 or more. Tap Added to take one out again.</p>
                </div>

                <p v-if="pickError" class="form-error" role="alert">{{ pickError }}</p>

                <label class="input-icon search">
                    <img :src="searchIcon" alt="" width="20" height="20" />
                    <input v-model="search" type="text" placeholder="Search your wardrobe"
                        aria-label="Search your wardrobe" />
                </label>

                <!-- Same chips as in "Log a wear": a hidden radio inside each label -->
                <div class="chips">
                    <label class="chip">
                        <input v-model="category" type="radio" name="pick-category" value="all" />
                        All
                    </label>
                    <label v-for="option in categories" :key="option" class="chip">
                        <input v-model="category" type="radio" name="pick-category" :value="option" />
                        {{ option }}
                    </label>
                </div>

                <ul class="pick-list">
                    <li v-for="item in visibleItems" :key="item.id" class="pick-row">
                        <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="pick-row-photo" />
                        <!-- Gray box when the item has no photo -->
                        <div v-else class="pick-row-photo"></div>
                        <span class="pick-row-text">
                            <span class="pick-row-name">{{ item.name }}</span>
                            <span class="caption">
                                <template v-if="item.brand">{{ item.brand }} · </template>{{ item.category }}
                            </span>
                        </span>
                        <!-- Black "Added" with a check when it's in the outfit. aria-pressed tells screen readers -->
                        <button type="button" class="btn pick-button"
                            :class="isPicked(item) ? 'btn-primary' : 'btn-secondary'" :aria-pressed="isPicked(item)"
                            @click="togglePick(item)">
                            <img v-if="isPicked(item)" :src="checkIcon" alt="" width="16" height="16"
                                class="white-icon" />
                            {{ isPicked(item) ? 'Added' : 'Add' }}
                        </button>
                    </li>
                </ul>
                <p v-if="visibleItems.length === 0" class="caption">No items match.</p>
            </section>

            <section class="outfit-preview stack">
                <div class="stack-small">
                    <h2 class="title-m">Your outfit</h2>
                    <p class="caption">
                        {{ pickedItems.length }} {{ pickedItems.length === 1 ? 'item' : 'items' }}
                    </p>
                </div>

                <OutfitCollage :items="pickedItems" class="outfit-preview-photo" />

                <FormField label="Outfit name">
                    <input v-model="name" type="text" placeholder="e.g. Office Monday" required />
                </FormField>
            </section>

            <div class="outfit-details">
                <!-- CpwCard divides the price by the wears, so the sum with 1 wear shows the sum itself -->
                <CpwCard label="Outfit cost per wear" :price="outfitCpw" :times-worn="1" :currency="currency"
                    :formula="formulaText" />

                <section class="stack">
                    <h2 class="title-m">Tags</h2>

                    <FormField label="Pick tags" group>
                        <div class="chips">
                            <label v-for="tag in tagOptions" :key="tag" class="chip">
                                <input v-model="tags" type="checkbox" :value="tag" />
                                {{ tag }}
                            </label>
                        </div>
                    </FormField>
                </section>

                <div class="actions">
                    <button type="submit" :disabled="isSaving" class="btn btn-primary width-full">
                        <template v-if="isSaving">Saving...</template>
                        <template v-else>{{ isEditing ? 'Save changes' : 'Save outfit' }}</template>
                    </button>
                    <button type="button" class="btn btn-ghost width-full" @click="router.back()">
                        Cancel
                    </button>
                </div>
            </div>
        </form>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </div>
</template>

<style scoped>
.outfit-form-page {
    padding-top: 24px;
    padding-bottom: 80px;
}

/* Phones: one column, the outfit first. grid-template-areas names each part's place */
.outfit-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
        "preview"
        "pick"
        "details";
    gap: 32px;
}

/* Wide screens: Pick items on the left, the outfit and its details on the right, like Add item.
   1fr in the rows: when the list is long, the space goes under the details, not between the right parts */
@media (min-width: 900px) {
    .outfit-form {
        grid-template-columns: minmax(0, 632fr) minmax(0, 440fr);
        grid-template-rows: auto 1fr;
        grid-template-areas:
            "pick preview"
            "pick details";
        column-gap: 48px;
        align-items: start;
    }
}

.outfit-pick {
    grid-area: pick;
}

.outfit-preview {
    grid-area: preview;
}

.outfit-details {
    grid-area: details;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.outfit-preview-photo {
    height: 260px;
}

@media (min-width: 900px) {
    .outfit-preview-photo {
        height: 330px;
    }
}

.pick-list {
    list-style: none;
}

/* Like the rows in "Log a wear": photo, name, and the button on the right */
.pick-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--light-gray);
}

.pick-row-photo {
    flex-shrink: 0;
    width: 48px;
    height: 56px;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

.pick-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.pick-row-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--black);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pick-button {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.white-icon {
    filter: var(--icon-on-black-filter);
}

.link {
    color: var(--black);
    text-decoration: underline;
}
</style>