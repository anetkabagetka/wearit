<template>
    <main>
        <h1>Check your email</h1>
        <p>
            We've sent a reset link to your email address. It resets in 30 minutes.
        </p>
        <button type="button">
            Open email app
        </button>
        <RouterLink :to="{ name: 'login' }">
            Back to Login
        </RouterLink>
        <p>
            Didn't get it? <button type="button">Resend</button>
        </p>
    </main>
</template>