<template>
  <main>
    <h1>Admin</h1>

    <p v-if="isLoading">
      Loading users...
    </p>

    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <button type="button" @click="loadUsers" :disabled="isLoading">
      Reload users
    </button>

    <ul v-if="!isLoading">
      <li v-for="user in users" :key="user.id">
        <strong>
          {{ user.username || "No username" }}
        </strong>

        <span>
          {{ user.id }}
        </span>

        <span>
          {{ user.role }}
        </span>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { useAdminUsers } from "../composables/useAdminUsers";

const {
  users,
  isLoading,
  errorMessage,
  loadUsers,
} = useAdminUsers();
</script>