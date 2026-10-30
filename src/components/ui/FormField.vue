<script setup>
import { computed, onMounted, ref, useId, watch } from "vue";

import { getValidationMessage } from "@/utils/forms/validationMessage";

// Wraps one form field: its label, the input (in the slot) and its error message.
// A red star is shown when the input has "required", otherwise "(optional)"
const props = defineProps({
    label: { type: String, required: true },
    // A custom error from the page, e.g. "Passwords do not match."
    error: { type: String, default: "" },
    // true for a group of radio buttons or checkboxes
    group: { type: Boolean, default: false },
});

const root = ref(null);
const isRequired = ref(false);
const validationError = ref("");
const errorId = useId();

// A custom error from the page wins over the browser's check
const shownError = computed(() => props.error || validationError.value);

// All inputs inside this field: one for a normal field, several for a group
const getControls = () => [...root.value.querySelectorAll("input, select, textarea")];

const checkControl = (control) => {
    validationError.value = getValidationMessage(control);
};

// The form was submitted with this field invalid
const handleInvalid = (event) => {
    checkControl(event.target);
};

// Leaving a field that has a value: check it right away (empty fields wait for submit)
const handleBlur = (event) => {
    if (!props.group && event.target.value !== "") {
        checkControl(event.target);
    }
};

// While an error is shown, re-check on every change, so it disappears once fixed
const handleChange = (event) => {
    if (validationError.value) {
        checkControl(event.target);
    }
};

// Tells screen readers whether the field is wrong and where the message is
const updateAriaAttributes = () => {
    for (const control of getControls()) {
        if (shownError.value) {
            control.setAttribute("aria-invalid", "true");
            control.setAttribute("aria-describedby", errorId);
        } else {
            control.removeAttribute("aria-invalid");
            control.removeAttribute("aria-describedby");
        }
    }
};

onMounted(() => {
    isRequired.value = getControls().some((control) => control.required);
    updateAriaAttributes();
});

watch(shownError, updateAriaAttributes, { flush: "post" });
</script>

<template>
    <component :is="group ? 'fieldset' : 'label'" ref="root" class="form-field stack-small"
        :class="{ 'has-error': shownError }" @invalid.capture="handleInvalid" @focusout="handleBlur"
        @input="handleChange" @change="handleChange">
        <component :is="group ? 'legend' : 'span'" class="field-label">
            {{ label }}
            <span v-if="isRequired" class="required-star" aria-hidden="true">*</span>
            <span v-else class="field-optional">(optional)</span>
        </component>

        <slot />

        <span v-if="shownError" :id="errorId" class="field-error">{{ shownError }}</span>
    </component>
</template>
