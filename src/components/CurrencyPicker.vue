<script setup>
import { currencyOptions } from '@/utils/currencyOptions'

// The list of currencies as option rows with a radio button each.
// The parent gets the chosen code (e.g. "EUR") with v-model
const currency = defineModel({ type: String, required: true })

defineProps({
  // false: "e.g. €126 blazer, €4.20 per wear" (signup)
  // true: "EUR · €4.20 per wear" (settings)
  shortDescription: { type: Boolean, default: false },
})

// The example blazer worn 30 times, e.g. "€4.20" or "31.33 kr"
const perWear = (option) => {
  const amount = option.blazerPrice / 30
  const number = Number.isInteger(amount) ? amount : amount.toFixed(2)
  return option.symbolAfter ? `${number} ${option.symbol}` : `${option.symbol}${number}`
}
</script>

<template>
  <fieldset class="stack-small">
    <label v-for="option in currencyOptions" :key="option.code" class="option-row">
      <span class="option-row-text">
        <span class="option-row-label">{{ option.label }}</span>
        <span class="option-row-description">
          {{ shortDescription ? `${option.code} · ${perWear(option)} per wear` : option.example }}
        </span>
      </span>
      <input v-model="currency" type="radio" name="currency" :value="option.code" />
    </label>
  </fieldset>
</template>