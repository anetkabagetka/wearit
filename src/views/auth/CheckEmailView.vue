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
                <div class="icon">
                    <img :src="mailIcon" alt="Email icon" />
                </div>
                <h1>Check your email</h1>
                <p>
                    We sent you an email with a link to reset your password. 
                    Please check your inbox and follow the instructions.
                </p>

                <div class="stack check-email-actions">
                    <button type="button" class="btn btn-primary">Open email app</button>
                    <RouterLink :to="{ name: 'login' }" class="btn btn-secondary">Back to log in</RouterLink>
                </div>
                <p class="resend-text">Didn't get it? <RouterLink :to="{ name: 'check-email' }" class="link">Resend
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