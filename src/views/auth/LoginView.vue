<script setup>
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Navigation from '@/components/Navigation.vue'

import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");

const {
    isLoading,
    errorMessage,
    login,
    loginWithGoogle,
} = useAuth();
// Function to determine where to redirect the user after login
const getRedirectTarget = () => {
    // Check if there's a redirect query parameter in the route
    const redirect = route.query.redirect;

    return typeof redirect === "string"
        ? redirect
        : { name: "dashboard" };
};

const handleLogin = async () => {
    try {
        await login(email.value, password.value);
        await router.push(getRedirectTarget());
    } catch {
        // Error is already exposed by useAuth.
    }
};

const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        await router.push(getRedirectTarget());
    } catch {
        // Error is already exposed by useAuth.
    }
};
</script>

<template>
    <Navigation />
    <main>
        <h1>Login</h1>

        <form @submit.prevent="handleLogin">
            <label>
                Email
                <input v-model="email" type="email" autocomplete="email" required />
            </label>

            <label>
                Password
                <input v-model="password" type="password" autocomplete="current-password" required />
            </label>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? "Logging in..." : "Login" }}
            </button>
        </form>

        <button type="button" @click="handleGoogleLogin" :disabled="isLoading">
            Continue with Google
        </button>

        <p v-if="errorMessage">
            {{ errorMessage }}
        </p>

        <RouterLink :to="{ name: 'signup' }">
            Don't have an account? Sign up
        </RouterLink>

        <RouterLink :to="{ name: 'reset-password' }">
            Forgot your password?
        </RouterLink>
    </main>
</template>

