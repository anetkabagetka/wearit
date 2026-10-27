<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { getInitials } from '@/utils/getInitials'

import logo from '@/assets/wearitlogo.svg'

import homeIcon from '@/assets/icons/home.svg'
import hangerIcon from '@/assets/icons/hanger.svg'
import chartIcon from '@/assets/icons/chart.svg'
import settingsIcon from '@/assets/icons/settings.svg'

const router = useRouter();
const {
  isSignedIn,
  isAdmin,
  profile,
  userEmail,
  logout,
} = useAuth();
// Username, or the part of the email before "@" if there is no username
const displayName = computed(
  () => profile.value?.username || userEmail.value.split("@")[0],
);
// The menu that opens when you click your avatar
const { openMenu, toggleMenu, closeMenu } = useDropdown();

// Logs out, then goes to the landing page without reloading the app
const handleLogout = async () => {
  closeMenu();
  await logout();
  router.push({ name: "landing" });
};
</script>
<template>
  <header>
    <div class="container header-inner">
      <nav>
        <template v-if="isSignedIn">
          <img :src="logo" alt="WearIt logo" class="logo" />
          <RouterLink to="/dashboard">
            <img :src="homeIcon" alt="Home" />
            Home
          </RouterLink>
          <RouterLink to="/wardrobe">
            <img :src="hangerIcon" alt="Wardrobe" />
            Wardrobe
          </RouterLink>
          <RouterLink to="/insights">
            <img :src="chartIcon" alt="Insights" />
            Insights
          </RouterLink>
          <RouterLink to="/settings">
            <img :src="settingsIcon" alt="Settings" />
            Settings
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/" class="logo">
            <img :src="logo" alt="WearIt logo" />
          </RouterLink>
          <RouterLink to="/about-us">About us</RouterLink>
          <RouterLink to="/support-contact">Support / Contact</RouterLink>
        </template>
      </nav>
      <div class="auth-links">
        <template v-if="isSignedIn">
          <RouterLink :to="{ name: 'add-item' }" class="btn btn-primary">
            Add item
          </RouterLink>
          <!-- Your avatar opens a small menu. .stop keeps the click from reaching the page,
               which would close the menu again -->
          <div class="menu-wrapper" @click.stop @keydown.esc="closeMenu">
            <button type="button" class="avatar-button" :aria-label="`Account menu for ${displayName}`"
              aria-haspopup="menu" :aria-expanded="openMenu === 'account'" @click="toggleMenu('account')">
              <img v-if="profile?.photoUrl" :src="profile.photoUrl" alt="" class="avatar" />
              <span v-else class="avatar">{{ getInitials(displayName) }}</span>
            </button>

            <div v-if="openMenu === 'account'" class="menu" role="menu">
              <button type="button" role="menuitem" @click="handleLogout">Log out</button>
            </div>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-secondary">Log in</RouterLink>
          <RouterLink to="/signup" class="btn btn-primary">Sign up, it's free</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  border-bottom: 1px solid var(--light-gray);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 24px;
}

nav {
  display: flex;
  align-items: center;
  gap: 32px;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--black);
  }
}

.logo {
  font-family: var(--font-title);
  font-size: 1.5rem;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* The button itself is the 32px gray circle from Figma.
   flex-shrink: 0 stops a full nav from squeezing it into an oval,
   overflow: hidden cuts the photo to the circle,
   appearance: none removes the browser's own button look (e.g. in Safari) */
.avatar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  overflow: hidden;
  appearance: none;
  background-color: var(--light-gray);
  /* Thin gray ring, so the circle shows even when a photo has white edges */
  box-shadow: 0 0 0 1px var(--light-gray);
  cursor: pointer;
}

.avatar-button:focus-visible {
  outline: 2px solid var(--black);
  outline-offset: 2px;
}

/* The photo or the initials fill the whole circle */
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--black);
  font-family: var(--font-text);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  object-fit: cover;
}
</style>