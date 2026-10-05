<template>
  <main>
    <h1>Login</h1>
    <p>Optimized version with service and composable separation.</p>

    <!-- step 2 : HTML for the signed-out state -->
    <form v-if="!isSignedIn" @submit.prevent="login">
      <label>
        Email
        <input v-model="email" type="email" />
      </label>

      <label>
        Password
        <input v-model="password" type="password" />
      </label>

      <button type="submit" :disabled="isLoading">Sign in</button>
    </form>

    <!-- step 3 : HTML for the signed-in state -->
    <section v-else>
      <p>Signed in as {{ userEmail }}</p>
      <button type="button" @click="logout" :disabled="isLoading">Sign out</button>
    </section>

    <!-- step 4 : show the Firebase error message when something fails -->
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </main>
</template>

<script setup>
import { useAuth } from "../composables/useAuth";

// step 1 : import the auth composable
const { email, password, isSignedIn, userEmail, isLoading, errorMessage, login, logout } = useAuth();
</script>