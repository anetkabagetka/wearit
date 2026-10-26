<script setup>
import Navigation from '@/components/Navigation.vue'
import CurrencyPicker from '@/components/CurrencyPicker.vue'

import { useCurrencySettings } from '@/composables/useCurrencySettings'
import { RATES_DATE } from '@/utils/currencyOptions'

import chevronLeftIcon from '@/assets/icons/chevron-left.svg'

const { currency, isLoading, isSaving, errorMessage, save } = useCurrencySettings()
</script>

<template>
    <Navigation />
    <main class="container settings-subpage stack">
        <div class="top-bar">
            <RouterLink :to="{ name: 'settings' }" class="back-button" aria-label="Back to settings">
                <img :src="chevronLeftIcon" alt="" />
            </RouterLink>
            <h1 class="title-m">Currency</h1>
        </div>

        <p v-if="isLoading">Loading...</p>

        <form v-else @submit.prevent="save" class="currency-form stack">
            <p>Used for prices and cost per wear across your wardrobe.</p>

            <!-- The same picker as on signup, with the shorter "EUR · €4.20 per wear" texts -->
            <CurrencyPicker v-model="currency" short-description />

            <p class="caption">
                Examples show your wool blazer's cost per wear. Existing prices convert at the saved rates from
                {{ RATES_DATE }}.
            </p>

            <button type="submit" :disabled="isSaving" class="btn btn-primary">
                {{ isSaving ? 'Saving...' : 'Save' }}
            </button>

            <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
        </form>
    </main>
</template>

<style scoped>
.settings-subpage {
    padding-top: 24px;
    padding-bottom: 80px;
}

/* In Figma the content is 560px wide and sits on the left */
.currency-form {
    max-width: 560px;
}
</style>