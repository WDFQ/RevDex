# RevDex — Agent Guide

RevDex is a car-spotting mobile app: snap a photo of a car, identify its make/model/year with AI, and save it to a personal collection. Built with Expo + React Native.

## Expo has changed — verify, don't assume

This project is on **Expo SDK 54**, which moved fast. Before writing code against any Expo/RN API, read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ and check the API against what's actually installed (`node_modules/<pkg>/package.json`, its `.d.ts`, or its `exports` map) rather than relying on memory. Several APIs here differ from older tutorials — see Gotchas below.

## Stack

- **Expo SDK 54** / React Native 0.81 / React 19.1
- **expo-router v6** — file-based routing in `app/`. Typed routes and React Compiler are enabled (`app.json` › `experiments`).
- **NativeWind v4** (+ Tailwind 3.4) — styling via `className`, dark theme throughout
- **Firebase JS SDK v12** — auth, Firestore, storage (`services/firebase.ts`)
- **TypeScript** (strict), **npm** (has `package-lock.json`)
- No test framework or ESLint config beyond `expo lint`

## Structure

- `app/` — routes. `(auth)/` (login, signup), `(tabs)/` (index=Home, Collection, Settings), plus `CameraScreen` and `CaptureCardScreen`. `app/_layout.tsx` is the root layout and gates auth.
- `components/` — shared UI (`Header`, `CarCard`)
- `services/firebase.ts` — Firebase init and exports (`auth`, `db`, `storage`)

## Code style

Formatting is enforced by `.prettierrc`: **4-space indent, single quotes, no semicolons, trailing commas (es5), printWidth 180**.

Beyond formatting, prefer **readable and obvious over clever**:
- Descriptive names over abbreviations; named intermediate variables over dense one-liners.
- Straightforward `if/else` over nested ternaries or condensed logic.
- Break a function up when it does several distinct things, even for a single screen.
- Comment *non-obvious* logic (an API quirk, a workaround) — don't comment the self-explanatory.
- Use `console.log` (not `console.error`) for expected/handled errors so the Expo LogBox redbox doesn't trigger.
- `try/catch/finally`, resetting loading/status state in `finally`.

## Design system (match exactly — don't introduce new colors/patterns)

- Screen bg: `bg-neutral-950`. Cards/inputs: `bg-neutral-900 border border-neutral-800`.
- Primary button: `bg-sky-200 rounded-2xl py-4 items-center` + text `text-sky-900 font-semibold`, `activeOpacity={0.85}`.
- Secondary button: `bg-neutral-900 border border-neutral-800 rounded-2xl py-4` + text `text-white font-semibold`, `activeOpacity={0.7}`.
- Text: `text-white` (headers), `text-neutral-400` (body), `text-neutral-500 text-xs uppercase tracking-wider` (labels).
- `rounded-2xl` is the standard corner radius. Icons: `Ionicons` from `@expo/vector-icons`. Accent: sky-400 / `#38bdf8`.
- Use `SafeAreaView` from `react-native-safe-area-context` and `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`), matching the auth screens.

## Gotchas (learned the hard way)

- **Root layout must render a navigator.** `app/_layout.tsx` has to return a `<Stack>`/`<Slot>` (it uses `<Stack.Protected guard={...}>` for auth gating). Returning a bare `<Redirect>` mounts no navigator, so expo-router never hides the splash screen and the app hangs on the splash.
- **`expo-file-system` v19 rewrote the API.** The default export is now the `File`/`Directory` class API (`new File(uri).base64()`). The old function API (`readAsStringAsync`, `EncodingType`) is deprecated and lives at `expo-file-system/legacy`.
- **Firebase v12 + React Native persistence.** `getReactNativePersistence` is **not** reachable from the `firebase/auth` meta-package (missing from both types and runtime). Auth currently uses `getAuth`, i.e. in-memory persistence — users are logged out on cold start until this is wired up properly.
- **`EXPO_PUBLIC_*` env vars are inlined at bundle time.** After editing `.env`, restart Metro with `expo start --clear` or the new value won't be picked up. The Gemini key is `EXPO_PUBLIC_GEMINI_API_KEY`.
- **`.env` is gitignored** — don't commit secrets. `firebaseConfig` in `services/firebase.ts` is a Firebase *web* config (not secret), so security depends on Firestore/Storage rules.

## Verify your work

Run `npx tsc --noEmit` after changes — it's the fastest correctness check (strict mode, typed routes). There are no unit tests.
