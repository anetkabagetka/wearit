# AGENTS.md

## Vue
- Prefer Vue 3 latest patterns with `<script setup>`.
- Prefer `defineModel()` over manual prop/emit pairs for simple two-way binding.
- Use `defineProps()` and `defineEmits()` when the component API is not just a simple model.
- Preserve reactivity. Do not create non-reactive snapshots from refs.
- Prefer small composables for reusable stateful logic.

## Design
- Favor SRP: each component, composable, or service should have one clear responsibility.
- Favor SoC: keep UI, reactive state, and external data access in separate layers.
- Keep views focused on rendering and user interaction.
- Keep composables focused on state, orchestration, and UI actions.
- Keep services focused on Firebase or other external API calls.

## Style
- Keep code concise and beginner-friendly.
- Prefer small, incremental changes that are easy to understand step by step.
- Avoid unnecessary abstraction unless it clearly improves readability or reuse.