# AGENTS.md

Guidance for working in this repository. Read before making changes.

## Project

"Normalizer" — legal-access PWA (Nuxt 4). Prototype runs on **mock data** (`server/data/mock.ts`); the real Supabase schema/edge functions are reference-only in `supabase/`. Specs are the source of truth: `docs/SRS.md` (requirements/use cases) and `docs/SDD.md` (architecture, SQL+RLS, business logic).

## Commands

- `pnpm install` — also runs `nuxt prepare` (regenerates `.nuxt/` types; `tsconfig.json` only references generated files there)
- `pnpm dev` — http://localhost:3000
- `pnpm build` — production build; **this is the typecheck** (no lint/test scripts exist — don't invent or run them)
- `pnpm generate` / `pnpm preview` — static export / preview

Use pnpm only (lockfile is pnpm; npm/yarn/bun will corrupt it).

## Structure (Nuxt 4)

- `app/` — pages, components, composables, middleware (NOT root-level `pages/`; root pages won't be picked up)
- `app/pages/` — index, mapa, especialistas(+`[id]`), comunidad(+`[topic]`), emergencias, auth/*, perfil/*, admin
- `app/composables/` — `useAgeMode` (age→CHILD/ADULT/ELDER, the only place boundaries live), `useAuth` (localStorage mock), `useFaq` (Ramon engine), `useSpecialists`, `useBookings`, `useForum`, `useGeolocation`
- `server/api/*` — Nitro routes returning mock data; `server/data/mock.ts` (specialists, FAQ, forum, slots), `server/utils/geo.ts`
- `supabase/migrations/` + `supabase/functions/` — reference implementation (not wired to the app yet)
- `i18n/locales/*.json` — es, qu, gn, en. i18n config: `nuxt.config.ts` `i18n` block + `i18n/i18n.config.ts`. **Note:** `vueI18n` must be a config-file path, not an inline object (module v10).

## Key constraints (from SRS/SDD)

- **Ramon is deterministic, NO LLM/RAG**: FAQ items (`faq_items`/mock) + keyword matching (`matchFaq` in `useFaq.ts`). Never add an LLM API.
- `age_mode` is derived, never stored/edited directly (trigger in migration; `deriveAgeMode` in composable).
- Minors (CHILD) require a guardian; professional applications go `PENDING → APPROVED | REJECTED`; booking slots are unique (no double-booking).
- Emergency numbers are plain `tel:` links (110/119/118) — no location sharing.
- Community/forum is Spanish-language content; UI strings must keep all 4 locales in sync (es/qu/gn/en).

## Gotchas

- If type errors reference missing `.nuxt/` files: run `pnpm nuxt prepare`.
- `MapLeaflet.vue` imports `leaflet` — must stay wrapped in `<ClientOnly>` on pages (SSR-safe).
- `pnpm-workspace.yaml` `allowBuilds.esbuild: true` is required for esbuild install scripts.
- Mock auth/profiles are per-browser (localStorage). Admin demo account is not seeded — register, then treat any user as non-admin.
