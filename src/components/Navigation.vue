<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { useAuth } from "@/composables/useAuth";

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
    <nav>
      <RouterLink to="/" class="logo">wearit</RouterLink>

      <template v-if="isSignedIn">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/about-us">About us</RouterLink>
        <RouterLink to="/support-contact">Support / Contact</RouterLink>
      </template>
    </nav>

    <div class="auth-links">
      <template v-if="isSignedIn">
        <RouterLink to="/profile">{{ displayName }}</RouterLink>

        <button type="button" @click="handleLogout">
          Log out
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/signup">Sign up</RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

nav {
  display: flex;
  align-items: center;
  gap: 32px;

  a {
    text-decoration: none;
    color: inherit;
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

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>