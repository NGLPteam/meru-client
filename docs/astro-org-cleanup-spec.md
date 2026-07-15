# Organizational cleanup — env rename + `src/` consolidation (spec)

Post-migration housekeeping, to run **after** the auth migration and Next teardown land (and ideally
after step 7 drops the `next` dep). Two independent parts — do them as **separate PRs**; Part A
(env) is small but deploy-coupled, Part B (directory move) is large but mechanical. Neither changes
runtime behavior.

Verified against the tree 2026-07-15.

---

## Part A — Rename env vars off the `NEXT_PUBLIC_`/`NEXT_` prefixes

The `NEXT_PUBLIC_` prefix is a Next convention (client exposure). Astro's convention is **`PUBLIC_`**
for client-exposed vars; everything else is server-only. Now that auth is server-side, this is also a
chance to **reclassify** — most of these vars no longer need to reach the browser at all.

### Inventory (current → proposed)

| current | reaches client? | proposed | notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **yes** — analytics urql (`ViewCounter`/`ArticleAnalyticsBlock`) | `PUBLIC_API_URL` | the only var the browser genuinely needs post-migration |
| `NEXT_PUBLIC_ADMIN_URL` | **yes** — `clientConfig.ADMIN_URL` | `PUBLIC_ADMIN_URL` | |
| `GOOGLE_MAPS_KEY` | **yes** — `clientConfig.GOOGLE_MAPS_KEY` | `PUBLIC_GOOGLE_MAPS_KEY` | already unprefixed; fold into the `PUBLIC_` scheme |
| `NEXT_PUBLIC_FE_URL` | no — `astro.config` `site`, `siteOrigin` | `SITE_URL` (server-only) | server-only; drop from client exposure |
| `NEXT_PUBLIC_KEYCLOAK_URL` | no — server auth only | `KEYCLOAK_URL` | server-only now |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | no | `KEYCLOAK_REALM` | server-only |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | no | `KEYCLOAK_CLIENT_ID` | server-only |
| `NEXT_KEYCLOAK_CLIENT_SECRET` | no (already server-only) | `KEYCLOAK_CLIENT_SECRET` | drop the `NEXT_` |
| `NEXT_PUBLIC_SITEMAP_CACHE_MAXAGE` | no — sitemap endpoint | `SITEMAP_CACHE_MAXAGE` | server-only |
| `NEXT_PUBLIC_SITEMAP_CACHE_REVALIDATE` | no | `SITEMAP_CACHE_REVALIDATE` | server-only |
| `AUTH_SECRET` | — | **delete** | unused since next-auth was removed |

Net client-exposed surface shrinks from ~8 vars to **3** (`PUBLIC_API_URL`, `PUBLIC_ADMIN_URL`,
`PUBLIC_GOOGLE_MAPS_KEY`).

### Code swap points (small — indirection already exists)

- **`astro.config.mjs`** — `envPrefix: ["PUBLIC_", "NEXT_PUBLIC_", "GOOGLE_MAPS_KEY"]` → `["PUBLIC_"]`;
  update `site: process.env.NEXT_PUBLIC_FE_URL` → `SITE_URL`.
- **`lib/env/clientConfig.ts`** — the single client swap point; update `env.NEXT_PUBLIC_ADMIN_URL` →
  `env.PUBLIC_ADMIN_URL`, `env.GOOGLE_MAPS_KEY` → `env.PUBLIC_GOOGLE_MAPS_KEY`.
- **Server readers** (each uses the `process.env[k] ?? import.meta.env[k]` pattern — see
  `astro-server-env-access` memory): `src/lib/auth/keycloak.ts`, `src/lib/auth/constants.ts` (none),
  `src/lib/query.ts` / `lib/api/client.ts` (`API_URL`), `src/lib/sitemap/xml.ts`,
  `src/lib/metadata/*.ts`, `src/pages/robots.txt.ts`, `lib/api/UrqlProvider.tsx` (`getAPIURL`).
  Mechanical find/replace of the names.
- **`.env`, `.env.development`, `.env.local`** — rename the keys.

### ⚠️ The real risk: deploy-time env coordination

The **deploy injects these var *names*** into the runtime environment (prod `process.env`). A
code-only rename **breaks prod** unless the deploy config is renamed in lockstep:
- `docker/local.env`, `docker/sandbox.env` (in-repo — update in the same PR).
- Any **out-of-repo** secrets/config: k8s/Helm values, CI/CD secrets, hosting-provider env panels.
  These must change at cutover. **Coordinate with whoever owns the deploy before merging.**

Safer rollout option: support **both names during a transition** — `env("PUBLIC_API_URL") ??
env("NEXT_PUBLIC_API_URL")` in the readers — rename infra, then delete the fallbacks in a follow-up.
Recommended given the out-of-repo coupling.

---

## Part B — Consolidate root-level dirs into `src/`

Now that Next is gone, the split between root-level shared dirs (a Next-era layout) and `src/` (Astro)
is vestigial. Consolidate everything into `src/` under one alias.

### What moves (into `src/`)

| root dir | files | into | collision? |
|---|---|---|---|
| `components/` | ~556 | `src/components/` | none (disjoint subdirs) |
| `contexts/` | 12 | `src/contexts/` | none |
| `lib/` | 22 | `src/lib/` | **yes — `lib/metadata` + `lib/request`** already exist in `src/lib/` |
| `helpers/` | 13 | `src/helpers/` | none |
| `hooks/` | 5 | `src/hooks/` | none |
| `styles/` | 16 | `src/styles/` | none |
| `types/` | 4 | `src/types/` | none |

**Collision handling (`lib/`):** root `lib/metadata` + `src/lib/metadata` and root `lib/request` +
`src/lib/request` both exist. Merge file-by-file (verify no same-named files clash) rather than moving
the dirs wholesale. Everything else merges cleanly.

### Stays at root (infra/config — conventional)

`bin/`, `docker/`, `__schema__/` (codegen schema), `public/`, `docs/`, and the root config files
(`astro.config.mjs`, `tsconfig.json`, `codegen.client.ts`, `tailwind.config.js`, `postcss.config.js`).
- `routes/baseRoutes.ts` — **0 importers found; likely dead.** Confirm, then delete (else move to
  `src/lib`). The `@/routes` alias has 0 uses.

### The low-churn strategy: move, then repoint the alias

There are ~490 import sites on `@/components` (181), `@/lib` (204), `@/contexts` (63), `@/helpers`
(48), `@/types` (48), `@/hooks` (15). **Don't rewrite them.** Instead:

1. `git mv` each root dir into `src/` (merging the two `lib` collisions by hand).
2. In `tsconfig.json`, **repoint the root aliases to `src/`**: `"@/*": ["./src/*"]` and the specific
   `"@/components/*": ["src/components/*"]` etc. Then every existing `@/…` import resolves to the new
   location **unchanged**. `~/*` already → `src/*`, so `@/*` and `~/*` become synonyms (optionally
   collapse to one alias in a later sweep — that one *is* a churny rename, defer/skip).
3. Update the **non-alias path configs** that name dirs literally:
   - `tailwind.config.js` `content`: drop `./app/**` (gone), `./components/**` → `./src/**/*.{ts,tsx}`.
   - `codegen.client.ts` `documents`: currently `["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"]` →
     just `["src/**/*.{ts,tsx}"]` after the move.
   - `postcss.config.js` (`**/*.module.css`) is already location-agnostic — no change.
   - `tsconfig` `exclude`/`include` — verify globs still cover `src/`.

### Verification

- `npx tsc --noEmit` = 0 errors, `npx astro build` green (alias resolution + Tailwind content).
- `yarn graphql` (codegen) regenerates cleanly with the new `documents` glob — diff `gql.ts` to
  confirm no fragments dropped (all now under `src/`).
- `git mv` preserves history; grep for any lingering literal `"components/"`, `"lib/"`, `"contexts/"`
  path strings outside imports (e.g. in scripts, `bin/`, docker) and fix.
- Dev smoke test: `astro dev`, load a page from each entity type.

---

## Sequencing

1. **Part A** first (small, isolated) — but only with deploy-owner sign-off + the dual-name transition.
2. **Part B** as its own PR — a single mechanical `git mv` + alias-repoint commit is easiest to review
   despite touching many files, since almost no import lines change. Land it when no other large
   branches are in flight (it conflicts trivially with everything).
3. Optional later sweep: collapse `@/*` and `~/*` into one alias — a real rename; only if desired.
