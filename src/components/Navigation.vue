<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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
// Logs out, then goes to the landing page without reloading the app
const handleLogout = async () => {
  await logout();
  router.push({ name: "landing" });
};
</script>
<template>
  <header>
    <div class="container header-inner">
      <nav>
        <RouterLink to="/" class="logo">
          <img :src="logo" alt="WearIt logo" />
        </RouterLink>
        <template v-if="isSignedIn">
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
          <RouterLink to="/about-us">About us</RouterLink>
          <RouterLink to="/support-contact">Support / Contact</RouterLink>
        </template>
      </nav>
      <div class="auth-links">
        <template v-if="isSignedIn">
          <button type="button" @click="handleLogout" class="btn btn-primary">
            Add item
          </button>
          <RouterLink to="/profile" class="profile-link-name">{{ displayName }}</RouterLink>
          <button type="button" @click="handleLogout" class="btn btn-secondary">
            Log out
          </button>
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

.profile-link-name {
  font-weight: bold;
  text-decoration: none;
  color: var(--black);
}
</style>