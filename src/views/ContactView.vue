<script setup>
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'
import FormField from '@/components/FormField.vue'

import { isFormValid } from '@/utils/isFormValid'

import mailIcon from '@/assets/icons/mail.svg'
import chevronRightIcon from '@/assets/icons/chevron-right.svg'

// AI - reactive topic selection for contact form
import { ref } from 'vue'

const topics = ['Account', 'Bug', 'Other']
const name = ref('')
const email = ref('')
const topic = ref('')
const message = ref('')

// The questions in the FAQ, each with its answer
const faq = [
    {
        title: 'How is cost per wear calculated?',
        answer: 'The price divided by how many times you wore it. A €126 blazer worn 30 times costs €126 ÷ 30 = €4.20 per wear, and every wear you log makes it lower. When you sell something, the sale price comes off first: (€126 − €40) ÷ 30 = €2.87.',
    },
    {
        title: 'Is my data private?',
        answer: 'Yes. Your wardrobe is saved in your own account, and the database refuses everyone else. The only exception is the wearit admins, who can see accounts and wardrobes to look after the app.',
    },
    {
        title: 'How do I delete my account?',
        answer: 'Go to Settings → Delete account and confirm with your password (or in a Google window if you log in with Google). Your profile, your wardrobe and all your items are deleted. This can\'t be undone.',
    },
]

const handleSend = (event) => {
    // Stop here if a field is empty or wrong, FormField shows what to fix
    if (!isFormValid(event.target)) {
        return
    }
    // Sending the message is not built yet
}
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

                        <form @submit.prevent="handleSend" class="stack" novalidate>
                            <FormField label="Name">
                                <input v-model="name" type="text" autocomplete="name" placeholder="Your name"
                                    required />
                            </FormField>

                            <FormField label="Email">
                                <span class="input-icon">
                                    <img :src="mailIcon" alt="" />
                                    <input v-model="email" type="email" autocomplete="email"
                                        placeholder="user@example.com" required />
                                </span>
                            </FormField>

                            <!-- AI - topic selection for contact form -->
                            <FormField label="Topic" group>
                                <div class="chips">
                                    <label v-for="item in topics" :key="item" class="chip">
                                        <input v-model="topic" type="radio" name="topic" :value="item" required />
                                        {{ item }}
                                    </label>
                                </div>
                            </FormField>

                            <FormField label="Message">
                                <textarea v-model="message" placeholder="Tell us what's going on..."
                                    required></textarea>
                            </FormField>

                            <button type="submit" class="btn btn-primary">Send message</button>
                        </form>
                    </div>

                    <div class="feature-list">
                        <h1>FAQ</h1>
                        <!-- <details> is built into the browser: clicking its <summary> opens and closes it -->
                        <details v-for="question in faq" :key="question.title" class="faq">
                            <summary class="feature-title">
                                {{ question.title }} <img :src="chevronRightIcon" alt="" class="faq-chevron">
                            </summary>
                            <p class="faq-answer">{{ question.answer }}</p>
                        </details>
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

/* The question is the button that opens the answer */
.faq summary {
    cursor: pointer;
    list-style: none;
}

/* Hides the browser's own small triangle in Safari (list-style: none does it everywhere else) */
.faq summary::-webkit-details-marker {
    display: none;
}

/* The arrow turns down while the answer is open */
.faq[open] .faq-chevron {
    transform: rotate(90deg);
}

.faq-answer {
    padding-top: 12px;
    line-height: 1.5;
}

.stuck-text {
    text-align: center;

    a {
        color: var(--black);
        text-decoration: underline;

    }
}
</style>