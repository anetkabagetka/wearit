<template>
    <main>
        <h1>Reset Password</h1>
        <p>Enter the email you signed up with and we'll send you a link to set a new password.</p>

        <form>
            <label>
                Email
                <input type="email" autocomplete="email" placeholder="your.email@example.com" required />
            </label>

            <button type="submit">Send Reset Link</button>
            <RouterLink :to="{ name: 'login' }">Back to Login</RouterLink>
        </form>
    </main>
</template>