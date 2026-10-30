<script setup>
import logo from '@/assets/wearitlogo.svg'
</script>

<template>
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="logo white">
                <img :src="logo" alt="WearIt logo" />
            </div>
            <div class="footer-links">
                <RouterLink to="/about-us">About us</RouterLink>
                <RouterLink to="/support-contact">Contact / Support</RouterLink>
                <RouterLink to="/login">Log in</RouterLink>
                <RouterLink to="/signup">Create account</RouterLink>
            </div>
            <p class="footer-text">&copy; 2026 wearit. All rights reserved.</p>
        </div>
    </footer>
</template>

<style scoped>
.logo.white {
    margin-bottom: 32px;
}

.site-footer {
    background-color: var(--black);
    color: var(--white);
}

.footer-inner {
    padding: 40px 24px;
}

.footer-text {
    color: var(--gray);
}

.footer-links {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 16px;

    a {
        color: var(--white);
        text-decoration: none;
    }
}
</style>
