<script setup>
import { computed } from 'vue'

import Navigation from '@/components/Navigation.vue'
import ListRow from '@/components/ListRow.vue'

import { useSettings } from '@/composables/useSettings'
import { formatMoney, getCurrencySymbol } from '@/utils/formatMoney'
import { getInitials } from '@/utils/getInitials'

import userIcon from '@/assets/icons/user.svg'
import lockIcon from '@/assets/icons/lock.svg'
import trashIcon from '@/assets/icons/trash.svg'
import moneyIcon from '@/assets/icons/money.svg'
import bellIcon from '@/assets/icons/bell.svg'
import sunIcon from '@/assets/icons/sun.svg'
import logOutIcon from '@/assets/icons/log-out.svg'

const {
  profile,
  userEmail,
  currency,
  itemCount,
  averageCpw,
  isLoading,
  errorMessage,
  handleLogout,
} = useSettings()

// Username, or the part of the email before "@" if there is no username
const displayName = computed(() => profile.value?.username || userEmail.value.split('@')[0])

// e.g. "124 items · €6.85 avg per wear"
const statsText = computed(() => {
  const items = `${itemCount.value} ${itemCount.value === 1 ? 'item' : 'items'}`
  return `${items} · ${formatMoney(averageCpw.value, currency.value)} avg per wear`
})

// e.g. "EUR €"
const currencyText = computed(() => `${currency.value} ${getCurrencySymbol(currency.value)}`)

// The Notifications and Theme pages save these on the user profile.
// Until a choice is saved, notifications are on and the theme is light
const notificationsText = computed(() => (profile.value?.notifications === false ? 'Off' : 'On'))
const themeText = computed(() => (profile.value?.theme === 'dark' ? 'Dark' : 'Light'))
</script>

<template>
  <Navigation />
  <main class="container settings-page stack">
    <h1 class="settings-title">Settings</h1>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

    <!-- Two columns on wide screens, one column on phones -->
    <div class="settings-columns">
      <!-- Left column: profile card -->
      <section class="profile-card" aria-label="Your profile">
        <span class="profile-avatar">{{ getInitials(displayName) }}</span>

        <div class="profile-details">
          <div class="profile-text">
            <span class="profile-name">{{ displayName }}</span>
            <span class="caption">{{ userEmail }}</span>
            <span class="caption">{{ isLoading ? 'Loading your wardrobe...' : statsText }}</span>
          </div>

          <RouterLink :to="{ name: 'settings-edit-profile' }" class="btn btn-secondary profile-button">
            Edit profile
          </RouterLink>
        </div>
      </section>

      <!-- Right column: the settings lists -->
      <div class="settings-lists">
        <section class="settings-group">
          <h2 class="settings-group-label">Account</h2>
          <ListRow :icon="userIcon" label="Edit profile" :to="{ name: 'settings-edit-profile' }" />
          <ListRow :icon="lockIcon" label="Change password" :to="{ name: 'settings-change-password' }" />
          <ListRow :icon="trashIcon" label="Delete account" :to="{ name: 'settings-delete-account' }" />
        </section>

        <section class="settings-group">
          <h2 class="settings-group-label">Preferences</h2>
          <ListRow :icon="moneyIcon" label="Currency" :value="currencyText" :to="{ name: 'settings-currency' }" />
          <ListRow
            :icon="bellIcon"
            label="Notifications"
            :value="notificationsText"
            :to="{ name: 'settings-notifications' }"
          />
          <ListRow :icon="sunIcon" label="Theme" :value="themeText" :to="{ name: 'settings-theme' }" />
        </section>

        <ListRow :icon="logOutIcon" label="Log out" @click="handleLogout" />

        <p class="caption app-version">wearit 1.0 · Wear more, buy better</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.settings-page {
  padding-top: 24px;
  padding-bottom: 80px;
}

.settings-title {
  font-size: 24px;
}

.settings-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

@media (min-width: 900px) {
  .settings-columns {
    grid-template-columns: minmax(0, 360fr) minmax(0, 712fr);
    gap: 48px;
    align-items: start;
  }
}

.profile-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--light-gray);
  border-radius: 16px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: var(--light-gray);
  font-family: var(--font-title);
  font-size: 24px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.profile-name {
  font-family: var(--font-title);
  font-size: 18px;
}

.profile-button {
  font-size: 13px;
}

.settings-lists {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-group {
  display: flex;
  flex-direction: column;
}

.settings-group-label {
  margin-bottom: 8px;
  font-family: var(--font-text);
  font-size: 11px;
  font-weight: normal;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--gray);
}

.app-version {
  text-align: center;
}
</style>