<script setup>
import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'

import mailIcon from '@/assets/icons/mail.svg'
</script>

<template>
    <Navigation />
    <main>
        <section class="section">
            <div class="container container-narrow stack">
                <div class="icon">
                    <img :src="mailIcon" alt="" />
                </div>
                <h1>Check your email</h1>
                <!-- Firebase doesn't tell us if the account exists, so we say "if" -->
                <p>
                    If an account exists for that email, we've sent a reset link.
                    The link works for 1 hour. Check your spam folder if you don't see it.
                </p>

                <div class="stack check-email-actions">
                    <RouterLink :to="{ name: 'login' }" class="btn btn-primary">Back to log in</RouterLink>
                </div>
                <p class="resend-text">Didn't get it? <RouterLink :to="{ name: 'reset-password' }" class="link">Send it again
                    </RouterLink>
                </p>
            </div>
        </section>
    </main>
    <Footer />
</template>

<style scoped>
.check-email-actions {
   margin-top: 24px;
}

.resend-text {
    text-align: center;
    margin-top: 16px;
}

.link {
    color: var(--black);
    text-decoration: underline;
    text-align: center;
}

h1, p {
    text-align: center;
}

.icon {
    display: flex;
    justify-content: center;
    background-color: var(--light-gray);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin: 0 auto;
    padding: 16px;
}
</style>