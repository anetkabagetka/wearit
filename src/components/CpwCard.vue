<script setup>
// The defaults are the example shown on the landing page.
// Other pages pass their own label, value and formula
defineProps({
    label: { type: String, default: "EXAMPLE: WOOL BLAZER" },
    value: { type: String, default: "€4.20" },
    formula: { type: String, default: "€126 blazer ÷ 30 wears = €4.20" },
});
</script>

<template>
    <div class="cpw-card">
        <h3>{{ label }}</h3>
        <div class="cpw-card-content">
            <h1>
                {{ value }}
            </h1>
            <p>per wear</p>
        </div>
        <p>{{ formula }}</p>
    </div>
</template>

<style scoped>
.cpw-card {
    background-color: var(--white);
    border: 1px solid var(--black);
    border-radius: 8px;
    padding: 24px;
    margin-top: 16px;
}

.cpw-card-content {
    display: flex;
    align-items: end;
    gap: 8px;
    padding: 16px 0;

    p {
        margin-bottom: 8px;
    }
}
</style>
