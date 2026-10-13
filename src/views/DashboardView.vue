<script setup>
import { useAuth } from "../composables/useAuth";
import Navigation from '../components/Navigation.vue'

const { currentUser, profile, isLoading } = useAuth();
</script>

<template>
<Navigation />
  <main>
    <h1>Dashboard</h1>

    <p v-if="isLoading">Loading your account...</p>

    <section v-else>
      <p>Welcome, {{ profile?.username || currentUser?.displayName || "there" }}.</p>
      <p><strong>Email:</strong> {{ currentUser?.email || "Not available" }}</p>
      <p><strong>Role:</strong> {{ profile?.role || "user" }}</p>
    </section>
  </main>
</template>