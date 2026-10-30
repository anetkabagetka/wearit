<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import FormField from '@/components/ui/FormField.vue'
import PhotoUpload from '@/components/ui/PhotoUpload.vue'
import CpwCard from '@/components/ui/CpwCard.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import UnsavedChangesDialog from '@/components/ui/UnsavedChangesDialog.vue'

import { useItemForm } from '@/composables/items/useItemForm'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { isFormValid } from '@/utils/forms/isFormValid'
import { fieldLimits, todayText } from '@/utils/forms/fieldLimits'
import { getCurrencySymbol } from '@/utils/format/formatMoney'
import { accessoryOptions, clothingOptions, colorOptions, seasonOptions } from '@/utils/wardrobe/itemOptions'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import plusIcon from '@/assets/icons/plus.svg'
import trashIcon from '@/assets/icons/trash.svg'

// The add item and edit item pages share this form.
// Without itemId it adds a new item, with itemId it edits that item
const props = defineProps({
  itemId: { type: String, default: null },
})

const router = useRouter()

const {
  isEditing,
  item,
  photoFile,
  currency,
  goal,
  tagOptions,
  isLoading,
  isNotFound,
  isSaving,
  errorMessage,
  addTag,
  save,
  remove,
  hasUnsavedChanges,
} = useItemForm(props.itemId)

// Asks before leaving when there are changes that aren't saved yet
const { isLeaveOpen, confirmLeave } = useUnsavedChanges(hasUnsavedChanges)

// true while the "Delete item?" pop-up is open
const isDeleteOpen = ref(false)

// Closes the pop-up first, so an error message on the page isn't hidden behind it
const confirmDelete = () => {
  isDeleteOpen.value = false
  remove()
}

// "Add tag": the chip turns into a small text field while the user types a new tag
const isAddingTag = ref(false)
const newTag = ref('')
const tagInput = ref(null)

const startAddingTag = async () => {
  isAddingTag.value = true
  // Wait until Vue has shown the text field, then put the cursor in it
  await nextTick()
  tagInput.value?.focus()
}

const confirmNewTag = () => {
  addTag(newTag.value)
  newTag.value = ''
  isAddingTag.value = false
}

const handleSave = (event) => {
  // Stop here if a field is empty or wrong, FormField shows what to fix
  if (!isFormValid(event.target)) {
    return
  }
  save()
}
</script>

<template>
  <div class="item-form-page stack">
    <div class="top-bar">
      <button type="button" class="back-button" aria-label="Back" @click="router.back()">
        <img :src="chevronLeftIcon" alt="" />
      </button>
      <h1 class="title-m">{{ isEditing ? 'Edit item' : 'Add item' }}</h1>

      <!-- Trash icon on the right, only when editing -->
      <button v-if="isEditing && !isLoading && !isNotFound" type="button" class="back-button delete-button"
        aria-label="Delete item" :disabled="isSaving" @click="isDeleteOpen = true">
        <img :src="trashIcon" alt="" />
      </button>
    </div>

    <!-- Same pop-up as on the item page -->
    <AppDialog v-model="isDeleteOpen">
      <div class="stack">
        <h2 class="title-m">Delete {{ item.name || 'this item' }}?</h2>
        <p class="caption">All logged wears and cost per wear history will be removed. This can't be undone.</p>
        <div class="stack-small">
          <button type="button" class="btn btn-primary" :disabled="isSaving" @click="confirmDelete">
            Delete item
          </button>
          <button type="button" class="btn btn-secondary" autofocus @click="isDeleteOpen = false">
            Cancel
          </button>
        </div>
      </div>
    </AppDialog>

    <p v-if="isLoading">Loading...</p>

    <p v-else-if="isNotFound">
      This item doesn't exist anymore.
      <RouterLink :to="{ name: 'wardrobe' }" class="link">Back to your wardrobe</RouterLink>
    </p>

    <!-- Two columns on wide screens, one column on phones -->
    <form v-else @submit.prevent="handleSave" class="item-form" novalidate>
      <!-- Left column: photo and basic info (and notes when editing) -->
      <div class="item-form-column">
        <section class="stack">
          <h2 class="title-m">Photo</h2>
          <PhotoUpload v-model="photoFile" :title="isEditing ? 'Change photo' : 'Upload photo'"
            :subtitle="isEditing ? 'Original photo will be replaced' : 'Drag & drop or tap to upload'" />
        </section>

        <section class="stack">
          <h2 class="title-m">Basic info</h2>

          <FormField label="Name / description">
            <input v-model="item.name" type="text" placeholder="e.g. Wool blazer" required
              :maxlength="fieldLimits.itemName" />
          </FormField>

          <FormField label="Brand">
            <input v-model="item.brand" type="text" placeholder="e.g. COS" :maxlength="fieldLimits.brand" />
          </FormField>

          <FormField label="Category">
            <select v-model="item.category" required>
              <option value="" disabled>Select category</option>
              <option v-for="category in clothingOptions" :key="category">{{ category }}</option>
              <optgroup label="Accessories">
                <option v-for="accessory in accessoryOptions" :key="accessory">{{ accessory }}</option>
              </optgroup>
            </select>
          </FormField>

          <div class="field-row">
            <FormField label="Color">
              <select v-model="item.color">
                <option value="">Select</option>
                <option v-for="color in colorOptions" :key="color">{{ color }}</option>
              </select>
            </FormField>

            <FormField label="Season">
              <select v-model="item.season">
                <option value="">Select</option>
                <option v-for="season in seasonOptions" :key="season">{{ season }}</option>
              </select>
            </FormField>
          </div>
        </section>

        <!-- In the edit design, notes sit in the left column -->
        <section v-if="isEditing" class="stack">
          <h2 class="title-m">Notes & condition</h2>

          <FormField label="Notes">
            <textarea v-model="item.notes" rows="4" placeholder="Add your notes." :maxlength="fieldLimits.notes"></textarea>
          </FormField>
        </section>
      </div>

      <!-- Right column: money, cost per wear, tags (and notes when adding) and the buttons -->
      <div class="item-form-column">
        <section class="stack">
          <h2 class="title-m">Financials</h2>

          <div class="field-row">
            <FormField label="Purchase price">
              <span class="input-icon">
                <span class="input-prefix">{{ getCurrencySymbol(currency) }}</span>
                <input v-model.number="item.price" type="number" min="0" :max="fieldLimits.price" step="0.01" placeholder="0.00" required
                  @wheel="$event.target.blur()" />
              </span>
            </FormField>

            <!-- Read-only: the whole wardrobe uses one currency, chosen in onboarding -->
            <label class="stack-small">
              <span class="field-label">Currency</span>
              <input :value="currency" type="text" readonly />
            </label>
          </div>

          <div class="field-row">
            <FormField label="Date of purchase">
              <input v-model="item.purchaseDate" type="date" :max="todayText()" />
            </FormField>

            <FormField label="Times worn so far">
              <input v-model.number="item.timesWorn" type="number" min="0" :max="fieldLimits.timesWorn" step="1" placeholder="0"
                @wheel="$event.target.blur()" />
            </FormField>
          </div>
        </section>

        <!-- "or 0" because an empty number field is string instead of a number -->
        <CpwCard :label="isEditing ? 'Current cost per wear' : 'Cost per wear'" :price="item.price || 0"
          :times-worn="item.timesWorn || 0" :currency="currency" :goal="goal" />

        <section class="stack">
          <h2 class="title-m">Tags</h2>

          <FormField label="Pick or add tags" group>
            <div class="chips">
              <label v-for="tag in tagOptions" :key="tag" class="chip">
                <input v-model="item.tags" type="checkbox" :value="tag" />
                {{ tag }}
              </label>

              <button v-if="!isAddingTag" type="button" class="chip add-tag" @click="startAddingTag">
                <img :src="plusIcon" alt="" width="16" height="16" />
                Add tag
              </button>
              <!-- Enter or leaving the field adds the tag -->
              <input v-else ref="tagInput" v-model="newTag" type="text" class="tag-input" placeholder="New tag" :maxlength="fieldLimits.tag"
                aria-label="New tag" @keydown.enter.prevent="confirmNewTag" @blur="confirmNewTag" />
            </div>
          </FormField>
        </section>

        <!-- In the add design, notes sit in the right column -->
        <section v-if="!isEditing" class="stack">
          <h2 class="title-m">Notes & condition</h2>

          <FormField label="Notes">
            <textarea v-model="item.notes" rows="4" placeholder="Add your notes." :maxlength="fieldLimits.notes"></textarea>
          </FormField>
        </section>

        <div class="actions">
          <button type="submit" :disabled="isSaving" class="btn btn-primary width-full">
            <template v-if="isSaving">Saving...</template>
            <template v-else>{{ isEditing ? 'Save changes' : 'Save item' }}</template>
          </button>
          <button type="button" class="btn btn-ghost width-full" @click="router.back()">
            Cancel
          </button>
        </div>
      </div>
    </form>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    <UnsavedChangesDialog v-model="isLeaveOpen" @leave="confirmLeave" />

  </div>
</template>

<style scoped>
.item-form-page {
  padding-top: 24px;
  padding-bottom: 80px;
}

.item-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

@media (min-width: 900px) {
  .item-form {
    grid-template-columns: minmax(0, 632fr) minmax(0, 440fr);
    gap: 48px;
    align-items: start;
  }
}

.item-form-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.delete-button {
  margin-left: auto;
}

.add-tag {
  gap: 4px;
  font-family: inherit;
  cursor: pointer;
}

.tag-input {
  width: 140px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
}

.link {
  color: var(--black);
  text-decoration: underline;
}
</style>