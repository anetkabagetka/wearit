<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Navigation from '../components/Navigation.vue'

import { useAuth } from "../composables/useAuth";

const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const localErrorMessage = ref("");

const {
    isLoading,
    errorMessage,
    signup,
    loginWithGoogle,
} = useAuth();

const handleSignup = async () => {
    localErrorMessage.value = "";

    if (password.value !== confirmPassword.value) {
        localErrorMessage.value = "Passwords do not match.";
        return;
    }

    try {
        await signup(email.value, password.value);
        await router.push({ name: "dashboard" });
    } catch {
        // Error is already exposed by useAuth.
    }
};

const handleGoogleSignup = async () => {
    try {
        await loginWithGoogle();
        await router.push({ name: "dashboard" });
    } catch {
        // Error is already exposed by useAuth.
    }
};
</script>

<template>
    <Navigation />
    <main>
        <h1>Create account</h1>

        <form @submit.prevent="handleSignup">
            <label>
                Email
                <input v-model="email" type="email" autocomplete="email" required />
            </label>

            <label>
                Password
                <input v-model="password" type="password" autocomplete="new-password" required />
            </label>

            <label>
                Confirm password
                <input v-model="confirmPassword" type="password" autocomplete="new-password" required />
            </label>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? "Creating account..." : "Create account" }}
            </button>
        </form>

        <button type="button" @click="handleGoogleSignup" :disabled="isLoading">
            Continue with Google
        </button>
        <!-- Display error messages from the local state if any -->
        <p v-if="localErrorMessage">
            {{ localErrorMessage }}
        </p>
        <!-- Display error messages from google login if any -->
        <p v-if="errorMessage">
            {{ errorMessage }}
        </p>

        <RouterLink :to="{ name: 'login' }">
            Already have an account? Login
        </RouterLink>
    </main>
</template>