<script setup>
import { useRouter } from "vue-router";

import { useOnboarding } from "../composables/useOnboarding";

const router = useRouter();

// Import the reactive state and computed properties from the useOnboarding composable
const {
    step,
    username,
    currency,
    item,
    isSaving,
    errorMessage,
    currentCostPerWear,
    finish,
} = useOnboarding();

</script>

<template>
    <main>
        <p>Step {{ step }} of 3</p>

        <!-- Step 1: about you. "required" makes the browser block empty fields -->
        <form v-if="step === 1" @submit.prevent="step++">
            <h1>Welcome to wearit</h1>

            <label>
                Username
                <input v-model="username" type="text" required />
            </label>

            <label>
                Currency
                <select v-model="currency">
                    <option>DKK</option>
                    <option>EUR</option>
                    <option>USD</option>
                </select>
            </label>

            <button type="submit">Next</button>
        </form>

        <!-- Step 2: first item. v-model.number turns the input text into a number -->
        <form v-else-if="step === 2" @submit.prevent="finish">
            <h1>Add your first item</h1>

            <label>
                Name
                <input v-model="item.name" type="text" placeholder="Black wool coat" required />
            </label>

            <label>
                Category
                <select v-model="item.category" required>
                    <option value="" disabled>Choose a category</option>
                    <option>Tops</option>
                    <option>Bottoms</option>
                    <option>Dresses</option>
                    <option>Outerwear</option>
                    <option>Shoes</option>
                    <option>Accessories</option>
                </select>
            </label>

            <label>
                Price ({{ currency }})
                <input v-model.number="item.price" type="number" min="0" step="0.01" required />
            </label>

            <label>
                Purchase date
                <input v-model="item.purchaseDate" type="date" />
            </label>

            <label>
                How many times have you worn it already?
                <input v-model.number="item.timesWorn" type="number" min="0" required />
            </label>

            <button type="button" @click="step--">Back</button>
            <button type="submit" :disabled="isSaving">
                {{ isSaving ? "Saving..." : "Save item" }}
            </button>

            <p v-if="errorMessage">{{ errorMessage }}</p>
        </form>

        <!-- Step 3: show the cost per wear for the item they just added -->
        <section v-else>
            <h1>{{ item.name }}</h1>
            <p>Cost per wear right now:</p>
            <p>{{ currentCostPerWear.toFixed(2) }} {{ currency }}</p>

            <button type="button" @click="router.push({ name: 'dashboard' })">
                Go to dashboard
            </button>
        </section>
    </main>
</template>