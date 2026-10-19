<script setup>
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

import mailIcon from '@/assets/icons/mail.svg'
</script>

<template>
    <Navigation />
    <main>
        <section class="section">
            <div class="container container-narrow stack">
                <h1>Reset Password</h1>
                <p>Enter the email you signed up with and we'll send you a link to set a new password.</p>

                <form class="stack">
                    <label class="stack-small">
                        Email
                        <span class="input-icon">
                            <img :src="mailIcon" alt="" />
                            <input v-model="email" type="email" autocomplete="email" placeholder="user@example.com"
                                required />
                        </span>
                    </label>

                    <button type="submit" :disabled="isLoading" class="btn btn-primary">
                        {{ isLoading ? "Sending reset link..." : "Send reset link" }}
                    </button>
                    <RouterLink :to="{ name: 'login' }" class="btn btn-secondary">Back to log in</RouterLink>
                </form>
            </div>
        </section>
    </main>
    <Footer />
</template>
