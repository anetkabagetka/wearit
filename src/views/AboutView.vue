<script setup>
import Navigation from "@/components/Navigation.vue";
import Footer from "@/components/Footer.vue";

import aboutBanner from "@/assets/about_hero.jpg";

import plusIcon from "@/assets/icons/plus.svg";
import shirtIcon from "@/assets/icons/shirt.svg";
import chartIcon from "@/assets/icons/chart.svg";
import leafIcon from "@/assets/icons/leaf.svg";
import lockIcon from "@/assets/icons/lock.svg";
import moneyIcon from "@/assets/icons/money.svg";
</script>

<template>
    <Navigation />
    <main>
        <img :src="aboutBanner" alt="About Us" class="about-banner">

        <section class="section">
            <div class="container stack">
                <h3>OUR MISSION</h3>
                <h1>Clothes are made to be worn</h1>
                <p>
                    Most of us wear a small part of our wardrobe most of the time.
                    We show what each piece really costs you every time you wear it,
                    so you can buy less, choose better and keep clothes in use for longer.
                </p>
            </div>
        </section>

        <section class="section section-muted">
            <div class="container stack">
                <h3>HOW IT WORKS</h3>

                <div class="split split-top">
                    <div class="stack">
                        <h1>Cost per wear, explained</h1>
                        <p>
                            Divide what you paid by the number of times you wore it.
                            The more you wear something, the better value it becomes.
                        </p>
                    </div>

                    <div class="feature-list">
                        <div class="feature">
                            <div class="feature-icon">
                                <img :src="plusIcon" alt="Plus Icon">
                            </div>
                            <div class="feature-text">
                                <h4>1. Add what you own</h4>
                                <p>Enter the price you paid, even for pieces you bought years ago.</p>
                            </div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">
                                <img :src="shirtIcon" alt="Shirt Icon">
                            </div>
                            <div class="feature-text">
                                <h4>2. Log every wear</h4>
                                <p>One tap each time you put something on.</p>
                            </div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">
                                <img :src="chartIcon" alt="Chart Icon">
                            </div>
                            <div class="feature-text">
                                <h4>3. Watch your CPW drop</h4>
                                <p>Every wear lowers the cost. Set a goal and see how many wears are left.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container stack">
                <h3>OUR VALUES</h3>

                <div class="split split-top">
                    <div class="stack">
                        <h1>Simple app, simple principles</h1>
                    </div>

                    <div class="feature-list">
                        <h4 class="feature-title">
                            <img :src="leafIcon" alt="Leaf Icon"> Wear what you already own
                        </h4>
                        <h4 class="feature-title">
                            <img :src="lockIcon" alt="Lock Icon"> Your wardrobe data stays private
                        </h4>
                        <h4 class="feature-title">
                            <img :src="moneyIcon" alt="Money Icon"> No ads, no affiliate links
                        </h4>
                    </div>
                </div>
            </div>
        </section>

        <section class="section section-muted">
            <div class="container container-narrow stack">
                <h1>Ready to see your real costs?</h1>
                <p>Free to start. Add your first item in under a minute.</p>
                <div class="actions">
                    <RouterLink to="/signup" class="btn btn-primary width-full">Create free account</RouterLink>
                </div>
            </div>
        </section>
    </main>
    <Footer />
</template>

<style scoped>
.about-banner {
    width: 100%;
    height: 330px;
    display: block;
    object-fit: cover;
}
</style>
