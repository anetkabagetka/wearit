<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Shows one photo at a time and fades to the next one every few seconds.
// After the last photo it starts again with the first one
const props = defineProps({
    images: { type: Array, required: true }, // The photos, e.g. [hero1, hero2] imported in the page
    alt: { type: String, default: '' },
    seconds: { type: Number, default: 3 }, // How long each photo stays before the next one fades in
})

// Which photo is shown right now: 0 = the first one
const current = ref(0)
let timer = null

onMounted(() => {
    // setInterval runs the function again and again, every "seconds × 1000" milliseconds.
    // % (remainder) turns "one after the last photo" back into 0, the first photo
    timer = setInterval(() => {
        current.value = (current.value + 1) % props.images.length
    }, props.seconds * 1000)
})

// Stop the timer when leaving the page, otherwise it keeps running in the background
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>

<template>
    <!-- All photos are on the page at once, stacked on top of each other.
         Only the current one is visible, so switching is just a fade, with nothing to load -->
    <div class="hero-slideshow">
        <img v-for="(image, index) in images" :key="image" :src="image" :alt="index === current ? alt : ''"
            class="hero-slide" :class="{ 'hero-slide-shown': index === current }" />
    </div>
</template>

<style scoped>
/* position: relative lets the photos stack inside it */
.hero-slideshow {
    position: relative;
    width: 100%;
    aspect-ratio: 528 / 520;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--light-gray);
}

/* all photos fill the whole square and start invisible */
.hero-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.6s ease;
}

/* current photo fades in, the one before it fades out at the same time */
.hero-slide-shown {
    opacity: 1;
}

/* people who dont have animations enabled - no transitions */
@media (prefers-reduced-motion: reduce) {
    .hero-slide {
        transition: none;
    }
}
</style>