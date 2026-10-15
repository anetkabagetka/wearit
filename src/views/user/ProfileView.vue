<script setup>
import Navigation from "@/components/Navigation.vue";
import { useAuth } from "@/composables/useAuth";

const { profile, userEmail } = useAuth();
</script>

<template>
    <Navigation />
    <main>
        <h1>Profile</h1>
        <p><strong>Username:</strong> {{ profile?.username }}</p>
        <p><strong>Email:</strong> {{ userEmail }}</p>
    </main>
</template>