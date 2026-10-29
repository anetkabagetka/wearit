<script setup>
import Navigation from '@/components/Navigation.vue'

import { useThemeSettings } from '@/composables/useThemeSettings'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import sunIcon from '@/assets/icons/sun.svg'
import moonIcon from '@/assets/icons/moon.svg'
import settingsIcon from '@/assets/icons/settings.svg'

const { theme, isSaving, errorMessage, save } = useThemeSettings()

// The three choices: what gets saved, their text and their icon
const themeOptions = [
  { value: 'light', label: 'Light', description: 'Black on white', icon: sunIcon },
  { value: 'dark', label: 'Dark', description: 'White on black, easier at night', icon: moonIcon },
  { value: 'system', label: 'Match system', description: 'Follows your phone setting', icon: settingsIcon },
]
</script>

<template>
  <Navigation />
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Theme</h1>
    </div>

    <form @submit.prevent="save" class="theme-form stack">
      <!-- The same option rows as the goals on onboarding: icon, text, and the radio button on the right -->
      <fieldset class="stack-small">
        <label v-for="option in themeOptions" :key="option.value" class="option-row">
          <img :src="option.icon" alt="" />
          <span class="option-row-text">
            <span class="option-row-label">{{ option.label }}</span>
            <span class="option-row-description">{{ option.description }}</span>
          </span>
          <input v-model="theme" type="radio" name="theme" :value="option.value" />
        </label>
      </fieldset>

      <div class="stack-small">
        <h2 class="title-m">Preview</h2>
        <div class="previews">
          <div class="preview stack-small">
            <div class="preview-box preview-light"></div>
            <span class="caption">Light</span>
          </div>
          <div class="preview stack-small">
            <div class="preview-box preview-dark"></div>
            <span class="caption">Dark</span>
          </div>
        </div>
      </div>

      <button type="submit" :disabled="isSaving" class="btn btn-primary">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>

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
.theme-form {
  max-width: 560px;
}

/* The two boxes side by side, each with its name centred underneath */
.previews {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preview {
  align-items: center;
}

/* Fixed colours on purpose: each box shows its own theme, whichever theme is on.
   The border keeps the black box visible on the dark page */
.preview-box {
  width: 100%;
  height: 200px;
  border: 1px solid var(--light-gray);
  border-radius: 4px;
}

.preview-light {
  background-color: #e4e4e4;
}

.preview-dark {
  background-color: #000;
}
</style>