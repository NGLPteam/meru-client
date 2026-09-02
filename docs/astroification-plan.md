# Full astroification of meru-client

## Context

The de-islanding project (docs/astro-islands-mdx-plan.md, complete) left meru-client
as .astro shells rendering static React + lean islands. This project walks the rest
of the way toward the hcc-client model: **.astro + native custom elements everywhere,
except** (user-confirmed "zero-ish React" end state):

- the **MDX slot pipeline** stays React (evaluateSync + react/jsx-runtime, rendered
  server-side) — and therefore the MDX-mapped components and their transitive atoms;
- the **PDF viewer** (react-pdf) and **metrics charts** (react-google-charts) stay
  as React leaf islands;
- `@astrojs/react`, `react`, `react-dom` stay installed.

i18n ports to the hcc pattern (`Astro.locals.t` via i18next getFixedT), and route
context moves onto locals too (**`Astro.locals.slug`** / `Astro.locals.pageSlug`,
user-requested) so slug stops being threaded through the template tree as a prop.

**Hard requirement: every phase ends at a stopping point where the app is fully
working and doesn't look broken** — `yarn check` + `yarn build` green, no
half-hydrated or visually degraded states. CI/deploy is out of scope.

## Exploration facts the plan leans on

- **reakit is one file**: `src/components/atomic/BaseDropdown/BaseDropdown.tsx`
  (Popover only, gated on useIsMounted — which is why every dropdown region is
  forced into an island). ~10 transitive consumers via `atomic/Dropdown`.
- **react-hook-form: 11 files, zero validation rules anywhere** — every use is
  "read values → build URLSearchParams → navigate()". SearchLayout.astro's query
  form is already the native-GET precedent. Filters submit via an explicit Submit
  button; only SearchOrderBy submits on change.
- **`templates/` = 67 tsx files with zero state hooks** (useFragment unmask +
  useTranslation only). 257 tsx total; atomic/composed mostly presentational.
- `EntityOrderingIsland` and `ContributorPage` hydrate ENTIRE page bodies solely
  because `Pagination` is nested inside; `ViewCounter` renders nothing (one
  anonymous fire-and-forget GraphQL query); `UnauthorizedContent` exists only to
  run `import "@/i18n"` client-side; `MobileFooter` has zero interactivity.
- Client-side GraphQL is confined to ViewCounter + ArticleAnalyticsBlock (both
  anonymous, own urql client). ViewerContext/GlobalStaticContext/ThemeProvider
  have 5/3/2 consumers respectively — all near-dead.
- i18n is single-locale en-US, one JSON (`src/lib/locales/en.json`); 72 files use
  useTranslation; a few `<Trans>` with HTML (AssetInlinePDF).
- hcc patterns to port: `attachTFunction` middleware, `DisclosureNav`/
  `NavMenuManager` (aria-controls + `inert` + data-open — NOT the popover API;
  CSS anchor positioning isn't baseline yet), `DynamicForm` auto-submit,
  pagination as links + form-associated number input, `t` never shipped to client.
- Known bug (verified): `theme-helpers.ts` emits `theme-font-ilisarniq` but the CSS
  class is `.theme-font-ilsarniq` (benign for default font — `_root.css` defines the
  same vars — but the class is dead).
- Google Charts loader `<script>` in BaseLayout head is coupled to
  react-google-charts internals (exact src match + `dataset.loaded`) — leave verbatim.

## Server-island rule (state in code comments, applies throughout)

`OrderingList.astro`, `SearchResults.astro`, `AccountNav.astro`, `FooterNav.astro`
are fetched via `/_server-islands/*`, where the page URL is unavailable:
**`locals.t` IS available** (middleware runs on island requests) but **`locals.slug`
is NOT** — these must keep receiving `slug`/`search`/viewer data as encrypted scalar
props. Never "clean up" their props to locals reads.

---

## Phase 1 — Request-context middleware + i18n foundation

Goal: one middleware attaches `t` + route context to `Astro.locals`; the i18next
singleton becomes the single source shared by .astro, server-rendered React, and
(temporarily) react-i18next islands. Zero visual change.

1. Restructure i18n into `src/lib/i18n/` (hcc-style): `config.ts` (from current
   `src/i18n.ts`: en-US, resources from `src/lib/locales`, the `number` formatter),
   `index.ts` exporting the singleton + a bound `t`. `src/i18n.ts` becomes a thin
   client entry that binds `initReactI18next` to the SAME instance — the transition
   bridge, so converted .astro (`locals.t`) and unconverted React (`useTranslation`)
   read identical resources. Drop `i18next-browser-languagedetector` now
   (single-locale; it exists only to be worked around).
2. `src/lib/middleware/attachRequestContext.ts` (model:
   `hcc-client/src/lib/middleware/attachTFunction.ts`):
   - `locals.t = getFixedT("en-US")`; DEV re-reads `en.json` per request
     (removeResourceBundle/addResourceBundle) so string edits don't need restarts.
   - `locals.slug`: parse pathname — slugs are opaque 30–32-char IDs, so
     `^\/(items|collections|communities|contributors)\/([A-Za-z0-9]{20,40})(\/|$)`.
   - `locals.pageSlug`: from `^\/(items|collections|communities)\/[^/]+\/page\/([^/]+)`.
   - Skip `/_server-islands/*` and `/api/*` for the route fields.
   - Register in `src/middleware.ts` sequence.
3. Type `App.Locals` in `src/env.d.ts` (`t`, `slug?`, `pageSlug?`); port hcc's
   i18next `CustomTypeOptions` typing so `t()` keys autocomplete.
4. First consumers: delete `UnauthorizedContent.tsx` island (render its strings in
   `unauthorized.astro` via `locals.t`); `BaseLayout.astro` prefers
   `locals.pageSlug` over the `routeParams` prop (full retirement in Phase 5).
5. Drive-by: align the `theme-font-ilisarniq`/`.theme-font-ilsarniq` spelling.

**Why fine at the end:** additive middleware; the one removed island rendered static
text; all islands share the same i18n instance so every string is identical.

**Verify:** check/build; curl `/unauthorized`, an item page, a `/page/[page]` route;
confirm a dropdown island still translates; DEV locale-JSON hot edit; font class fix.

## Phase 2 — Free-win island removals (no new primitives)

1. `MobileFooter` — drop `client:load`, then convert to .astro with `locals.t`.
2. `SearchHero` ×2 → `SearchHero.astro` with a plain GET form (precedent:
   SearchLayout.astro's query form). Delete the RHF version.
3. `ViewCounter` ×2 → **`<view-counter>`** custom element
   (`src/components/client/ViewCounter.astro`, existing pattern): connectedCallback
   fires one anonymous `fetch` POST of the same GraphQL document; `data-slug`,
   `data-paused` (preview). Renders nothing. Removes a urql + ViewerContext consumer.
4. `DraftModeBannerIsland` → **`<draft-mode-banner>`**: markup in .astro with
   `locals.t`; element script does `import { actions } from "astro:actions"`,
   calls exitPreview, then soft-refreshes.
5. `FooterNavIsland` → `FooterNav.astro` (server:defer, keeps viewer props) renders
   a converted `FooterNavContent.astro`; sign-in click is a tiny element/module
   script calling the existing `signIn()` helper (it's just a location.assign).

**Why fine:** behavior-for-behavior swaps; ViewCounter is invisible by design.

**Verify:** check/build; network tab: view-record fires on item page, NOT in preview;
draft banner exits; footer nav correct logged-in/out; headless island-count drop.

## Phase 3 — Pagination; de-islanding browse/contributor bodies

1. `Pagination.astro` (port `hcc-client/src/components/lists/Pagination/`):
   prev/next/page **links** (page param merged into current search) + a
   form-associated number input submitting via GET. ClientRouter intercepts both →
   soft navs; no JS element needed. Inside server:defer islands
   (SearchResults/OrderingList) build links from the search-state **props**, not
   `Astro.url` (island URL).
2. Convert containers (zero state hooks): `BrowseListLayout`, `BrowseTreeLayout`,
   `EntityOrderingLayout`, `ContributorDetail` → .astro. Interior list items may
   stay static React initially (mixed trees are safe).
3. Delete `PaginationIsland`, `EntityOrderingIsland`, `ContributorPage` wrapper;
   drop `client:load` from `contributors/[slug].astro` + browse routes.
   `BasePagination*/Pagination.tsx` die (grep for MDX usage first).
4. Convert `SearchResults.tsx` interior (or defer to Phase 7 if it drags).

**Why fine:** links + GET form are strictly more robust than the RHF island (work
pre-hydration, which the island never did); markup byte-identical minus islands.

**Verify:** paginate browse/contributor/search; params preserved; number jump;
curl: `astro-island` on `/contributors/[slug]` only in header/footer; HTML size drop.

## Phase 4 — Keystone: disclosure menu element + nav consumers

Decision: port hcc's **`DisclosureNav` + `NavMenuManager`** (aria-controls +
`aria-expanded` + `inert` + `data-open`; Escape/focusout/outside-click close) — not
the popover API (anchor positioning isn't baseline; keeps the two codebases aligned;
meru already ported hcc's MobileMenuManager).

1. `src/components/client/DisclosureMenu/` (+ NavMenuManager for coordinated
   single-open — the header needs it in Phase 5, build both now). Add a delegated
   click-to-close on `[data-close-menu]` items — replaces the old
   `useDropdownContext().hide()` cases (DropdownLink, PreviewModeButton).
2. Styling shim: recreate BaseDropdown's positioning as CSS keyed on `data-open`
   in a shared `Dropdown.astro`, so converted dropdowns look identical.
3. Convert this phase: `BreadcrumbsBar` ×2 (share dropdown; trail → .astro),
   `EntityNavBar` ×2 + `CommunityNavBar` (nav dropdowns + Search GET form) — drop
   their `client:load` in the three shells; `EntityNavList`/`NavDropdown`,
   `PagesList`, `CommunityNavListContent` → .astro with `locals.t`;
   CommunityNavBar reads `locals.pageSlug` (retires the threaded prop).
4. Leave `AccountDropdown`, `CommunityPicker`, `ChartControls` on reakit until
   Phases 5/7 — reakit stays installed; nothing breaks.

**Verify:** dropdown QA matrix (open/close/Escape/outside-click/focus-out/link-click
closes/keyboard); mobile widths; headless: aria-expanded toggling; entity pages
have ~zero islands outside header/footer.

## Phase 5 — Header/footer conversion + globalData retirement

1. Header: `HeaderBrandIsland`, `HeaderNavIsland`, `MobilePicker`, `MobileNav`
   → .astro (CommunityPicker → DisclosureMenu; Search → GET form; NavMenuManager
   wraps the desktop nav).
2. `AccountNav.astro` stays server:defer + `transition:persist` +
   `Astro.cache.set(false)` with viewer props; `AccountDropdownIsland` → .astro +
   DisclosureMenu; sign-out/preview buttons via `astro:actions` element script.
   Fallback slot = converted anonymous .astro menu.
3. Footer: `FooterBodyIsland` → .astro; react-markdown description replaced by a
   new `src/lib/markdown/renderMarkdown.ts` (remark-gfm/rehype-raw → HTML string)
   - `set:html`, with an inline-strip option for `Markdown.Title`-style uses.
     `BaseMarkdown.tsx` stays for React-tree callers until Phase 8.
4. Retirements: `GlobalIslandProviders`, `AccountProviders`, the `globalData` prop
   threading (~50KB/page props duplication — this IS the header-slimming follow-up),
   BaseLayout's `routeParams` prop (locals.pageSlug now).
5. `GlobalStaticContext`: delete when consumers hit zero (here or Phase 7).

**Verify:** props-bytes measurement before/after (expect ~50KB/page drop);
logged-in/out header; community-root variant; mobile menu; AccountNav
transition-persist across soft navs; headless: header/footer island count.

## Phase 6 — Search filters → native forms; remove react-hook-form

1. **Param shape: go flat.** We control both sides (SearchResults.astro parses its
   own `search` prop). The GET form emits native flat/repeated params
   (`schema=a&schema=b`, per-filter params); the parser reads flat params AND keeps
   accepting the legacy `filters=` JSON blob + comma-joined `schema` so old
   bookmarked URLs keep working. Zero client JS on the happy path.
2. Convert `SearchFilters` + the 5 `SearchFilter/Filters/*` input types → .astro;
   `forms/` atoms (Input, Select, Checkbox, CheckboxGroup, Fieldset, Label) get
   .astro twins here (pure markup + CSS-module wrappers). Values pre-fill from the
   search-state props SearchLayout.astro already has. Keep the explicit
   Submit/Clear buttons (current UX — filters do NOT auto-submit).
3. `SearchOrderBy` → native `<select>`; it DOES submit on change — port hcc's
   `dynamic-form` element (or a 5-line change listener) for it, using `form=`
   association where controls sit outside the form (mobile drawer).
4. `SearchBar`, `SearchSchemaFilter` convert alongside; `SearchDrawer` element and
   the native drawer dialog keep working unchanged. `SearchModal`'s RHF goes too
   (native form + the existing dialog).
5. Delete `SearchFiltersIsland` + React filter tree; **remove `react-hook-form`**
   (grep to zero first).

**Verify:** all 5 filter types round-trip; filters+schema+order+page combined;
paste an OLD-format URL and confirm results parse; mobile drawer; modal search;
`git grep react-hook-form` → empty; rebuild.

## Phase 7 — Templates long tail + item-page leaf islands

Batchable; each batch shippable because .astro renders remaining React statically.

1. `MainLayout.tsx` → `.astro`, `Factory.tsx` → `.astro`; converted templates read
   `Astro.locals.slug` (retires the slug threading through Factory → list blocks).
   Move `generateBgMap` to a plain .ts. **Delete `MainLayoutIsland`** — the PDF
   template renders .astro down to `AssetInlinePDF`, which becomes the leaf
   `client:` island directly.
2. Batch-convert `templates/` (Hero family, list blocks, EntityNavigation,
   ProcessingCheck, Detail, Pages, Contributors, Metadata, Blurb…). Per the recipe
   below. NOT converted: `templates/mdx/*` (React forever); templates that mount
   MDX output render the React wrapper statically from .astro.
3. `AssetDetailBlock` → .astro; `AssetPDFPreview` becomes the only island on
   `files/[file]`.
4. `ItemMetricsIsland` shrink: chrome/headings → .astro; island boundary moves to
   the chart family. De-reakit `ChartControls` (DisclosureMenu custom element works
   first-class from React 19). `ThemeProvider` → pass the resolved `colors.json`
   color as a prop; delete the provider. Swap `ArticleAnalyticsBlock` to
   `@urql/core` (enables removing urql React bindings). Leave the Google Charts
   head loader verbatim (+ comment).
5. Delete contexts that hit zero: `ViewerContext`, `useIsMounted` (if orphaned),
   `clientOnly` (if only PDF/charts use it, keep).

**Verify per batch:** check/build; screenshot-compare representative pages
(headless); PDF item pages through; charts render themed and re-query on settings
change; curl item page → only leaf islands.

## Phase 8 — Final i18n cut + dependency/config cleanup

1. i18n final state: server-rendered React (MDX components/wrappers) switches
   `useTranslation` → direct `import { t } from "@/lib/i18n"` (server-side, safe);
   browser islands (charts, PDF) take **translated-string label props** from their
   mounting .astro — no i18next in any client bundle. `<Trans>`-with-HTML cases
   restructure to keys + split markup. Delete `src/i18n.ts` + every
   `import "@/i18n"`; **remove `react-i18next`**.
2. Dependency removals (each gated on `git grep` → zero): `reakit` (+
   `ssr.noExternal` hack + `BaseDropdown/`), `react-hook-form` (Phase 6),
   `react-i18next`, `react-markdown` + `BaseMarkdown.tsx` (if no MDX-tree caller
   remains), `urql` React bindings (+ `UrqlProvider.tsx`).
   **Stay:** `react-error-boundary` (MDX wrappers), `react-intersection-observer`
   (PDF island), `optimizeDeps` for react-pdf/react-google-charts, `@astrojs/react`.
3. Knip sweep for orphans (dead CSS modules, contexts, helpers).
4. Check the "what stays React" contract into `docs/` (appendix below).

**Verify:** full check/build with pruned deps; manual QA rotation (home, search
matrix, community/collection/item, browse+pagination, contributor, PDF item,
metrics, auth states, draft mode, view transitions); headless island audit per
page equals the known leaf inventory; `grep -r i18next dist/client` → empty.

---

## Conversion recipe: presentational .tsx → .astro

1. Frontmatter: imports move as-is; `useFragment(fragment, data)` works verbatim
   (fragments already colocated in sibling `graphql.ts`); Props → `interface Props`
   - `Astro.props`.
2. Markup: `className` → `class`, `classNames()` → `class:list`; CSS module import
   identical; `{cond && <X/>}` and `.map` work as-is.
3. `useTranslation()` → `const { t } = Astro.locals`.
4. Threaded `slug`/`pageSlug` props → `Astro.locals.slug`/`.pageSlug` — adopted
   per-component at conversion time, never as a cross-cutting sweep (React parents
   keep passing props until their own conversion). Exception: components rendered
   inside server:defer islands keep taking `slug` as a prop.
5. React children → `<slot />`; render-props → named slots or restructure.
6. Mixed trees are fine: .astro CAN render React statically (no directive → zero
   hydration) — this is what makes any conversion order safe. MDX wrapper mounts
   stay React children.
7. `<BaseMarkdown>` → `renderMarkdown()` + `set:html`.
8. Delete the .tsx only when `git grep` shows no React-tree importer; if an
   MDX-mapped tree still imports it, the .tsx stays (twin policy below).

## Custom element build order

| Element                                | Phase | Notes                                                                                     |
| -------------------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| `view-counter`                         | 2     | one fetch; `data-paused` for preview                                                      |
| `draft-mode-banner`                    | 2     | astro:actions from module script                                                          |
| pagination                             | 3     | links + form-associated number input; likely no element needed                            |
| `disclosure-menu` + `nav-menu-manager` | 4     | keystone; hcc port; `[data-close-menu]` delegation replaces `useDropdownContext().hide()` |
| `dynamic-form` (auto-submit)           | 6     | for SearchOrderBy only (filters keep explicit Submit)                                     |

All follow the established pattern: AbortController in connectedCallback, abort in
disconnectedCallback, `customElements.get()` guard, `data-*` slot contracts.

## Appendix: what stays React

- MDX pipeline: `templates/mdx/*` wrappers (+ react-error-boundary), evaluateSync
  - react/jsx-runtime. Server-rendered only.
- MDX-mapped components + transitive atoms (Button, Link/NamedLink, IconFactory,
  DownloadLink…) keep `.tsx` permanently.
- PDF island: AssetInlinePDF/AssetPDFPreview (+ react-pdf, pdfjs-dist,
  react-intersection-observer, clientOnly).
- Charts island: ChartBlock/GeoChart/LineColChart (+ react-google-charts),
  ArticleAnalyticsBlock on @urql/core, de-reakit-ed controls, theme color as prop.
- **Twin policy:** default is NO .astro twin — .astro trees render shared React
  atoms statically at zero cost, one source of truth. Create a twin only for
  .astro-only needs (slots wrapping .astro children, custom-element scripts) —
  in practice the `forms/` atoms (Phase 6). Twins share the SAME .module.css and
  carry header comments pointing at each other.
- Installed forever: react, react-dom, @astrojs/react, @mdx-js/mdx, react-pdf,
  pdfjs-dist, react-google-charts, react-error-boundary,
  react-intersection-observer, i18next, @urql/core, @urql/exchange-request-policy.

## Verification toolkit (every phase)

- `yarn check` + `yarn build` — the gate.
- Built server: `node dist/server/entry.mjs`; curl total bytes, props bytes
  (`grep -o 'props="[^"]*"'`), `astro-island` counts per page.
- Headless: playwright from hcc-client's node_modules + system Chrome
  executablePath (established recipe) — island counts, aria-expanded toggling,
  form submissions produce expected URLs, zero console errors.
- Manual QA rotation: auth states, mobile menu, search filter matrix, PDF paging,
  chart settings, view transitions (LoadingBar/KeepScroll unaffected).
