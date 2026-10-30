<script setup>
import { ref } from 'vue'

import Navigation from '@/components/layout/Navigation.vue'
import FormField from '@/components/ui/FormField.vue'
import UnsavedChangesDialog from '@/components/ui/UnsavedChangesDialog.vue'

import { useChangePassword } from '@/composables/settings/useChangePassword'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useAuth } from '@/composables/useAuth'
import { isFormValid } from '@/utils/forms/isFormValid'
import { PASSWORD_HINT, PASSWORD_PATTERN } from '@/utils/forms/passwordRules'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import lockIcon from '@/assets/icons/lock.svg'
import eyeIcon from '@/assets/icons/eye.svg'

const {
  currentPassword,
  newPassword,
  confirmPassword,
  checkPasswordsMatch,
  confirmPasswordError,
  isGoogleAccount,
  isSaving,
  errorMessage,
  successMessage,
  save,
  hasUnsavedChanges,
} = useChangePassword()

// Asks before leaving when there are changes that aren't saved yet
const { isLeaveOpen, confirmLeave } = useUnsavedChanges(hasUnsavedChanges)

// Don't show an old error from another page, e.g. a failed login
useAuth().clearError()

// Each field has its own eye button, like in Figma
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

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
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Change password</h1>
    </div>

    <p v-if="isGoogleAccount" class="password-content">
      You log in with Google, so you don't have a password here. Change it in your Google account.
    </p>

    <form v-else @submit.prevent="handleSave" class="password-content stack" novalidate>
      <p>Pick a password you don't use anywhere else.</p>

      <FormField label="Current password">
        <span class="input-icon">
          <img :src="lockIcon" alt="" />
          <input
            v-model="currentPassword"
            :type="showCurrent ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="input-icon-button"
            :aria-label="showCurrent ? 'Hide password' : 'Show password'"
            @click="showCurrent = !showCurrent"
          >
            <img :src="eyeIcon" alt="" :style="{ opacity: showCurrent ? 1 : 0.4 }" />
          </button>
        </span>
      </FormField>

      <FormField label="New password">
        <span class="input-icon">
          <img :src="lockIcon" alt="" />
          <input
            v-model="newPassword"
            :type="showNew ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            :pattern="PASSWORD_PATTERN"
            :title="PASSWORD_HINT"
          />
          <button
            type="button"
            class="input-icon-button"
            :aria-label="showNew ? 'Hide password' : 'Show password'"
            @click="showNew = !showNew"
          >
            <img :src="eyeIcon" alt="" :style="{ opacity: showNew ? 1 : 0.4 }" />
          </button>
        </span>
      </FormField>

      <div class="stack-small">
        <FormField label="Confirm new password" :error="confirmPasswordError">
          <span class="input-icon">
            <img :src="lockIcon" alt="" />
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              required
              @blur="checkPasswordsMatch = true"
            />
            <button
              type="button"
              class="input-icon-button"
              :aria-label="showConfirm ? 'Hide password' : 'Show password'"
              @click="showConfirm = !showConfirm"
            >
              <img :src="eyeIcon" alt="" :style="{ opacity: showConfirm ? 1 : 0.4 }" />
            </button>
          </span>
        </FormField>
        <p class="caption">8+ characters, including a number and a symbol. Both new passwords must match.</p>
      </div>

      <button type="submit" :disabled="isSaving" class="btn btn-primary">
        {{ isSaving ? 'Updating...' : 'Update password' }}
      </button>

      <p v-if="successMessage" class="caption" role="status">{{ successMessage }}</p>
      <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </form>
    <UnsavedChangesDialog v-model="isLeaveOpen" @leave="confirmLeave" />

  </main>
</template>

<style scoped>
.settings-subpage {
  padding-top: 24px;
  padding-bottom: 80px;
}

/* In Figma the content is 560px wide and sits on the left */
.password-content {
  max-width: 560px;
}
</style>
