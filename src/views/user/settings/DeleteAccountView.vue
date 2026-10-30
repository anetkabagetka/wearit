<script setup>
import { computed, ref } from 'vue'

import Navigation from '@/components/layout/Navigation.vue'
import FormField from '@/components/ui/FormField.vue'

import { useDeleteAccount } from '@/composables/settings/useDeleteAccount'
import { isFormValid } from '@/utils/forms/isFormValid'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import infoIcon from '@/assets/icons/info.svg'
import lockIcon from '@/assets/icons/lock.svg'
import eyeIcon from '@/assets/icons/eye.svg'
import trashIcon from '@/assets/icons/trash.svg'

const {
  confirmText,
  password,
  itemCount,
  wearCount,
  isGoogleAccount,
  isDeleting,
  errorMessage,
  deleteAccount,
} = useDeleteAccount()

const showPassword = ref(false)

// e.g. "your 124 items and 625 logged wears"
const warningText = computed(() => {
  const items = `${itemCount.value} ${itemCount.value === 1 ? 'item' : 'items'}`
  const wears = `${wearCount.value} logged ${wearCount.value === 1 ? 'wear' : 'wears'}`
  return `This deletes your ${items} and ${wears} permanently, including all cost-per-wear history.`
})

const handleDelete = (event) => {
  // Stop here if "DELETE" or the password is missing, FormField shows what to fix
  if (!isFormValid(event.target)) {
    return
  }
  deleteAccount()
}
</script>

<template>
  <Navigation />
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Delete account</h1>
    </div>

    <form @submit.prevent="handleDelete" class="delete-content stack" novalidate>
      <div class="callout" role="note">
        <div class="callout-header">
          <img :src="infoIcon" alt="" width="20" height="20" />
          <strong class="callout-title">This is permanent</strong>
        </div>
        <p class="callout-body">{{ warningText }}</p>
      </div>

      <!-- pattern="DELETE" only accepts exactly DELETE, in capital letters -->
      <FormField label="Type DELETE to confirm">
        <input
          v-model="confirmText"
          type="text"
          placeholder="DELETE"
          autocomplete="off"
          required
          pattern="DELETE"
          title="Type DELETE in capital letters to confirm."
        />
      </FormField>

      <!-- Google accounts confirm in a Google window instead -->
      <FormField v-if="!isGoogleAccount" label="Password">
        <span class="input-icon">
          <img :src="lockIcon" alt="" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            class="input-icon-button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <img :src="eyeIcon" alt="" :style="{ opacity: showPassword ? 1 : 0.4 }" />
          </button>
        </span>
      </FormField>
      <p v-else class="caption">You'll confirm with Google in a pop-up window.</p>

      <div class="actions">
        <button type="submit" :disabled="isDeleting" class="btn btn-primary width-full delete-button">
          <img :src="trashIcon" alt="" width="20" height="20" />
          {{ isDeleting ? 'Deleting...' : 'Delete my account' }}
        </button>
        <RouterLink :to="{ name: 'settings' }" class="btn btn-secondary width-full">Cancel</RouterLink>
      </div>

      <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </form>
  </main>
</template>

<style scoped>
.settings-subpage {
  padding-top: 24px;
  padding-bottom: 80px;
}

/* In Figma the content is 560px wide and sits on the left */
.delete-content {
  max-width: 560px;
  gap: 24px;
}

/* Gray warning box */
.callout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--subtle-gray);
}

.callout-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.callout-title {
  font-family: var(--font-title);
  font-size: 15px;
  font-weight: normal;
}

.callout-body {
  font-size: 13px;
  color: var(--gray);
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.delete-button img {
  filter: var(--icon-on-black-filter);
}
</style>
