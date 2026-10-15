# CLAUDE.md

Wearit is a cost-per-wear web app: users track wardrobe items and how often they wear them.

Follow the coding conventions in @AGENTS.md.

## Stack
- Vue 3 (`<script setup>`) + Vue Router, built with Vite
- Firebase: Auth (email + Google) and Firestore
- Plain JavaScript (no TypeScript)

## Commands
- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run lint` – oxlint + eslint (with `--fix`)
- `npm run format` – format `src/` with oxfmt

## Structure
- `src/views/` – pages, grouped by area: `auth/`, `user/`, `admin/` (landing and onboarding at the root)
- `src/components/` – shared UI (e.g. `Navigation.vue`)
- `src/composables/` – reactive state and UI actions (`useAuth`, `useOnboarding`, `useAdminUsers`)
- `src/services/` – Firestore calls only (`users.js`, `wardrobes.js`)
- `src/utils/` – pure helpers (`costPerWear.js`)
- `src/router/index.js` – routes and the global guard
- `src/firebase.js` – Firebase init; config comes from `VITE_FIREBASE_*` env vars in `.env`

## Routing rules
Route `meta` drives access in `router.beforeEach`:
- `guestOnly` – logged-in users are sent to the dashboard
- `requiresAuth` – guests are sent to login with a `redirect` query
- `requiresAdmin` – needs `profile.role === "admin"`
- Users with `onboardingCompleted !== true` are always sent to `/onboarding`

## Firestore data
- `users/{uid}` – profile: `username`, `role`, `wardrobeId`, `onboardingCompleted`
- `wardrobes/{uid}` – one wardrobe per user (ID = user ID): `ownerId`, `currency`, `createdAt`
- `wardrobes/{uid}/items/{itemId}` – `name`, `category`, `price`, `purchaseDate`, `timesWorn`, `lastWornAt`, `createdAt`
- Security rules live in `firestore.rules`

## Notes
- Comments in this codebase are short, plain-English explanations for beginners; keep that style.
- Use `writeBatch` when several documents must be saved together.
