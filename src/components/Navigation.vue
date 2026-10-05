<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <header>
        <nav>
            <h1>wearit</h1>
            <RouterLink to="/about-us">About us</RouterLink>
            <RouterLink to="/support-contact">Support / Contact</RouterLink>
        </nav>
        <div class="auth-links">
            <RouterLink to="/login">Login</RouterLink>
            <RouterLink to="/signup">Sign up</RouterLink>
        </div>
    </header>
</template>

<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
}

nav {
    display: flex;
    align-items: center;
    gap: 32px;

    a {
        text-decoration: none;
        color: inherit;
    }
}

.auth-links {
    display: flex;
    align-items: center;
    gap: 32px;

    a {
        text-decoration: none;
        color: inherit;
    }
}
</style>