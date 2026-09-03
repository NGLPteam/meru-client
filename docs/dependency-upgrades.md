# Post-astroification upgrade plan

Compiled 2026-09-03 against the npm registry. Every batch gates on
`yarn check` + `yarn build` + the headless suite (PDF item, metrics
interactions, search, community/collection) with zero console errors.

**Status: the env rename and Batch 1 are APPLIED and verified (2026-09-03).**
The rename's local side is done (`git grep -i NEXT_` is clean; sign-in 302s to
Keycloak from the new names); the deploy config still needs the matching
rename before this ships. Batch 2 and the holds below remain open.

## Batch 1 — tooling + minors/patches (one PR, low risk) — APPLIED

- **Yarn** 4.10.3 → **4.18.0**: `yarn set version 4.18.0` (updates
  `packageManager`), then `yarn install`.
- **Astro line** (all same-major): `astro` 7.1.3 → 7.3.1, `@astrojs/node`
  11.0.2 → 11.1.5, `@astrojs/react` 6.0.1 → 6.0.5, `@astrojs/check`
  0.9.9 → 0.9.10. (`yarn dlx @astrojs/upgrade` does exactly this set.)
- **react-pdf** 10.4.1 → 10.5.0 — keeps the exact `pdfjs-dist: 5.4.296` pin
  (verified: react-pdf@10.5.0 depends on exactly 5.4.296, same as 10.4.1).
- Minors: `lodash` 4.18.1, `@types/lodash` 4.17.25, `@types/react` 19.2.18,
  `@types/react-dom` 19.2.7, `@graphql-codegen/client-preset` 6.1.3,
  `eslint` 10.9.1, `@typescript-eslint/{parser,eslint-plugin}` 8.69.0,
  `globals` 17.12.0, `postcss` 8.5.28.

```
yarn set version 4.18.0
yarn up astro @astrojs/node @astrojs/react @astrojs/check react-pdf \
  lodash @types/lodash @types/react @types/react-dom \
  @graphql-codegen/client-preset eslint \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin globals postcss
```

## Batch 2 — majors worth taking now (verify each; can split into 2–3 PRs)

- **i18next 24 → 26** — server-only since the Phase 8 cut; we use only
  `createInstance`/`init`/`t`/`getFixedT`/`remove|addResourceBundle` on a
  single locale. Verify strings render + the dev-mode en.json hot reload.
- **react-error-boundary 4 → 6** — sole consumers are the MDX slot wrappers
  (`ErrorBoundary` + `fallbackRender`, both still the primary API); peers
  allow React 19.
- **react-intersection-observer 9 → 11** — sole consumer is
  `AssetInlinePDFPage` (`useInView`); peers allow React 19. Verify lazy page
  rendering on a long PDF.
- **react-markdown 9 → 10** — `BaseMarkdown` + patterns + `MarkdownContent`.
  Server-only render; verify footer description, breadcrumb current title,
  contributor bio, page markdown.
- **graphql-codegen line**: `@graphql-codegen/cli` 6 → 7, `introspection`
  5 → 6, `typescript-resolvers` 5 → 6 (`typescript` and `schema-ast` plugins
  already current; `client-preset` stays on 6.x). Rerun BOTH outputs
  (`yarn graphql` + the `.graphqlrc.yml` schema codegen) and diff the
  generated files — expect formatting churn only.
- **eslint-plugin-astro 2 → 3** — peers match our eslint 10 / tseslint 8.69,
  but note it now peer-requires the `typescript-eslint` meta-package
  (>=8.61.0), which we don't install (we use the split parser/plugin
  packages). May need to add it or adjust the flat config.
- **postcss plugin batch**: `postcss-import` 16 → 17, `postcss-mixins`
  11 → 12, `postcss-nested` 7 → 8, `@csstools/postcss-oklab-function` 4 → 5.
  These majors are typically ESM/node-floor bumps; verify by diffing
  `dist/client/_astro/*.css` before/after — output should be identical.

## Hold — deliberate, with reasons

| Package                     | Held at      | Why                                                                                                                                                                                                                                               |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwindcss` 3 → 4         | 3.4.x        | A real migration: CSS-first config, `@tailwindcss/postcss` split, `theme()` calls in module CSS (e.g. `zIndex.dropdown`), and v4's own native cascade layers would interact with our `meru-base`/`meru-components` layer scheme. Its own project. |
| `typescript` 6 → 7          | 6.0.x        | Blocked: `@typescript-eslint` 8.69 peers `<6.1.0`; astro tooling support also unverified. Revisit when typescript-eslint supports it.                                                                                                             |
| `graphql` 16 → 17           | 16.x         | codegen peers allow ^17 but the wider ecosystem is still settling; `@urql/core` doesn't even use it (bundles `graphql.web`). No feature need.                                                                                                     |
| `pdfjs-dist` 6.x            | =5.4.296     | Exact-pinned to what `react-pdf` ships against. Moves only when react-pdf majors onto pdfjs 6.                                                                                                                                                    |
| `react-google-charts` 4 → 5 | 4.x          | Our BaseLayout head loader `<script>` is coupled to its internals (exact src match + `dataset.loaded`, `data-astro-transition-persist` across ClientRouter swaps). Upgrade needs a dedicated pass verifying charts across soft navigations.       |
| `@types/node` 24 → 26       | 24.x         | Tracks `engines.node: 24.x`. Bump together with a Node runtime decision, not alone.                                                                                                                                                               |
| `@castiron/eslint-config`   | 2.0.0-beta.0 | Installed version is _ahead_ of the registry `latest` tag (1.1.0-alpha.0); leave pinned.                                                                                                                                                          |

## Env-var rename: drop the `NEXT_*` legacy names — APPLIED (repo side)

The code reads new names first with `NEXT_*` fallbacks "until the deploy
config is renamed" — so the deploy side must switch first. `.env` already uses
the new names; `.env.local` still uses the old ones.

1. **Deploy config (ops, first)** — set the new names:
   `PUBLIC_API_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`,
   `KEYCLOAK_CLIENT_SECRET`, `SITE_URL`, `SITEMAP_CACHE_MAXAGE`,
   `SITEMAP_CACHE_REVALIDATE`, `PUBLIC_ADMIN_URL`, `PUBLIC_GOOGLE_MAPS_KEY`.
2. **`.env.local`** — rename to the new names; DELETE `NEXT_PUBLIC_TUS_URL`,
   `NEXT_PUBLIC_VERSION`, `NEXT_PUBLIC_ORDER_PATH_OPTIONS` (zero code
   consumers).
3. **Code — drop the fallbacks** (each site already carries a "drop once the
   deploy config is renamed" comment):
   - `src/lib/api/client.ts` — `NEXT_PUBLIC_API_URL` (×2)
   - `src/lib/auth/keycloak.ts` — 4 `serverEnv(..., "NEXT_*")` second args
   - `src/lib/sitemap/xml.ts` — 2 sitemap-cache fallbacks
   - `src/lib/env/clientConfig.ts` — `NEXT_PUBLIC_ADMIN_URL` + bare
     `GOOGLE_MAPS_KEY`
   - `src/lib/metadata/{site,collection,community,item}Metadata.ts` —
     `NEXT_PUBLIC_FE_URL` fallbacks (4 files)
   - `astro.config.mjs` — `site` fallback to `NEXT_PUBLIC_FE_URL`;
     `envPrefix` shrinks to `["PUBLIC_"]`
4. Verify: `git grep -i "NEXT_"` → empty; boot the built server from `.env`
   only and hit the API-backed pages; check sitemap/robots absolute URLs and
   the GeoChart maps key.

## Suggested order

1. Env rename (independent of deps; gated on the deploy-config switch).
2. Batch 1, verify, commit.
3. Batch 2 in two PRs: (a) runtime libs (i18next, error-boundary,
   intersection-observer, react-markdown), (b) toolchain (codegen line,
   eslint-plugin-astro, postcss batch).
4. Holds tracked here; revisit tailwind 4 and react-google-charts 5 as their
   own projects.
