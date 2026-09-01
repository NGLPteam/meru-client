# Lint upgrade: ESLint 10 + Astro-aware, aligned to hcc-client

> **Status: shipped** on branch `lint-eslint10-astro` (off `astro-phase-0`).
> The plan below is the pre-execution record of intent; see
> [Implementation notes (as shipped)](#implementation-notes-as-shipped) at the
> end for what actually changed. The authoritative config is `eslint.config.mjs`
> at the repo root.

## Context

meru-client's lint toolchain is on ESLint 9 with a hand-rolled modular CommonJS
flat config under `src/lib/lint/configs/*`. It does **not** lint `.astro` files at
all, integrates Prettier through the `eslint-plugin-prettier` bridge, carries an
inert `@graphql-eslint` block, and duplicates typescript-eslint (both the meta
package and the split packages installed).

The sibling project **hcc-client** is on a more modern, Astro-aware setup: ESLint
10, `eslint-plugin-astro`, split `@typescript-eslint/*`, Prettier run separately
with `prettier-plugin-astro`, and — critically — all base/js/ts/react rules
centralized in the shared **`@castiron/eslint-config@2.0.0-beta.0`** package (the
org standard, same private registry meru already uses for `@castiron/common-types`
and `@castiron/style-mixins`).

**Decision (confirmed with user):** fully align meru to hcc — adopt the shared
`@castiron/eslint-config` package and the separate-Prettier model. The shared
config peer-requires `typescript >= 6`, so **the TS 5.9 → 6 major bump is in scope
for this work** (it moves out of the "deferred majors" bucket). react-hooks 5 → 7
is a hard requirement (v5 peers eslint ≤9). Outcome: meru's lint setup matches
hcc's, lints `.astro` for the first time, and drops three redundant/dead deps.

This is a lint/tooling change only — no application behavior changes.

## Verified constraints (drive the plan)

- `eslint-plugin-astro@2.1.1`, `astro-eslint-parser`, `prettier-plugin-astro` are
  **ESM-only** → the config **must** be `eslint.config.mjs`. Do **not** add
  `"type":"module"` to `package.json` (would break the CJS `tailwind.config.js` /
  `postcss.config.js`). A `.mjs` extension is ESM regardless; `astro.config.mjs`
  already proves ESM configs load.
- `@typescript-eslint/typescript-estree@8.65` supports `>=4.8.4 <6.1.0` → **TS
  6.0.x is in range**; meru stays on typescript-eslint **8.65** (no bump). TS 6.1+
  would require a ts-eslint bump — not now.
- `eslint-plugin-react` exposes flat-safe `react.configs.flat.recommended`
  (`plugins.react` is an object). Use it — **not** the legacy
  `eslint-plugin-react/configs/recommended` deep path (ESLint 10 drops eslintrc).
- **react-plugin gotcha:** the shared `react.mjs` references `react/react-in-jsx-scope`
  and `react/display-name` but never registers `eslint-plugin-react`. hcc dodges
  this (not a React app); meru **will** import `reactConfig`, so ESLint crashes on
  load unless meru registers `eslint-plugin-react` **before** `reactConfig`.
- react-hooks v7 keeps `configs.recommended.rules` (shape the shared `react.mjs`
  needs). ✓
- All existing `eslint-disable` targets survive the migration (jsx-a11y via
  reactConfig, `@typescript-eslint/*` via tsConfig, core rules): SearchModal,
  SearchLayout, ProcessingMessage, EmptyMessage, LineColChart, settingsReducer
  (`no-redeclare`), useAutoProgress (`react-hooks/exhaustive-deps`), theme
  (`no-useless-escape`). The `src/lib/api/gql/*` blanket-disables are in an ignored
  dir. No suppression needs relocation.

## Dependency changes (`package.json`)

**Add**

- `@castiron/eslint-config`: `2.0.0-beta.0` (exact — beta; `^` on prereleases is unreliable)
- `eslint-plugin-astro`: `^2.1.1`
- `prettier-plugin-astro`: `^0.14.1`

**Bump**

- `eslint`: `^9.39.5` → `^10.7.0`
- `@eslint/js`: `^9.39.5` → `^10.0.1`
- `eslint-plugin-react-hooks`: `^5.2.0` → `^7.1.1` (hard blocker: v5 peers eslint ≤9)
- `globals`: `^16.5.0` → `^17.6.0`
- `prettier`: `3.6.2` (pinned) → `^3.9.5`
- `typescript`: `^5.9.2` → `^6.0.3`

**Keep** (now function as shared-config peers; stay direct devDeps)

- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` `^8.65.0`
- `eslint-plugin-react` `^7.37.5` (now needed for local registration)
- `eslint-plugin-import` `^2.32.0`, `eslint-plugin-jsx-a11y` `^6.10.2`,
  `eslint-plugin-unused-imports` `^4.4.1`

**Remove**

- `typescript-eslint` (meta-package — shared config uses split packages)
- `eslint-plugin-prettier` (moving to separate-Prettier model)
- `@graphql-eslint/eslint-plugin` (inert in meru — no `.graphql` glob, no processor)

## File changes

**Delete**

- `eslint.config.js` (CJS re-export)
- entire `src/lib/lint/` dir (`config.js` + `configs/config-all.js`,
  `config-ts.js`, `config-react.js`, `config-ignores.js`, `config-gql.js`)
- (optional) stale `.eslintcache` for a clean baseline

**Create `eslint.config.mjs`** (repo root):

```js
// @ts-check
import eslintPluginAstro from "eslint-plugin-astro";
import {
  baseConfig,
  jsConfig,
  tsConfig,
  reactConfig,
} from "@castiron/eslint-config";
import react from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";

export default [
  // 1) Global ignores (carried from old config-ignores.js; src/lib/lint/ dropped)
  {
    ignores: [
      "dist/",
      ".astro/",
      "src/lib/api/gql/",
      "src/lib/stubs/",
      "__schema__/",
      "_sitemaps/",
      "src/types/",
      "graphql-schema.d.ts",
      "**/*.xml.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "astro.config.mjs",
      "eslint.config.mjs",
      "prettier.config.mjs",
      ".graphqlrc.ts",
    ],
  },

  // 2) Shared base — excluded from .astro (Astro handled by its own config)
  { ...baseConfig, ignores: ["**/*.astro"] },

  // 3) Shared JS + TS (files-scoped; neither matches *.astro)
  jsConfig,
  tsConfig,

  // 4) Register eslint-plugin-react BEFORE reactConfig (fixes the react-plugin
  //    gotcha; reactConfig's off-switches win on merge because it loads after)
  { files: ["**/*.{jsx,tsx}"], ...react.configs.flat.recommended },

  // 5) Shared React config (react-in-jsx-scope + display-name off)
  reactConfig,

  // 6) Astro
  ...eslintPluginAstro.configs.recommended,

  // 7a) meru local TS/TSX deltas not covered by the shared package
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
        },
      ],
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // 7b) meru local a11y delta (jsx-a11y registered by reactConfig → scope to jsx/tsx)
  { files: ["**/*.{jsx,tsx}"], rules: { "jsx-a11y/anchor-is-valid": "warn" } },
];
```

> The as-shipped config has four additional blocks discovered during execution —
> see [Implementation notes](#implementation-notes-as-shipped).

Merge rationale (load-bearing): flat config merges plugin namespaces across all
matching objects — `unused-imports` comes from `baseConfig`, `@typescript-eslint`
from `tsConfig`, `import` registered locally, `jsx-a11y` from `reactConfig`.
`anchor-is-valid` is scoped to jsx/tsx because jsx-a11y is only registered there
(correct — it's a JSX-only rule). Step 4 before step 5 preserves current meru
behavior (full react recommended minus the two disabled rules).

**Create `prettier.config.mjs`** (repo root):

```js
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
```

**Create `.prettierignore`** (repo root):

```
# Prettier ignores .gitignore entries by default; list generated/build output.
dist/
.astro/
src/lib/api/gql/
__schema__/
_sitemaps/
graphql-schema.d.ts
```

**Scripts (`package.json`)**

```jsonc
"lint": "eslint .",                                            // `eslint .` pulls in .astro
"fix":  "eslint . --fix && prettier . --write --cache --log-level warn",
"format": "prettier . --write --cache --log-level warn",       // optional convenience
"types": "npx tsc --strict"                                    // keep (TS6 verification)
```

Drop `--cache` from `lint` for a clean first run; add `eslint --cache .` back once
the baseline is green. Optionally add hcc-style `"check": "yarn lint && yarn types"`.

## Apply order (verify after each)

1. Branch off `astro-phase-0` (or default).
2. Edit `package.json` (deps + scripts).
3. Delete `eslint.config.js` + `src/lib/lint/`.
4. Create `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`.
5. `yarn install` → confirm lockfile resolves eslint@10, typescript@6,
   react-hooks@7, eslint-plugin-astro@2, prettier-plugin-astro@0.14; no unmet-peer
   errors from `@castiron/eslint-config`.
6. **TS 6 first:** `yarn types` (`tsc --strict`) and `npx astro check` → exit 0.
   TS 6 is the primary non-lint risk; `@astrojs/check@0.9.9` is the likeliest spot
   to need a follow-up bump if it rejects TS 6 (flag, don't pre-bump).
7. **Config loads:** `yarn lint` — confirm no "rule/plugin not found" crash. The
   react-plugin gotcha is the top risk; a `react/react-in-jsx-scope was not found`
   error means step 4 misordered or eslint-plugin-react didn't install.
8. **Auto-fix:** `yarn fix` — clears the bulk of new base rules (`prefer-const`,
   `comma-spacing`, `no-trailing-spaces`, `no-multiple-empty-lines`,
   `spaced-comment`) and reflows long lines toward printWidth 80.
9. **Re-lint + triage** residual (see below).
10. Confirm `.astro` files appear in eslint output (they're linted now).
11. Confirm the ~11 existing suppressions still valid.
12. **Green gate:** `yarn lint` (0 errors; warnings ok), `yarn types`,
    `npx astro check`, `yarn build` all pass. Commit.

## Triage of new errors (adopting `baseConfig` + linting `.astro`)

- **`max-len` (dominant)** — base enforces effective `code: 80`, matching Prettier's
  default printWidth, so after `prettier . --write` most lines comply; residual =
  unsplittable tokens (long type unions, member chains, JSX attrs). ~144/553 ts/tsx
  files have >80-char lines pre-fix; far fewer after fix + string/template/comment
  exemptions. **Preferred:** fix residual by hand (full hcc alignment). **Fallback**
  if friction is heavy (>~2 dozen genuine cases): a local override raising `code`
  (e.g. 100) — but **keep it in sync with Prettier `printWidth`** or they fight.
- **`no-alert`** — 0 occurrences, no action.
- **`.astro` (32 files, mostly `src/pages/**`)** — first-time linting surfaces astro
  - a11y findings (unused frontmatter vars, a11y). Fix cheap ones; targeted disables
    for intentional cases. Land as warnings where possible so they don't block.
- **react-hooks v5→v7** — v7's recommended may add `exhaustive-deps` warnings;
  `rules-of-hooks` is `warn` in reactConfig so no hard errors. Triage, not blocker.

## Risks

- **react-plugin gotcha** (highest, config-load) — mitigated by step 4 ordering.
- **TS 6 major** — risk shifts to `tsc`/`astro check`; `@astrojs/check` is the
  watch item. Validate step 6 before touching lint.
- **max-len ↔ printWidth coupling** — keep equal if a custom printWidth is ever set.
- **Beta shared config** — pin exact; its `base.mjs` stylistic rules are the source
  of most new errors and may shift in later betas (re-triage on bump).
- **`~/*` alias** — `import/order` pathGroups only handle `@/**` (unchanged
  behavior); add `~/**` to pathGroups only if desired.

## Verification (end state)

- `yarn lint` → 0 errors (warnings acceptable), and `.astro` files are covered.
- `yarn types` (`tsc --strict`) and `npx astro check` → exit 0 under TS 6.
- `yarn build` → succeeds.
- All ~11 `eslint-disable` suppressions still resolve to live rules.
- `depcheck` / `package.json` no longer list `typescript-eslint`,
  `eslint-plugin-prettier`, `@graphql-eslint/eslint-plugin`.

---

## Implementation notes (as shipped)

Shipped in two commits: `chore(lint): ESLint 10 + Astro-aware config via
@castiron/eslint-config` (toolchain + config + fixes) and `style: format repo
with Prettier` (one-time repo-wide format, 49 files). All plan deps landed as
specified. Four things came up during execution and changed the final config
beyond the plan's snippet:

1. **`eslint-plugin-react@7.37.5` has no ESLint 10 support** (it's the latest
   published version). Its React-version **auto-detect** path calls
   `context.getFilename()`, removed in ESLint 10, and crashes on config load.
   Fix: pin an explicit React version after `reactConfig` (which sets
   `version: "detect"`), which skips detection while keeping the full
   react-recommended rule set. Watch for a future `eslint-plugin-react` release
   that supports ESLint 10 to drop this pin.

   ```js
   { files: ["**/*.{jsx,tsx}"], settings: { react: { version: "19.2" } } }
   ```

2. **react-hooks scoping — hooks in `.ts` files.** The shared `reactConfig` scopes
   react-hooks to `{jsx,tsx}`, but meru keeps hooks in plain `.ts`
   (`src/hooks/*.ts`), which broke a `react-hooks/exhaustive-deps` disable
   directive (unknown rule) and dropped hook coverage. Added a `.ts` react-hooks
   block, and surfaced the new v7 `react-hooks/set-state-in-effect` rule as a
   **warning** (matches meru's long-standing `warn` posture for `rules-of-hooks`).
   The 4 remaining lint warnings are all `set-state-in-effect` on intentional
   hydration / preview-sync effects (SiteNameIsland, ViewerContext×2, useIsMounted).

   ```js
   { files: ["**/*.ts"], plugins: { "react-hooks": reactHooks },
     rules: { ...reactHooks.configs.recommended.rules } },
   { files: ["**/*.{ts,tsx}"],
     rules: { "react-hooks/rules-of-hooks": "warn",
              "react-hooks/set-state-in-effect": "warn" } },
   ```

3. **`spaced-comment` vs TS triple-slash directives.** The shared base's
   `spaced-comment` flags `/// <reference ... />` (required syntax in `env.d.ts`).
   Added the `markers: ["/"]` exception (scoped off `.astro`).

   ```js
   { files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
     rules: { "spaced-comment": ["error", "always", { markers: ["/"] }] } },
   ```

4. **ESLint ↔ Prettier conflict** in the separate-Prettier model. The shared
   base leaves a few formatting rules on; `comma-spacing` fights Prettier over the
   `<T,>` TSX generic disambiguator (eslint `--fix` adds a space, Prettier removes
   it). Since there is no `eslint-config-prettier` (matching hcc), disabled the
   small set of Prettier-owned rules the base enables. This also removes the
   `max-len ↔ printWidth` coupling risk (Prettier's `printWidth` is now the sole
   authority on line width).
   ```js
   { rules: { "comma-spacing": "off", "max-len": "off",
              "no-trailing-spaces": "off", "no-multiple-empty-lines": "off" } },
   ```

Other execution facts:

- **`max-len` triage never materialized** — Prettier had already normalized line
  lengths in earlier commits, so 0 `max-len` errors (and it's now `off`, per #4).
  Likewise 0 `.astro` errors: `eslint-plugin-astro` recommended enables 11 astro
  rules (verified `astro/no-conflict-set-directives` fires; parser resolves to
  `astro-eslint-parser`), but does not run `no-unused-vars` on frontmatter.
- **TS 6 `baseUrl` deprecation** — `tsc` errored that `baseUrl` is removed in
  TS 7. Kept `baseUrl` with `"ignoreDeprecations": "6.0"` in `tsconfig.json` to
  preserve `@/` and `~/` alias resolution unchanged; revisit at the TS 7 upgrade.
- **`.prettierignore`** additionally excludes the codegen-generated `schema.graphql`
  (792 KB) and vendored `public/` beyond the plan's list.
- **Benign peer warnings** remain (informational): `eslint-plugin-import` and
  `typescript` against ESLint 10 / TS 6 — the same ones hcc tolerates.
