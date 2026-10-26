<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import Navigation from '@/components/Navigation.vue'
import FormField from '@/components/FormField.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'
import CpwCard from '@/components/CpwCard.vue'

import { useAddItem } from '@/composables/useAddItem'
import { isFormValid } from '@/utils/isFormValid'
import { getCurrencySymbol } from '@/utils/formatMoney'
import { categoryOptions, colorOptions, seasonOptions } from '@/utils/itemOptions'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import plusIcon from '@/assets/icons/plus.svg'

const router = useRouter()

const { item, photoFile, currency, goal, tagOptions, isSaving, errorMessage, addTag, save } =
  useAddItem()

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
  <Navigation />
  <main class="container add-item-page stack">
    <div class="top-bar">
      <button type="button" class="back-button" aria-label="Back" @click="router.back()">
        <img :src="chevronLeftIcon" alt="" />
      </button>
      <h1 class="title-m">Add item</h1>
    </div>

    <!-- Two columns on wide screens (like the desktop Figma), one column on phones -->
    <form @submit.prevent="handleSave" class="add-item-form" novalidate>
      <!-- Left column: photo and basic info -->
      <div class="add-item-column">
        <section class="stack">
          <h2 class="title-m">Photo</h2>
          <PhotoUpload
            v-model="photoFile"
            title="Upload photo"
            subtitle="Drag & drop or tap to upload"
          />
        </section>

        <section class="stack">
          <h2 class="title-m">Basic info</h2>

          <FormField label="Name / description">
            <input v-model="item.name" type="text" placeholder="e.g. Wool blazer" required />
          </FormField>

          <FormField label="Brand">
            <input v-model="item.brand" type="text" placeholder="e.g. COS" />
          </FormField>

          <FormField label="Category">
            <select v-model="item.category" required>
              <option value="" disabled>Select category</option>
              <option v-for="category in categoryOptions" :key="category">{{ category }}</option>
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
      </div>

      <!-- Right column: money, cost per wear, tags, notes and the buttons -->
      <div class="add-item-column">
        <section class="stack">
          <h2 class="title-m">Financials</h2>

          <div class="field-row">
            <FormField label="Purchase price">
              <span class="input-icon">
                <span class="input-prefix">{{ getCurrencySymbol(currency) }}</span>
                <input
                  v-model.number="item.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  @wheel="$event.target.blur()"
                />
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
              <input v-model="item.purchaseDate" type="date" />
            </FormField>

            <FormField label="Times worn so far">
              <input
                v-model.number="item.timesWorn"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                @wheel="$event.target.blur()"
              />
            </FormField>
          </div>
        </section>

        <!-- "|| 0" because an empty number field is "" instead of a number -->
        <CpwCard
          :price="item.price || 0"
          :times-worn="item.timesWorn || 0"
          :currency="currency"
          :goal="goal"
        />

        <section class="stack">
          <h2 class="title-m">Tags</h2>

          <FormField label="Pick or add tags" group>
            <div class="chips">
              <label v-for="tag in tagOptions" :key="tag" class="chip">
                <input v-model="item.tags" type="checkbox" :value="tag" />
                {{ tag }}
              </label>

              <button
                v-if="!isAddingTag"
                type="button"
                class="chip add-tag"
                @click="startAddingTag"
              >
                <img :src="plusIcon" alt="" width="16" height="16" />
                Add tag
              </button>
              <!-- Enter or leaving the field adds the tag -->
              <input
                v-else
                ref="tagInput"
                v-model="newTag"
                type="text"
                class="tag-input"
                placeholder="New tag"
                aria-label="New tag"
                @keydown.enter.prevent="confirmNewTag"
                @blur="confirmNewTag"
              />
            </div>
          </FormField>
        </section>

        <section class="stack">
          <h2 class="title-m">Notes & condition</h2>

          <FormField label="Notes">
            <textarea v-model="item.notes" rows="4" placeholder="Add your notes."></textarea>
          </FormField>
        </section>

        <div class="actions">
          <button type="submit" :disabled="isSaving" class="btn btn-primary width-full">
            {{ isSaving ? 'Saving...' : 'Save item' }}
          </button>
          <button type="button" class="btn btn-ghost width-full" @click="router.back()">
            Cancel
          </button>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
      </div>
    </form>
  </main>
</template>

<style scoped>
.add-item-page {
  padding-top: 24px;
  padding-bottom: 80px;
}

.add-item-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

/* Side by side from 900px: left column 632px and right column 440px wide in Figma, 48px apart */
@media (min-width: 900px) {
  .add-item-form {
    grid-template-columns: minmax(0, 632fr) minmax(0, 440fr);
    gap: 48px;
    align-items: start;
  }
}

.add-item-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
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
</style>
