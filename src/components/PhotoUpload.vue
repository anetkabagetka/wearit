<script setup>
import { onBeforeUnmount, ref, watch } from "vue";

import cameraIcon from "@/assets/icons/camera.svg";

// The chosen photo file (or null). The parent uses it with v-model
const photo = defineModel({ type: File, default: null });

const previewUrl = ref("");
const errorMessage = ref("");

// Largest photo we accept, in megabytes
const MAX_SIZE_MB = 10;

// Makes a temporary local address for the chosen file, so we can show a preview.
// The old address is freed first, so the browser does not keep old photos in memory
watch(
    photo,
    (file) => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
        }
        previewUrl.value = file ? URL.createObjectURL(file) : "";
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
});

const handleChange = (event) => {
    const file = event.target.files[0];
    // Clear the input, so picking the same file again still triggers a change
    event.target.value = "";
    errorMessage.value = "";

    if (!file) {
        return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errorMessage.value = `Please choose a photo smaller than ${MAX_SIZE_MB} MB.`;
        return;
    }

    photo.value = file;
};
</script>

<template>
    <div class="stack-small">
        <label class="photo-upload">
            <input type="file" accept="image/*" class="photo-upload-input" @change="handleChange" />

            <img v-if="previewUrl" :src="previewUrl" alt="Chosen photo" class="photo-upload-preview" />

            <template v-else>
                <img :src="cameraIcon" alt="" width="28" height="28" />
                <span class="photo-upload-title">Add a photo</span>
                <span class="caption">Snap it or upload one from your gallery</span>
            </template>
        </label>

        <button v-if="photo" type="button" class="btn btn-ghost" @click="photo = null">
            Remove photo
        </button>

        <p v-if="errorMessage" class="caption">{{ errorMessage }}</p>
    </div>
</template>

<style scoped>
.photo-upload {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px;
    border: 1px dashed var(--black);
    border-radius: 8px;
    background-color: var(--subtle-gray);
    text-align: center;
    cursor: pointer;
}

.photo-upload:focus-within {
    outline: 2px solid var(--black);
    outline-offset: 2px;
}

.photo-upload-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
}

.photo-upload-title {
    color: var(--black);
    font-weight: 500;
}

.photo-upload-preview {
    width: 100%;
    max-height: 240px;
    object-fit: cover;
    border-radius: 4px;
}
</style>
