<script setup>
import { computed } from "vue";

import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
import StepProgress from '@/components/ui/StepProgress.vue'
import CpwCard from '@/components/ui/CpwCard.vue'
import PhotoUpload from '@/components/ui/PhotoUpload.vue'
import FormField from '@/components/ui/FormField.vue'
import CurrencyPicker from '@/components/ui/CurrencyPicker.vue'

import { useOnboarding } from '@/composables/useOnboarding'
import { formatMoney } from '@/utils/format/formatMoney'
import { isFormValid } from '@/utils/forms/isFormValid'
import { accessoryOptions, clothingOptions } from '@/utils/wardrobe/itemOptions'
import { findCurrency } from '@/utils/wardrobe/currencyOptions'

import moneyIcon from '@/assets/icons/money.svg'
import shirtIcon from '@/assets/icons/shirt.svg'
import leafIcon from '@/assets/icons/leaf.svg'
import tagIcon from '@/assets/icons/tag.svg'
import chevronLeftIcon from '@/assets/icons/chevron-left.svg'

// Import the reactive state and computed properties from the useOnboarding composable
const {
    step,
    currency,
    goals,
    targetCostPerWear,
    item,
    photoFile,
    isSaving,
    errorMessage,
    finish,
} = useOnboarding();

const goalOptions = [
    { value: "lower-cpw", label: "Lower my cost per wear", description: "Get every item under your target", icon: moneyIcon },
    { value: "wear-30", label: "Wear every item 30+ times", description: "Nudges for pieces you rarely reach for", icon: shirtIcon },
    { value: "buy-better", label: "Buy less, buy better", description: "See the likely CPW before you buy", icon: leafIcon },
    { value: "sell-donate", label: "Sell or donate what I don't wear", description: "Spot items that never pay off", icon: tagIcon },
];

// The full option for the currency picked in step 2 (symbol, blazer price, ...)
const selectedCurrency = computed(() => findCurrency(currency.value));

// Goes to the next step only when every field in this step is filled in correctly
const goToNextStep = (event) => {
    if (isFormValid(event.target)) {
        step.value++;
    }
};

// Saves the item only when its fields are filled in correctly ("Skip for now" skips this check)
const handleFinish = (event) => {
    if (isFormValid(event.target)) {
        finish(true);
    }
};

// The line under the price in the step 4 preview, worded like Figma: "€126 ÷ 1 wear. Every wear lowers it."
const previewFormula = computed(() => {
    const wears = Math.max(item.value.timesWorn || 0, 1);
    const price = formatMoney(item.value.price, currency.value, { wholeNumbers: true });
    return `${price} ÷ ${wears} ${wears === 1 ? "wear" : "wears"}. Every wear lowers it.`;
});
</script>

<template>
    <Navigation />
    <main>
        <section class="section">
            <div class="container container-narrow stack">
                <button v-if="step === 3 || step === 4" type="button" class="back-button" aria-label="Back"
                    @click="step--">
                    <img :src="chevronLeftIcon" alt="" />
                </button>

                <StepProgress :current="step" />
                <p>Step {{ step }} of 4</p>

                <!-- Step 2: about you. "required" makes the browser block empty fields -->
                <form v-if="step === 2" @submit.prevent="goToNextStep" class="stack" novalidate>
                    <h1>Choose your currency</h1>
                    <p>We use it to calculate cost per wear.</p>

                    <CurrencyPicker v-model="currency" />
                    <p class="caption">You can change this any time in Settings.</p>

                    <button type="submit" class="btn btn-primary">Continue</button>
                </form>

                <!-- Step 3: goals and target cost per wear -->
                <form v-else-if="step === 3" @submit.prevent="goToNextStep" class="stack" novalidate>
                    <h1>What are your goals?</h1>
                    <p>Pick as many as you like. We tailor your insights and reminders to them.</p>

                    <fieldset class="stack-small">
                        <label v-for="goal in goalOptions" :key="goal.value" class="option-row">
                            <img :src="goal.icon" alt="" />
                            <span class="option-row-text">
                                <span class="option-row-label">{{ goal.label }}</span>
                                <span class="option-row-description">{{ goal.description }}</span>
                            </span>
                            <input v-model="goals" type="checkbox" :value="goal.value" />
                        </label>
                    </fieldset>

                    <!-- min and max work for every currency, from a few euros to a few hundred koruna -->
                    <FormField label="Target cost per wear">
                        <span class="input-icon">
                            <span class="input-prefix">{{ selectedCurrency.symbol }}</span>
                            <input v-model.number="targetCostPerWear" type="number" min="0.1" max="1000" step="0.01"
                                placeholder="2.00" required @wheel="$event.target.blur()" />
                        </span>
                    </FormField>
                    <p v-if="targetCostPerWear > 0" class="caption">
                        At {{ targetCostPerWear.toFixed(2) }} {{ currency }}, a {{ selectedCurrency.blazerPrice }} {{ currency }} blazer
                        pays off after {{ Math.ceil(selectedCurrency.blazerPrice / targetCostPerWear) }} wears.
                    </p>

                    <button type="submit" class="btn btn-primary">Continue</button>
                </form>

                <!-- Step 4: first item. v-model.number turns the input text into a number -->
                <form v-else-if="step === 4" @submit.prevent="handleFinish" class="stack" novalidate>
                    <h1>Add your first item</h1>
                    <p>Start with something you wear a lot.</p>

                    <PhotoUpload v-model="photoFile" />

                    <FormField label="Name">
                        <input v-model="item.name" type="text" placeholder="Wool blazer" required />
                    </FormField>

                    <div class="field-row">
                        <FormField label="Category">
                            <select v-model="item.category" required>
                                <option value="" disabled>Select</option>
                                <option v-for="category in clothingOptions" :key="category">{{ category }}</option>
                                <optgroup label="Accessories">
                                    <option v-for="accessory in accessoryOptions" :key="accessory">{{ accessory }}</option>
                                </optgroup>
                            </select>
                        </FormField>

                        <FormField label="Brand">
                            <input v-model="item.brand" type="text" placeholder="COS" />
                        </FormField>
                    </div>

                    <FormField label="Purchase price">
                        <span class="input-icon">
                            <span class="input-prefix">{{ selectedCurrency.symbol }}</span>
                            <input v-model.number="item.price" type="number" min="0" step="0.01" placeholder="126.00"
                                required @wheel="$event.target.blur()" />
                        </span>
                    </FormField>

                    <div class="field-row">
                        <FormField label="Purchase date">
                            <input v-model="item.purchaseDate" type="date" />
                        </FormField>

                        <FormField label="Times worn so far">
                            <input v-model.number="item.timesWorn" type="number" min="0" step="1" placeholder="0"
                                @wheel="$event.target.blur()" />
                        </FormField>
                    </div>

                    <!-- The goal comes from step 3, so the bar shows how far this item is from it -->
                    <CpwCard label="Cost per wear preview" :price="item.price || 0" :times-worn="item.timesWorn || 0"
                        :currency="currency" :goal="targetCostPerWear || null" :formula="previewFormula" />

                    <div class="actions">
                        <button type="submit" :disabled="isSaving" class="btn btn-primary width-full">
                            {{ isSaving ? "Saving..." : "Add item & finish" }}
                        </button>
                        <button type="button" @click="finish(false)" :disabled="isSaving"
                            class="btn btn-ghost width-full">
                            Skip for now
                        </button>
                    </div>

                    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
                </form>

            </div>
        </section>
    </main>
    <Footer />
</template>

<style scoped>
.btn-primary {
    margin-top: 16px;
}

fieldset {
    margin-top: 16px;
}
</style>