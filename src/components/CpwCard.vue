<template>
    <div class="cpw-card">
        <h3>EXAMPLE: WOOL BLAZER</h3>
        <div class="cpw-card-content">
            <h1>
                €4.20
            </h1>
            <p>per wear</p>
        </div>
        <p>€126 blazer ÷ 30 wears = €4.20</p>
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