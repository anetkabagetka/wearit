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
- `src/composables/` – reactive state and UI actions (`useAuth`, `useOnboarding`, `useAddItem`, `useAdminUsers`)
- `src/services/` – external API calls only: Firestore (`users.js`, `wardrobes.js`, `outfits.js`) and Cloudinary (`cloudinary.js`)
- `src/utils/` – pure helpers (`costPerWear.js`, `formatMoney.js`, `itemOptions.js` for category/color/season/tag choices)
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
- `users/{uid}` – profile: `username`, `role`, `wardrobeId`, `onboardingCompleted`, `notifications` (choices from the Notifications page), `pushIds` (browsers that allowed push), `lastReminderAt` (set by the Cloud Functions), `theme` (`"light"`, `"dark"` or `"system"`, from the Theme page)
- `wardrobes/{uid}/items/{itemId}` – `name`, `category`, `brand`, `color`, `season`, `price`, `purchaseDate`, `timesWorn`, `tags`, `notes`, `photoUrl`, `lastWornAt`, `wornDates` (dates of logged wears, added by `markItemWorn`), `removedAs`, `salePrice`, `removedAt` (only on sold, donated or given away items, added by `markItemRemoved`), `createdAt` (saved through `toItemData` in `wardrobes.js`, so every item has the same shape)
- `wardrobes/{uid}/outfits/{outfitId}` – `name`, `itemIds` (its items, in the order they were picked), `tags`, `timesWorn`, `lastWornAt`, `wornDates`, `createdAt` (saved by `addOutfit` in `outfits.js`). "Log outfit" adds a wear to the outfit and to each of its items in one batch (`logOutfitWear`), skipping items already worn today. An outfit's cost per wear is its items' costs per wear added up (`outfitCostPerWear`); sold, donated or deleted items drop out of it
- Photos live in Cloudinary, Firestore only stores their `photoUrl`. Folders: `wearit/profile-pictures/{uid}` and `wearit/wardrobes/{uid}/items`
- Security rules live in `firestore.rules`, deployed with `firebase deploy --only firestore:rules`
- Cloud Functions (push notifications) live in `functions/`, deployed with `firebase deploy --only functions`

## Notes
- Comments in this codebase are short, plain-English explanations for beginners; keep that style.
- Use `writeBatch` when several documents must be saved together.
- Light and dark theme: use the colour variables from `main.css` (`--black` for text, `--white` for backgrounds, the grays) instead of fixed colours, so both themes work. A black icon on a `--black` button gets `filter: var(--icon-on-black-filter)`. The dark values are in `:root[data-theme="dark"]`, switched by `utils/theme.js`.

## Forms
- Wrap every field in `FormField` (`label` prop, the input goes in the slot). It shows a red `*` when the input has `required`, otherwise "(optional)", plus the error message under the field.
- Validation comes from HTML attributes (`required`, `type="email"`, `min`, `max`, `minlength`, `pattern` + `title`); friendly messages are in `utils/validationMessage.js`.
- Forms use `novalidate`, and the submit handler starts with `if (!isFormValid(event.target)) return;` (`utils/isFormValid.js`).
- Custom errors (e.g. "Passwords do not match.") go in `FormField`'s `error` prop. Groups of radios/checkboxes use `<FormField label="..." group>`.
- Firebase auth errors are turned into readable text by `utils/authErrorMessage.js`; show them in `<p class="form-error" role="alert">`.