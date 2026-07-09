# CSS / styling pipeline port (#10): keep the stack, verify under Vite

Design doc for moving Meru's styling toolchain onto Astro SSR. Companion to
`docs/astro-migration-prep.md` (step 10). **Decisions below are settled.**

## Decision summary

- **Keep CSS Modules** (D1). Meru has ~128 `*.module.css` files; they compile natively under Vite
  (imported from both `.astro` files and React islands), so there's zero conversion churn. We do
  **not** convert to Astro scoped `<style>`.
- **Keep Tailwind 3 for the initial migration** (D2). Astro runs a project `postcss.config.js`
  natively through Vite, so Meru's current Tailwind-3 + PostCSS stack carries over essentially
  as-is. **The CSS "port" is largely a verification exercise, not a rewrite.**
- **Tailwind 4 is a separate follow-up project**, done after Astro — not stacked onto the framework
  migration. Meru has **zero `@apply`** and no authored `oklab`/`@custom-media`, so there's little
  Tailwind-3-specific coupling; the eventual TW4 upgrade is cleanly decoupled.

hcc-client is only a loose guide here: it chose Tailwind 4 and Astro scoped `<style>` — two things
Meru deliberately does **not** follow. Target Astro version is **7** (hcc is on `astro 7.0.3`).

## What carries over unchanged

- `postcss.config.js` — Vite/Astro picks it up automatically. Keep the plugin chain:
  `postcss-mixins` (with the `@castiron/style-mixins` `@mixin`s across `styles/mixins/*` and
  `styles/base/*`, plus the `fluidScaleRem`/`fluidScalePx` mixins), `postcss-import`,
  `postcss-nested`, `autoprefixer`, `postcss-assign-layer`.
- `tailwind.config.js` — the JS theme (screens, `spacing`/`fontSize` via `pxToRem`/`fluidScale*`
  from `styles/helpers.cjs`, `colors`) stays. **Do not** add `@astrojs/tailwind`: it would inject
  its own base setup and conflict with Meru's hand-rolled `@layer` imports. The manual
  `postcss.config.js` route is the one that preserves the custom cascade.
- The 128 `*.module.css` files and `styles/` tree (`mixins/`, `base/`, `utilities/`, `global.css`).
- `styles/fonts/fonts.css` + `public/fonts/*` — already converted in prep step 2 (self-hosted
  `@font-face`, absolute `/fonts/...` URLs); carries over untouched.

## The `@layer` cascade is an asset under Astro

Meru's explicit layer order in `global.css`:

```
@layer tw-base, styled-components, meru-base, tw-components, meru-utilities,
       meru-components, meru-theme, tw-utilities;
```

Cascade layers define priority **independent of source order**, which makes styling robust against
Astro/Vite CSS bundling and splitting reorders. Keep the layer order and `postcss-assign-layer`
(which files every `*.module.css` into `meru-components`). This is a feature to preserve, not
something to unwind.

## What changes / needs verification

- **Global CSS entry.** Today `import "@/styles/global.css"` in the Next root layouts. In Astro,
  import it once in the root `.astro` layout. Verify the top-of-file `@layer` order statement and
  the `@import "tailwindcss/base" layer(tw-base)` / `.../components layer(tw-components)` /
  `.../utilities layer(tw-utilities)` imports survive Vite's CSS handling with the layer
  assignments intact.
- **hcc's Vite gotcha:** a layer-order declaration served via a `?url` `<link>` is delivered as JS
  under Vite 8. Meru imports `global.css` directly (bundled), so this shouldn't bite — but confirm
  the emitted stylesheet preserves layer order; if a separate layer-order file is ever needed,
  inline it via `?inline`, not `?url`.
- **Tailwind `content` globs.** `tailwind.config.js` `content` currently points at
  `./app/**` + `./components/**`. Repoint to the Astro source tree and include `.astro`, e.g.
  `./src/**/*.{astro,html,js,jsx,ts,tsx}` (exact globs follow the final Astro layout). Wrong globs
  silently purge used utilities — check after the move.
- **CSS Modules composition.** Verify `composes`, `:global()`, and CSS-module class hashing behave
  under Vite as they did under Next (they should; both use the same lightningcss/postcss-modules
  machinery, but spot-check a few complex modules).

## Dead code to drop (verify first)

- **`styled-components` layer + `next.config.js` `compiler.styledComponents: true`** — `styled-
  components` is not a dependency, so this is almost certainly vestigial. Confirm nothing renders
  styled-components, then drop the layer from the `@layer` order and the compiler flag (the flag
  goes with `next.config.js`).
- **`@csstools/postcss-oklab-function`** — no authored `oklab`/`oklch` in `styles/`. Confirm it
  isn't transforming generated color values (e.g. from `styles/helpers.cjs`) before removing;
  otherwise keep it.
- **`postcss-import`, `postcss-nested`, `autoprefixer`** — keep under Tailwind 3. (These get
  absorbed by Lightning CSS only if/when we do the Tailwind 4 project.)

## Verification

- Global styles load: base/reset/typography/theme layers apply; theme classes (`theme-font-*`,
  `theme-custom-*` from `styles/utilities/_theme.css`) resolve; fonts render (prep step 2).
- Cascade order holds: a Tailwind utility, a `meru-*` layer rule, and a `*.module.css` rule that
  intentionally conflict resolve in the same order as on Next (layer priority preserved).
- Tailwind utilities used in markup are **not** purged (content globs correct); responsive
  `screens` breakpoints work; `fluidScale*`/`pxToRem`-derived spacing/typography values match.
- CSS Modules: hashed classes scope correctly; `:global()`/`composes` behave; no leaked/duplicated
  styles.
- Build output: one coherent stylesheet (or Astro's split chunks) with layers intact; no FOUC from
  layer-order loss.

## Deferred: Tailwind 4 (separate project)

Once on Astro, a follow-up migrates to `@tailwindcss/postcss` (Lightning CSS), which folds in
`postcss-import`/`autoprefixer`/nesting/oklab and moves theme config toward CSS-first `@theme`
(or keeps the JS config via `@config`). The sticky part will be reconciling Meru's custom
interleaved `@layer` order and `postcss-assign-layer` with Tailwind 4's built-in layer model —
which is exactly why it's kept out of the framework migration.
