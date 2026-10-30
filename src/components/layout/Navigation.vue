<script setup>
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { getInitials } from '@/utils/format/getInitials'

import logo from '@/assets/wearitlogo.svg'

import homeIcon from '@/assets/icons/home.svg'
import hangerIcon from '@/assets/icons/hanger.svg'
import chartIcon from '@/assets/icons/chart.svg'
import settingsIcon from '@/assets/icons/settings.svg'
import plusIcon from '@/assets/icons/plus.svg'
import menuIcon from '@/assets/icons/menu.svg'

const route = useRoute();
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
// The menus that open when you click your avatar (wide screens) or ☰ (phones)
const { openMenu, toggleMenu, closeMenu } = useDropdown();

// Logs out, then goes to the landing page without reloading the app
const handleLogout = async () => {
  closeMenu();
  await logout();
  router.push({ name: "landing" });
};

// true when the page you're on belongs to this tab. Each route says its tab in meta.tab (router/index.js),
// so /settings/theme counts as Settings and /item/... as Wardrobe
const isActive = (tab) => route.meta.tab === tab;
</script>
<template>
  <!-- Wide screens: the header at the top, logged in or not -->
  <header class="desktop-header">
    <div class="container header-inner">
      <nav>
        <template v-if="isSignedIn">
          <img :src="logo" alt="WearIt logo" class="logo" />
          <RouterLink to="/dashboard" :class="{ active: isActive('home') }">
            <img :src="homeIcon" alt="Home" />
            Home
          </RouterLink>
          <RouterLink to="/wardrobe" :class="{ active: isActive('wardrobe') }">
            <img :src="hangerIcon" alt="Wardrobe" />
            Wardrobe
          </RouterLink>
          <RouterLink to="/insights" :class="{ active: isActive('insights') }">
            <img :src="chartIcon" alt="Insights" />
            Insights
          </RouterLink>
          <RouterLink to="/settings" :class="{ active: isActive('settings') }">
            <img :src="settingsIcon" alt="Settings" />
            Settings
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" :class="{ active: isActive('admin') }">Admin</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/" class="logo">
            <img :src="logo" alt="WearIt logo" />
          </RouterLink>
          <RouterLink to="/about-us" :class="{ active: isActive('about') }">About us</RouterLink>
          <RouterLink to="/support-contact" :class="{ active: isActive('support') }">
            Contact / Support
          </RouterLink>
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
          <RouterLink to="/signup" class="btn btn-primary">Get started, it's free</RouterLink>
        </template>
      </div>
    </div>
  </header>

  <!-- Phones and tablets, logged out: the logo, Log in, and ☰ with the other links from the header above -->
  <header v-if="!isSignedIn" class="mobile-header">
    <RouterLink to="/" class="logo">
      <img :src="logo" alt="WearIt logo" />
    </RouterLink>

    <div class="mobile-actions">
      <RouterLink to="/login" class="btn btn-secondary">Log in</RouterLink>

      <div class="menu-wrapper" @click.stop @keydown.esc="closeMenu">
        <button type="button" class="menu-button" aria-label="Menu" aria-haspopup="menu"
          :aria-expanded="openMenu === 'site'" @click="toggleMenu('site')">
          <img :src="menuIcon" alt="" width="24" height="24" />
        </button>

        <div v-if="openMenu === 'site'" class="menu" role="menu">
          <RouterLink to="/about-us" role="menuitem" @click="closeMenu">About us</RouterLink>
          <RouterLink to="/support-contact" role="menuitem" @click="closeMenu">Contact / Support</RouterLink>
          <RouterLink to="/signup" role="menuitem" @click="closeMenu">Get started, it's free</RouterLink>
        </div>
      </div>
    </div>
  </header>

  <!-- Phones and tablets, logged in: the tab bar at the bottom of the screen.
       Log out, and Admin for admins, are on the Settings page -->
  <nav v-if="isSignedIn" class="tab-bar" aria-label="Main menu">
    <RouterLink to="/dashboard" class="tab" :class="{ 'tab-active': isActive('home') }">
      <img :src="homeIcon" alt="" width="24" height="24" />
      Home
    </RouterLink>
    <RouterLink to="/wardrobe" class="tab" :class="{ 'tab-active': isActive('wardrobe') }">
      <img :src="hangerIcon" alt="" width="24" height="24" />
      Wardrobe
    </RouterLink>
    <RouterLink :to="{ name: 'add-item' }" class="tab-add" aria-label="Add item">
      <img :src="plusIcon" alt="" width="24" height="24" />
    </RouterLink>
    <RouterLink to="/insights" class="tab" :class="{ 'tab-active': isActive('insights') }">
      <img :src="chartIcon" alt="" width="24" height="24" />
      Insights
    </RouterLink>
    <RouterLink to="/settings" class="tab" :class="{ 'tab-active': isActive('settings') }">
      <img :src="settingsIcon" alt="" width="24" height="24" />
      Settings
    </RouterLink>
  </nav>
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
  gap: 8px;

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--black);
  }
}

/* Space between the logo and the first link's border */
.desktop-header nav .logo {
  margin-right: 24px;
}

/* Header links. The border is see-through, so the links don't move when it turns black */
.desktop-header nav a:not(.logo) {
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
}

/* The link of the page you're on gets a black border */
.desktop-header nav a.active {
  border-color: var(--black);
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

.mobile-header,
.tab-bar {
  display: none;
}

.mobile-header {
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 4px 0 16px;
}

.mobile-header .logo {
  display: flex;
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-actions .btn {
  padding: 8px 16px;
  font-size: 13px;
}

.mobile-header .menu a {
  white-space: nowrap;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

/* Phones, logged in: the tab bar stays at the bottom of the screen while the page scrolls.
   z-index puts it above the page */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  align-items: center;
  gap: 0;
  padding: 4px 8px 8px;
  border-top: 1px solid var(--light-gray);
  background-color: var(--white);
}

.tab-bar .tab {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  height: 52px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray);
}

.tab img {
  opacity: 0.6;
}

.tab-bar .tab-active {
  color: var(--black);
}

.tab-active img {
  opacity: 1;
}

/* The black circle with + in the middle */
.tab-bar .tab-add {
  flex-shrink: 0;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--black);
}

.tab-add img {
  filter: var(--icon-on-black-filter);
}

/* Below 1024px wide (phones and tablets) the header at the top doesn't fit anymore,
   so it's swapped for the phone parts */
@media (max-width: 1023px) {
  .desktop-header {
    display: none;
  }

  .mobile-header,
  .tab-bar {
    display: flex;
  }
}
</style>