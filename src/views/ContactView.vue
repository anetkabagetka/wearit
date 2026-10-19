<script setup>
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

import mailIcon from '@/assets/icons/mail.svg'
import chevronRightIcon from '@/assets/icons/chevron-right.svg'
</script>

<template>
    <Navigation />
    <main>
        <section class="section">
            <div class="container stack">
                <div class="split split-top">
                    <div class="stack">
                        <h1>How can we help?</h1>
                        <p>
                            Questions about cost per wear, your account or a bug?
                            Send us a message and we'll reply within one working day.
                        </p>

                        <form @submit.prevent class="stack">
                            <label class="stack-small">
                                Name
                                <input type="text" placeholder="Your name" required />
                            </label>

                            <label class="stack-small">
                                Email
                                <span class="input-icon">
                                    <img :src="mailIcon" alt="" />
                                    <input v-model="email" type="email" autocomplete="email"
                                        placeholder="user@example.com" required />
                                </span>
                            </label>

                            <label class="stack-small">
                                Message
                                <textarea placeholder="Tell us what's going on..." required></textarea>
                            </label>

                            <button type="submit" class="btn btn-primary">Send message</button>
                        </form>
                    </div>

                    <div class="feature-list">
                        <h1>FAQ</h1>
                        <h4 class="feature-title">
                            How is cost per wear calculated? <img :src="chevronRightIcon" alt="Chevron Right Icon">
                        </h4>
                        <h4 class="feature-title">
                            Is my data private? <img :src="chevronRightIcon" alt="Chevron Right Icon">
                        </h4>
                        <h4 class="feature-title">
                            How do I delete my account? <img :src="chevronRightIcon" alt="Chevron Right Icon">
                        </h4>
                        <p class="stuck-text">Still stuck? Email us at
                            <a href="mailto:support@wardrobe.app">support@wardrobe.app</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <Footer />
</template>

<style scoped>
.feature-title {
    justify-content: space-between;
}

.stuck-text {
    text-align: center;

    a {
        color: var(--black);
        text-decoration: underline;

    }
}
</style>