<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Navigation from '@/components/Navigation.vue'
import StepProgress from '@/components/StepProgress.vue'

import { useAuth } from '@/composables/useAuth'

import mailIcon from '@/assets/icons/mail.svg'
import lockIcon from '@/assets/icons/lock.svg'
import eyeIcon from '@/assets/icons/eye.svg'
import userIcon from '@/assets/icons/user.svg'

const router = useRouter();

const username = ref("");
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
        await signup(email.value, password.value, username.value);
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
        <section class="section">
            <div class="container container-narrow stack">
                <StepProgress :current="1" />
                <p>Step 1 of 4</p>
                <h1>Create your account</h1>
                <p>Track what every piece in your wardrobe really costs, one wear at a time.</p>

                <form @submit.prevent="handleSignup" class="stack">
                    <label class="stack-small">
                        Email
                        <span class="input-icon">
                            <img :src="mailIcon" alt="" />
                            <input v-model="email" type="email" autocomplete="email" placeholder="user@example.com"
                                required />
                        </span>
                    </label>

                    <label class="stack-small">
                        Username
                        <span class="input-icon">
                            <img :src="userIcon" alt="" />
                            <input v-model="username" type="text" autocomplete="username" placeholder="User123"
                                required />
                        </span>
                    </label>

                    <label class="stack-small">
                        Password
                        <span class="input-icon">
                            <img :src="lockIcon" alt="" />
                            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password" placeholder="Enter your password" required />
                            <button type="button" class="input-icon-button" @click="showPassword = !showPassword"
                                :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                <img :src="eyeIcon" alt="" :style="{ opacity: showPassword ? 1 : 0.4 }" />
                            </button>
                        </span>
                    </label>

                    <label class="stack-small">
                        Confirm password
                        <span class="input-icon">
                            <img :src="lockIcon" alt="" />
                            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password" placeholder="Repeat your password" required />
                            <button type="button" class="input-icon-button" @click="showPassword = !showPassword"
                                :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                <img :src="eyeIcon" alt="" :style="{ opacity: showPassword ? 1 : 0.4 }" />
                            </button>
                        </span>
                    </label>
                    <p>Use at least 8 characters, including a number and a symbol.</p>

                    <button type="submit" :disabled="isLoading" class="btn btn-primary">
                        {{ isLoading ? "Creating account..." : "Create account" }}
                    </button>
                </form>

                <div class="or">
                    <span>&nbsp;&nbsp;or&nbsp;&nbsp;</span>
                </div>

                <button type="button" @click="handleGoogleSignup" :disabled="isLoading" class="btn btn-secondary">
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

                <p class="already-have-account">Already have an account? <RouterLink :to="{ name: 'login' }"
                        class="link">Log in
                    </RouterLink>
                </p>
            </div>
        </section>
    </main>
</template>

<style scoped>
.btn-primary {
    margin-top: 16px;
}

.already-have-account {
    text-align: center;
    margin-top: 16px;
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

.link {
    color: var(--black);
    text-decoration: underline;
}
</style>