<script setup>
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

import heroImage from '@/assets/about_hero.jpg'

import moneyIcon from '@/assets/icons/money.svg'
import chartIcon from '@/assets/icons/chart.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import leafIcon from '@/assets/icons/leaf.svg'
</script>

<template>
  <Navigation />

  <main>
    <section class="section">
      <div class="container split split-center">
        <div class="stack">
          <h3>COST-PER-WEAR TRACKER</h3>
          <h1>Know what every outfit really costs</h1>
          <p>
            Log each wear and watch the price of your clothes drop.
            Buy less, wear more, and see your real cost per wear.
          </p>
          <div class="actions">
            <RouterLink to="/signup" class="btn btn-primary">Get started, it's free</RouterLink>
            <RouterLink to="/about-us" class="btn btn-secondary">Login</RouterLink>
          </div>
        </div>

        <img :src="heroImage" alt="Clothes hanging on a rail" class="split-media">
      </div>
    </section>

    <section class="section section-muted">
      <div class="container">
        <div class="stack">
          <h3>WHY COST PER WEAR</h3>
          <h1>The price tag is only half the story</h1>
          <div class="split landing">
            <div class="feature-list">
              <div class="feature">
                <div class="feature-icon">
                  <img :src="moneyIcon" alt="Money Icon">
                </div>
                <div class="feature-text">
                  <h4>See your real cost per wear</h4>
                  <p>
                    Every wear you log lowers the price of an item.
                    A €126 blazer worn 30 times costs €4.20.
                  </p>
                </div>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <img :src="chartIcon" alt="Chart Icon">
              </div>
              <div class="feature-text">
                <h4>Insights that change how you shop</h4>
                <p>Spot your best value pieces and the ones gathering dust before you buy more.</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <img :src="shirtIcon" alt="Shirt Icon">
              </div>
              <div class="feature-text">
                <h4>Log a wear in two taps</h4>
                <p>Pick what you have on today and tap Log. Your CPW updates instantly.</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">
                <img :src="leafIcon" alt="Leaf Icon">
              </div>
              <div class="feature-text">
                <h4>Buy less, wear more</h4>
                <p>Set a CPW goal and get nudged to wear what you already own.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container stack">
        <h3>TESTIMONIALS</h3>
        <h1>People who wear what they own</h1>
      </div>
    </section>

    <section class="section section-muted">
      <div class="container container-narrow stack">
        <h1>Ready to see your real costs?</h1>
        <p>Free to start. Add your first item in under a minute.</p>
        <div class="actions">
          <RouterLink to="/signup" class="btn btn-primary width-full">Create free account</RouterLink>
          <RouterLink to="/login" class="login-link width-full">I already have an account</RouterLink>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</template>

<style scoped>
.split.landing {
  margin-top: 24px;
}

.login-link {
  text-align: center;
  color: var(--black);
  text-decoration: none;
}
</style>