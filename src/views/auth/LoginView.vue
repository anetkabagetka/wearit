<script setup>
import { ref } from "vue"
import { useRoute, useRouter, RouterLink } from "vue-router"

import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
import FormField from '@/components/ui/FormField.vue'

import mailIcon from '@/assets/icons/mail.svg'
import lockIcon from '@/assets/icons/lock.svg'
import eyeIcon from '@/assets/icons/eye.svg'
import logo from '@/assets/wearitlogo.svg'

import { useAuth } from '@/composables/useAuth'
import { isFormValid } from '@/utils/forms/isFormValid'

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

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

const handleLogin = async (event) => {
    // Stop here if a field is empty or wrong, FormField shows what to fix
    if (!isFormValid(event.target)) {
        return;
    }

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
        <section class="section">
            <div class="container container-narrow stack">
                <div class="logo">
                    <img :src="logo" alt="WearIt logo" />
                </div>
                <h1>Welcome back</h1>
                <p>Log in to see your wardrobe and what every piece costs per wear.</p>

                <form @submit.prevent="handleLogin" class="stack" novalidate>
                    <FormField label="Email">
                        <span class="input-icon">
                            <img :src="mailIcon" alt="" />
                            <input v-model="email" type="email" autocomplete="email" placeholder="user@example.com"
                                required />
                        </span>
                    </FormField>

                    <FormField label="Password">
                        <span class="input-icon">
                            <img :src="lockIcon" alt="" />
                            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password" placeholder="Enter your password" required />
                            <button type="button" class="input-icon-button" @click="showPassword = !showPassword"
                                :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                <img :src="eyeIcon" alt="" :style="{ opacity: showPassword ? 1 : 0.4 }" />
                            </button>
                        </span>
                    </FormField>

                    <RouterLink :to="{ name: 'reset-password' }" class="link">
                        Forgot password?
                    </RouterLink>

                    <button type="submit" :disabled="isLoading" class="btn btn-primary">
                        {{ isLoading ? "Logging in..." : "Log in" }}
                    </button>
                </form>

                <div class="or">
                    <span>&nbsp;&nbsp;or&nbsp;&nbsp;</span>
                </div>

                <button type="button" @click="handleGoogleLogin" :disabled="isLoading"
                    class="btn btn-secondary google-login">
                    Continue with Google
                </button>

                <p v-if="errorMessage" class="form-error" role="alert">
                    {{ errorMessage }}
                </p>

                <p class="new-here-text">New here? <RouterLink :to="{ name: 'signup' }" class="link">Create an account
                    </RouterLink>
                </p>
            </div>
        </section>
    </main>
    <Footer />
</template>

<style scoped>
.link {
    color: var(--black);
    text-decoration: underline;
    text-align: right;
}

.google-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.or {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 8px 0;
    color: var(--gray);
}

.or::before,
.or::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--light-gray);
}

.new-here-text {
    text-align: center;
    margin-top: 16px;
}
</style>