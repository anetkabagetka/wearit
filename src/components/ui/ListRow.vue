<script setup>
import chevronRightIcon from '@/assets/icons/chevron-right.svg'

// One row in a settings list: icon, label, optional value on the right.
// With "to" it's a link with a chevron, without "to" it's a button (e.g. Log out)
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, default: '' },
  to: { type: Object, default: null },
})

defineEmits(['click'])
</script>

<template>
  <RouterLink v-if="to" :to="to" class="list-row">
    <img :src="icon" alt="" width="22" height="22" />
    <span class="list-row-label">{{ label }}</span>
    <span v-if="value" class="list-row-value">{{ value }}</span>
    <img :src="chevronRightIcon" alt="" width="20" height="20" />
  </RouterLink>

  <button v-else type="button" class="list-row" @click="$emit('click')">
    <img :src="icon" alt="" width="22" height="22" />
    <span class="list-row-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid var(--light-gray);
  background: none;
  color: var(--black);
  font-family: inherit;
  font-size: 15px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.list-row:hover .list-row-label {
  text-decoration: underline;
}

.list-row-label {
  flex: 1;
}

.list-row-value {
  color: var(--gray);
}
</style>