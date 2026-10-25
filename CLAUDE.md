# CLAUDE.md

Wearit is a cost-per-wear web app: users track wardrobe items and how often they wear them.

Follow the coding conventions in @AGENTS.md.

## Stack
- Vue 3 (`<script setup>`) + Vue Router, built with Vite
- Firebase: Auth (email + Google) and Firestore
- Cloudinary for photos (unsigned upload preset, no API secret in the frontend)
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
- `src/services/` – external API calls only: Firestore (`users.js`, `wardrobes.js`) and Cloudinary (`cloudinary.js`)
- `src/utils/` – pure helpers (`costPerWear.js`, `formatMoney.js`)
- `src/router/index.js` – routes and the global guard
- `src/firebase.js` – Firebase init; config comes from `VITE_FIREBASE_*` env vars in `.env`
- Cloudinary config: `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`

## Routing rules
Route `meta` drives access in `router.beforeEach`:
- `guestOnly` – logged-in users are sent to the dashboard
- `requiresAuth` – guests are sent to login with a `redirect` query
- `requiresAdmin` – needs `profile.role === "admin"`
- Users with `onboardingCompleted !== true` are always sent to `/onboarding`

## Firestore data
- `users/{uid}` – profile: `username`, `role`, `wardrobeId`, `onboardingCompleted`
- `wardrobes/{uid}` – one wardrobe per user (ID = user ID): `ownerId`, `currency`, `goals`, `targetCostPerWear`, `createdAt`
- `wardrobes/{uid}/items/{itemId}` – `name`, `category`, `brand`, `price`, `purchaseDate`, `timesWorn`, `photoUrl`, `lastWornAt`, `createdAt`
- Photos live in Cloudinary, Firestore only stores their `photoUrl`. Folders: `wearit/profile-pictures/{uid}` and `wearit/wardrobes/{uid}/items`
- Security rules live in `firestore.rules`

## Notes
- Comments in this codebase are short, plain-English explanations for beginners; keep that style.
- Use `writeBatch` when several documents must be saved together.
