<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
import FormField from '@/components/ui/FormField.vue'

import { useAuth } from '@/composables/useAuth'
import { isFormValid } from '@/utils/forms/isFormValid'

import mailIcon from '@/assets/icons/mail.svg'

const router = useRouter();

const email = ref("");
const isSending = ref(false);

const { errorMessage, resetPassword, clearError } = useAuth();

// Don't show an old error from another page, e.g. a failed login
clearError();

const handleReset = async (event) => {
    // Stop here if the email is empty or wrong, FormField shows what to fix
    if (!isFormValid(event.target)) {
        return;
    }

    isSending.value = true;

    try {
        await resetPassword(email.value);
        await router.push({ name: "check-email" });
    } catch {
        // Error is already exposed by useAuth.
    } finally {
        isSending.value = false;
    }
};
</script>

<template>
    <Navigation />
    <main>
        <section class="section">
            <div class="container container-narrow stack">
                <h1>Reset Password</h1>
                <p>Enter the email you signed up with and we'll send you a link to set a new password.</p>

                <form @submit.prevent="handleReset" class="stack" novalidate>
                    <FormField label="Email">
                        <span class="input-icon">
                            <img :src="mailIcon" alt="" />
                            <input v-model="email" type="email" autocomplete="email" placeholder="user@example.com"
                                required />
                        </span>
                    </FormField>

                    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

                    <button type="submit" :disabled="isSending" class="btn btn-primary">
                        {{ isSending ? "Sending reset link..." : "Send reset link" }}
                    </button>
                    <RouterLink :to="{ name: 'login' }" class="btn btn-secondary">Back to log in</RouterLink>
                </form>
            </div>
        </section>
    </main>
    <Footer />
</template>
