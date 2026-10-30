<script setup>
import Navigation from '@/components/layout/Navigation.vue'

import { useNotificationSettings } from '@/composables/settings/useNotificationSettings'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import chartIcon from '@/assets/icons/chart.svg'
import starIcon from '@/assets/icons/star.svg'
import mailIcon from '@/assets/icons/mail.svg'
import checkIcon from '@/assets/icons/check.svg'

const { notifications, errorMessage, save, pushStatus, allowPush } = useNotificationSettings()

// The four switches: which choice they change, their text and their icon
const switches = [
  { key: 'unusedItems', label: 'Remind me to wear unused items', icon: shirtIcon },
  { key: 'weeklySummary', label: 'Weekly CPW summary', icon: chartIcon },
  { key: 'goalMilestones', label: 'Goal milestones', icon: starIcon },
  { key: 'productNews', label: 'Product news', icon: mailIcon },
]

// The choices in "Remind me after"
const dayOptions = [14, 30, 60, 90]
</script>

<template>
  <Navigation />
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Notifications</h1>
    </div>

    <div class="notifications-content stack">
      <p class="intro">Gentle nudges that help you wear more of what you own.</p>

      <!-- Push notifications only arrive after this browser allows them -->
      <div v-if="pushStatus !== 'checking'" class="push-box">
        <p v-if="pushStatus === 'granted'" class="push-on">
          <img :src="checkIcon" alt="" width="20" height="20" />
          Notifications are on for this device
        </p>
        <p v-else-if="pushStatus === 'denied'" class="caption">
          Notifications are blocked for this site. Allow them in your browser's site settings, then reload the page.
        </p>
        <p v-else-if="pushStatus === 'unsupported'" class="caption">
          This browser can't show notifications. On an iPhone, add wearit to your Home Screen first.
        </p>
        <button v-else type="button" class="btn btn-primary" @click="allowPush">
          Allow notifications on this device
        </button>
      </div>

      <!-- Every change is saved right away, so there's no Save button -->
      <div>
        <label v-for="item in switches" :key="item.key" class="switch-row">
          <img :src="item.icon" alt="" width="22" height="22" />
          <span class="switch-row-label">{{ item.label }}</span>
          <input v-model="notifications[item.key]" type="checkbox" role="switch" class="switch" @change="save" />
        </label>
      </div>

      <div class="stack-small">
        <label class="stack-small">
          <span class="field-label">Remind me after</span>
          <!-- Only matters while "Remind me to wear unused items" is on -->
          <select v-model.number="notifications.remindAfterDays" :disabled="!notifications.unusedItems" @change="save">
            <option v-for="days in dayOptions" :key="days" :value="days">{{ days }} days unworn</option>
          </select>
        </label>
        <p class="caption">We'll pick the unworn items where one more wear lowers cost per wear the most.</p>
      </div>

      <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </div>
  </main>
</template>

<style scoped>
.settings-subpage {
  padding-top: 24px;
  padding-bottom: 80px;
}

.notifications-content {
  max-width: 560px;
}

.intro {
  color: var(--gray);
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--light-gray);
  color: var(--black);
  cursor: pointer;
}

.switch-row-label {
  flex: 1;
}

/* The on/off switch: a checkbox drawn as a pill with a circle inside.
   appearance: none removes the normal checkbox look, so we can draw our own */
.switch {
  appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background-color: var(--light-gray);
  cursor: pointer;
  transition: background-color 0.2s;
}

/* The white circle */
.switch::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--white);
  transition: transform 0.2s;
}

/* Switched on: black pill, and the circle slides to the right */
.switch:checked {
  background-color: var(--black);
}

.switch:checked::before {
  transform: translateX(18px);
}

.switch:focus-visible {
  outline: 2px solid var(--black);
  outline-offset: 2px;
}

select:disabled {
  color: var(--gray);
}

/* The gray box with the "Allow notifications" button or the status */
.push-box {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--subtle-gray);
}

.push-on {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>