<script setup>
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'
import CpwCard from '@/components/CpwCard.vue'
import HeroSlideshow from '@/components/HeroSlideshow.vue'

import hero1 from '@/assets/hero-1.webp'
import hero2 from '@/assets/hero-2.webp'
import hero3 from '@/assets/hero-3.webp'
import hero4 from '@/assets/hero-4.webp'
import hero5 from '@/assets/hero-5.webp'
import hero6 from '@/assets/hero-6.webp'
import hero7 from '@/assets/hero-7.webp'

import moneyIcon from '@/assets/icons/money.svg'
import chartIcon from '@/assets/icons/chart.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import leafIcon from '@/assets/icons/leaf.svg'
import starIcon from '@/assets/icons/star.svg'

// The photos on the right of the top section, in the order they're shown
const heroImages = [hero1, hero2, hero3, hero4, hero5, hero6, hero7]
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
            <RouterLink to="/login" class="btn btn-secondary">Log in</RouterLink>
          </div>
          <CpwCard label="Example: wool blazer" :price="126" :times-worn="30"
            formula="€126 blazer ÷ 30 wears = €4.20" />
        </div>

        <HeroSlideshow :images="heroImages" alt="Black and white photo of someone in clothes they love" />
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
        <div class="feature-list reviews">
          <div class="feature">
            <div class="feature-text review">
              <div class="stars">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
              </div>
              <p>
                “My €200 coat is down to €1.60 a wear. The €30 party top I wore once? Still €30.”
              </p>
              <div class="review-person">
                <div class="review-person-icon">
                  HL
                </div>
                <div>
                  <strong>Hannah L.</strong>
                  <p>Tracking 86 items</p>
                </div>
              </div>
            </div>
          </div>
          <div class="feature">
            <div class="feature-text review">
              <div class="stars">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
              </div>
              <p>
                “Seeing the cost per wear drop every time I log keeps me reaching for what I already own.”
              </p>
              <div class="review-person">
                <div class="review-person-icon">
                  JK
                </div>
                <div>
                  <strong>Jonas K.</strong>
                  <p>Average CPW down 38%</p>
                </div>
              </div>
            </div>
          </div>
          <div class="feature">
            <div class="feature-text review">
              <div class="stars">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
                <img :src="starIcon" alt="Star Icon">
              </div>
              <p>
                “I sold 14 things I never wore and stopped impulse buying. My average CPW is €3.10.”
              </p>
              <div class="review-person">
                <div class="review-person-icon">
                  PS
                </div>
                <div>
                  <strong>Petra S.</strong>
                  <p>Tracking 132 items</p>
                </div>
              </div>
            </div>
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

.review-person {
  margin-top: 16px;
  display: flex;
  align-items: center;
}

.review-person-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--light-gray);
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-list {
  gap: 16px;
}

.feature-list.reviews {
  margin-top: 24px;
  flex-direction: row;
}

.feature .stars {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  margin-top: 8px;
}

.feature-text.review {
  background-color: var(--subtle-gray);
  padding: 16px;
  min-width: 33%;
  border-radius: 8px;

  p {
    color: var(--black);
  }
}

.login-link {
  text-align: center;
  color: var(--black);
  text-decoration: none;
}


/* Phones: the three reviews don't fit side by side, so they become a row you swipe sideways.
   overflow-x: auto makes the row scroll, scroll-snap stops each swipe at the start of a review */
@media (max-width: 767px) {
  .feature-list.reviews {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .feature-list.reviews .feature {
    flex: 0 0 80%;
    scroll-snap-align: start;
  }

  .feature-text.review {
    min-width: 0;
    width: 100%;
  }
}
</style>