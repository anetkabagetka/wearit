<script setup>
import Navigation from '@/components/Navigation.vue'
import FormField from '@/components/FormField.vue'

import { useEditProfile } from '@/composables/useEditProfile'
import { isFormValid } from '@/utils/isFormValid'
import { getInitials } from '@/utils/getInitials'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'
import cameraIcon from '@/assets/icons/camera.svg'
import userIcon from '@/assets/icons/user.svg'
import mailIcon from '@/assets/icons/mail.svg'
import trashIcon from '@/assets/icons/trash.svg'

const {
  username,
  email,
  shownPhoto,
  isGoogleAccount,
  isSaving,
  errorMessage,
  successMessage,
  choosePhoto,
  removePhoto,
  save,
} = useEditProfile()

// The file input gives a list of files, we only need the first one.
// Clearing it lets the user pick the same file again later
const handlePhotoChange = (event) => {
  choosePhoto(event.target.files[0])
  event.target.value = ''
}

const handleSave = (event) => {
  // Stop here if a field is empty or wrong, FormField shows what to fix
  if (!isFormValid(event.target)) {
    return
  }
  save()
}
</script>

<template>
  <Navigation />
  <main class="container settings-subpage stack">
    <div class="top-bar">
      <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
        <img :src="chevronLeftIcon" alt="" />
      </RouterLink>
      <h1 class="title-m">Edit profile</h1>
    </div>

    <form @submit.prevent="handleSave" class="profile-form stack" novalidate>
      <div class="profile-photo">
        <!-- New photo first, then the saved photo, otherwise the initials -->
        <img v-if="shownPhoto" :src="shownPhoto" alt="Your profile photo" class="profile-avatar" />
        <span v-else class="profile-avatar">{{ getInitials(username || email || '?') }}</span>

        <div class="photo-buttons">
          <!-- The label works as the button: clicking it opens the hidden file picker -->
          <label class="btn btn-ghost change-photo">
            <img :src="cameraIcon" alt="" width="16" height="16" />
            Change photo
            <input type="file" accept="image/*" class="visually-hidden" @change="handlePhotoChange" />
          </label>

          <!-- Only when there's a photo to remove. It's saved with the Save button, like a new photo -->
          <button v-if="shownPhoto" type="button" class="btn btn-ghost change-photo" @click="removePhoto">
            <img :src="trashIcon" alt="" width="16" height="16" />
            Remove photo
          </button>
        </div>
      </div>

      <FormField label="Username">
        <span class="input-icon">
          <img :src="userIcon" alt="" />
          <input v-model="username" type="text" autocomplete="username" required />
        </span>
      </FormField>

      <div class="stack-small">
        <FormField label="Email">
          <span class="input-icon">
            <img :src="mailIcon" alt="" />
            <input v-model="email" type="email" autocomplete="email" required :readonly="isGoogleAccount" />
          </span>
        </FormField>
        <p class="caption">
          <template v-if="isGoogleAccount">You log in with Google, so your email can only be changed there.</template>
        </p>
      </div>

      <button type="submit" :disabled="isSaving" class="btn btn-primary">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>

      <p v-if="successMessage" class="caption" role="status">{{ successMessage }}</p>
      <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </form>
  </main>
</template>

<style scoped>
.settings-subpage {
  padding-top: 24px;
  padding-bottom: 80px;
}

.profile-form {
  max-width: 560px;
  gap: 24px;
}

.profile-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: var(--light-gray);
  font-family: var(--font-title);
  font-size: 24px;
  object-fit: cover;
}

/* Change photo and Remove photo side by side, wrapping onto two lines on a narrow phone */
.photo-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.change-photo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.change-photo:focus-within {
  outline: 2px solid var(--black);
  outline-offset: 2px;
}
</style>