<script setup>
import { RouterLink } from "vue-router";

import { useAuth } from "../composables/useAuth";

const {
  isSignedIn,
  isAdmin,
  profile,
  logout,
} = useAuth();
</script>

<template>
  <header>
    <nav>
      <h1>wearit</h1>

      <RouterLink to="/about-us">About us</RouterLink>
      <RouterLink to="/support-contact">
        Support / Contact
      </RouterLink>
    </nav>

    <div class="auth-links">
      <template v-if="!isSignedIn">
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/signup">Sign up</RouterLink>
      </template>

      <template v-else>
        <span v-if="profile?.username">
          {{ profile.username }}
        </span>

        <RouterLink to="/dashboard">
            Dashboard
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin">
          Admin
        </RouterLink>

        <button type="button" @click="logout">
          Log out
        </button>
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