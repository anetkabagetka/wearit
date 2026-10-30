<script setup>
import { computed } from "vue";

// The picture of an outfit: the user's own photo of it when there is one,
// otherwise the photos of its first 4 items next to each other.
// 2 items = two columns, 3 = one tall photo and two small ones, 4 or more = 2 × 2
const props = defineProps({
    items: { type: Array, default: () => [] },
    photoUrl: { type: String, default: "" }, // The outfit's own photo
});

const shownItems = computed(() => props.items.slice(0, 4));
</script>

<template>
    <!-- The page that uses it sets the height, e.g. class="outfit-card-photo" -->
    <div v-if="photoUrl" class="collage">
        <img :src="photoUrl" alt="" class="collage-photo" />
    </div>

    <div v-else class="collage" :class="`collage-${shownItems.length}`">
        <template v-for="item in shownItems" :key="item.id">
            <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="collage-photo" />
            <!-- Gray box when the item has no photo -->
            <div v-else class="collage-photo"></div>
        </template>
    </div>
</template>

<style scoped>
/* minmax(0, 1fr): each photo gets an equal share of the box, however big the photo file is.
   With no items picked yet it's just a gray box */
.collage {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    gap: 2px;
    border-radius: 4px;
    background-color: var(--light-gray);
    overflow: hidden;
}

.collage-photo {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background-color: var(--light-gray);
    object-fit: cover;
}

/* The white lines between the photos are the background showing through the gap */
.collage-2,
.collage-3,
.collage-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background-color: var(--white);
}

.collage-3,
.collage-4 {
    grid-template-rows: repeat(2, minmax(0, 1fr));
}

/* With 3 items the first photo is as tall as the other two together */
.collage-3 .collage-photo:first-child {
    grid-row: span 2;
}
</style>