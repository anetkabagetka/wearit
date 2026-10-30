<script setup>
// Gray placeholder shapes shown while a page loads, instead of "Loading...".
// They look roughly like the page that's coming, so it doesn't jump when the data arrives.
// "cards" = a grid of photos (wardrobe), "rows" = a big block and a list (home, insights, admin),
// "detail" = a photo next to text (item and outfit pages, forms)
defineProps({
    variant: { type: String, default: "rows" },
});
</script>

<template>
    <!-- role="status" tells screen readers something is loading; the gray shapes are hidden from them -->
    <div class="skeleton" role="status">
        <span class="visually-hidden">Loading...</span>

        <div v-if="variant === 'cards'" class="skeleton-cards" aria-hidden="true">
            <!-- 10 fills whole rows: 2 rows of 5 on wide screens, 5 rows of 2 on phones -->
            <div v-for="n in 10" :key="n" class="stack-small">
                <div class="bone skeleton-photo"></div>
                <div class="bone skeleton-line"></div>
                <div class="bone skeleton-line short"></div>
            </div>
        </div>

        <div v-else-if="variant === 'detail'" class="skeleton-detail" aria-hidden="true">
            <div class="bone skeleton-photo"></div>
            <div class="stack">
                <div class="bone skeleton-title"></div>
                <div class="bone skeleton-line short"></div>
                <div class="bone skeleton-block"></div>
                <div class="bone skeleton-line"></div>
                <div class="bone skeleton-line"></div>
            </div>
        </div>

        <div v-else class="stack" aria-hidden="true">
            <div class="bone skeleton-block"></div>
            <div v-for="n in 5" :key="n" class="skeleton-row">
                <div class="bone skeleton-thumb"></div>
                <div class="stack-small skeleton-row-text">
                    <div class="bone skeleton-line"></div>
                    <div class="bone skeleton-line short"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* One gray shape. The colour variables work in light and dark mode */
.bone {
    border-radius: 4px;
    background-color: var(--light-gray);
    animation: pulse 1.4s ease-in-out infinite;
}

/* Fades a little in and out, so it's clear something is happening */
@keyframes pulse {
    50% {
        opacity: 0.5;
    }
}

/* People who turned off animations on their device get still shapes */
@media (prefers-reduced-motion: reduce) {
    .bone {
        animation: none;
    }
}

.skeleton-line {
    height: 12px;
    width: 100%;
}

.skeleton-line.short {
    width: 60%;
}

.skeleton-title {
    height: 28px;
    width: 70%;
}

.skeleton-block {
    height: 140px;
    border-radius: 8px;
}

.skeleton-photo {
    aspect-ratio: 3 / 4;
    width: 100%;
}

/* The same grid as the wardrobe: 2 per row on phones, 5 on wide screens */
.skeleton-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

/* Photo and text under each other on phones, side by side on wide screens */
.skeleton-detail {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}

.skeleton-detail .skeleton-photo {
    aspect-ratio: 4 / 3;
}

.skeleton-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.skeleton-thumb {
    flex-shrink: 0;
    width: 48px;
    height: 56px;
}

.skeleton-row-text {
    flex: 1;
}

/* Only for screen readers: the text is there, but takes no space on the page */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

@media (min-width: 768px) {
    .skeleton-cards {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    .skeleton-detail {
        grid-template-columns: 1fr 1fr;
        gap: 64px;
    }
}
</style>
