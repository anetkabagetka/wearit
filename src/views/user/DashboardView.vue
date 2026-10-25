<script setup>
import Navigation from '@/components/Navigation.vue'
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Take the profile and userEmail from the useAuth composable
const { profile, userEmail } = useAuth()

// Username, or the part of the email before "@" if there is no username
const displayName = computed(() => profile.value?.username || userEmail.value.split("@")[0])
</script>

<template>
    <Navigation />
    <main>
        <h1>Hi, {{ displayName }}!</h1>
    </main>
</template>