# Astro migration execution plan

Phase breakdown for the actual Next → Astro SSR build-out. Follows the settled design docs:
`astro-auth-plan.md` (#7), `astro-caching-plan.md` (#8), `astro-middleware-plan.md` (#9),
`astro-styling-plan.md` (#10), and the completed prep (steps 1–6 in `astro-migration-prep.md`).

## Core strategy: thin Astro shell, React below the page

**Move only pages (and layouts) to `.astro`; keep every markup-rendering component in React/JSX.**
This is both the smallest footprint and the natural shape of the codebase after the relay→urql
migration:

- `.astro` pages/layouts are the **fetch + route layer**: they run `queryApi` server-side (token
  from `Astro.locals`, per #7), assemble fragment refs, and compose the React tree.
- React components are the **pure view layer**: they take fragment refs as props and unmask with
  codegen's `useFragment` (a pure identity function that runs in server render *and* client
  hydration). **They port unchanged.**

**This is only possible because of the relay→urql work.** Verified: no `components/` file fetches
data except `EntityOrderingLayout` and `ContributorDetail` — and both are already on #7's
client→server conversion list. Every other component is a pure fragment consumer.

### Rendering: server-render React by default, islands only where interactive

In Astro, a React component used in `.astro` **without** a `client:*` directive is server-rendered
to HTML with **zero JS**. Add `client:load`/`client:visible`/`client:only` only to genuinely
interactive subtrees ("islands"). So:

- Static markup (the vast majority) → React, server-rendered, no JS shipped.
- Interactive widgets (dropdowns, modals, pickers, PDF viewer, progress bar, and the kept client
  queries — analytics + `ViewCounter`) → React **islands** with `client:*`.
- search / entity-ordering / contributor-pagination → React, **server-rendered**, interactivity via
  URL-param navigation (per #7; the one set of components whose internals change).

There are **57 `"use client"` files** today — a rough upper bound on island candidates, but many
aren't actually interactive and can be server-rendered. Right-size per component.

### Two constraints this creates (and how we handle them)

1. **Islands don't share React context** — each island is an independent React root, so a Context
   Provider in one island doesn't reach another. Meru's cross-tree contexts (`ViewerContext`,
   `GlobalStaticContext`, `ThemeProvider`, `CommunityContext`) are consumed by island widgets
   (AccountDropdown, CommunityPicker, nav). Fix: the server already has this data
   (`locals` for viewer per #7; global/theme/community fetched in the layout), so **pass it as
   props** to each island. Use a nanostore only for state that must be *shared and mutable across
   islands* (likely little to none once viewer comes from the server).
2. **No partial hydration inside a server-rendered React tree** — you can't nest a `client:load`
   child inside a non-island React parent and hydrate just the child. If an interactive widget is
   deep in a static tree, either hoist it to compose at the `.astro` level, or make a larger
   ancestor the island. **Default to server-render + hoist interactive leaves**; accept a coarser
   (larger) island only where hoisting is costly. Island-granularity optimization is a deferred
   pass, not a phase-1 concern.

Island props are serialized to the client for hydration — fragment refs are plain JSON (a relay→
urql outcome), so they cross the island boundary fine.

## Phases

### Phase 0 — Scaffold + prove the stack end-to-end
- New Astro 7 app: `output: 'server'`, `@astrojs/node` adapter, `@astrojs/react`. **Decide repo
  structure** (open decision below).
- Wire the settled infra: `postcss.config.js` + `tailwind.config.js` as-is (#10); reuse the
  existing codegen client-preset + `lib/api/` urql clients; stand up the auth cookie stack +
  `attachUserAndSession` middleware (#7/#9); the `/api/graphql` proxy (#7); the `cache` provider +
  config (#8).
- **Proof page:** one `.astro` route that `queryApi`s the API, renders a React component with
  fragment data server-side, plus one hydrated island. Validates data + React SSR/hydration +
  fragment masking across the boundary + styling + adapter in one shot before porting anything real.

### Phase 1 — Root layout + global chrome
- Port `app/[frontend]/layout.tsx` + `(pages)/layout.tsx` → Astro layout(s): `<html>`/`<head>`,
  theme classes + fonts (prep step 2), global CSS, metadata (render `<head>` from the neutral
  `PageMeta` builders — prep step 4).
- Fetch global data (`getStaticGlobalContextData`, theme) in layout frontmatter; thread to chrome
  as props.
- `AppBody`/`AppHeader`/`AppFooter`: server-render; hoist interactive bits (AccountDropdown,
  SearchModal, mobile nav, CommunityPicker, ProgressBar) to islands fed by props. Replace the
  cross-island contexts with props here first (this is where they concentrate).

### Phase 2 — Port the pages (the bulk)
- Each Next page → `.astro`: frontmatter fetches via `queryApi` (token from `locals`), assembles
  fragment refs, renders the existing React tree (server-rendered) + islands for interactive leaves.
- `notFound()` → `Astro.rewrite('/404')`; `redirect()` → `Astro.redirect()` (the `@/lib/routing`
  server shim's swap point from prep step 1).
- Order: simplest first (`unauthorized`, home) → entity landing + subpages (items/collections/
  communities and their `metadata`/`files`/`contributors`/`page/[page]`/`browse`/`announcements`)
  → contributors. ~28 `queryApi`-calling pages/layouts to port; components reused unchanged.

### Phase 3 — Client → server query conversions (#7)
- `SearchLayout`, `EntityOrderingLayout`, `ContributorDetail`: rework from client `useQuery` +
  `useState(vars)` + `router.push` to **server-rendered + URL-param navigation** — the `.astro`
  page reads params and fetches; controls become forms/links; smooth with Astro **View
  Transitions**. These are the only components whose internals change.

### Phase 4 — Interactive islands + client data (#7)
- `ArticleAnalyticsBlock` + `ViewCounter`: keep as React islands; point their urql client at the
  relative `/api/graphql` proxy (anonymous pass-through; cookie token injected server-side for
  preview). Delete the client-token path (`/api/viewer` token, `clientToken`, `UrqlProvider`
  Bearer).
- Remaining genuine islands (PDF viewer — already `clientOnly` from prep step 3 — modals, dropdowns,
  forms, progress bar) marked `client:*` with props.

### Phase 4b — Runtime MDX rendering (its own workstream)
**Pervasive and core:** most entity content (descriptions, RTE fields) arrives as **MDX strings in
the API payload** and is rendered at runtime — not from `.mdx` files. `BlockSlotWrapper` /
`InlineSlotWrapper` (`"use client"`) call `next-mdx-remote`'s `serialize` in a `useEffect` and
render `<MDXRemote components={...}>` with a rich custom component map (~15 components: `EntityLink`,
`Asset`, `PDFViewer`, `MetadataItem`, `DotList`, `VariablePrecisionDate`, `CopyLink`, …), consuming
`useViewerContext` (admin error copy) and `react-i18next`.

- **Stays React** (an island), per the core strategy. `@astrojs/mdx` does **not** apply — that's
  build-time `.mdx` files, not runtime strings.
- **Verify `next-mdx-remote` runs under Vite/Astro.** The classic `serialize` + `<MDXRemote>` API is
  framework-agnostic React (not tied to Next), so it likely ports as-is; if it fights Vite, swap the
  runtime to a neutral compiler (`@mdx-js/mdx` `evaluate`/`run`, or `mdx-bundler`). **This is the one
  real risk in the MDX port** — validate early.
- **Optimization (recommended): move `serialize` to the server.** Today it runs in the browser
  (ships the MDX compiler + compiles per render). The intended `next-mdx-remote` split is
  serialize-on-server / `<MDXRemote>`-on-client: serialize in `.astro` frontmatter (or a server
  helper) and pass the serializable `MDXRemoteSerializeResult` (`{compiledSource, scope, frontmatter}`)
  as a prop to the render island — removes the compiler from the client bundle.
- **Island deps → props:** the wrapper's `allowedActions`/`isAdmin` come from the server viewer
  (#7) as a prop; i18n stays client-side (the island uses the `react-i18next` provider). The custom
  components (some interactive — `PDFViewer` is a `clientOnly` island, `CopyLink`) hydrate within
  the MDX island's React tree.

### Phase 5 — Auth / preview / revalidation end-to-end (#7/#8/#9)
- `/api/login` callback + `refresh`/`logout` actions + `attachUserAndSession` (#7); `/preview/
  [entity]/[slug]` + `/permalink/[permalink]` routes (#9); `/api/revalidate` + per-route
  `cache.set({maxAge,swr,tags})` (#8). Validate sign-in, preview (draft content + analytics refetch
  via proxy), logout, and webhook invalidation against real pages.

### Phase 6 — Cutover + teardown
- Delete Next: `app/`, `next.config.js`, Next `middleware.ts`, `next-auth`/`@auth/core`, the Redis
  cache handler + `@trieb.work/nextjs-turbo-redis-cache` + `redis`, and the whole `[frontend]`/
  `/dynamic` scaffolding.
- MDX deps: `@next/mdx` + `@mdx-js/loader` (the file-based loader) and `pageExtensions` drop — no
  `.mdx` pages exist. **`next-mdx-remote` (+ `@mdx-js/mdx`, `remark-gfm`) stays** unless Phase 4b
  swapped the runtime compiler; `mdx-components.tsx` (the Next App-Router `useMDXComponents` hook)
  drops.
- Dockerfile → `astro build` / `astro preview` (node adapter); `package.json` scripts; env
  rename `NEXT_PUBLIC_*` → Astro runtime env (`import.meta.env` / `Astro.locals`). Note: the client
  no longer needs the API URL (the proxy), removing the `NEXT_PUBLIC_API_URL`-in-browser problem.
- Final verification via the `verify` / `run` skills against the full flow list in each design doc.

### Deferred (explicitly out of scope)
- Island-granularity optimization (carve static regions out of coarse islands to cut JS/hydration
  payload).
- Tailwind 3 → 4 (`astro-styling-plan.md`).
- Per-request / multi-locale i18n (thread `Astro.currentLocale` into the instance). Not needed
  while single-locale — see the i18n note below.
- Redis-backed cache provider (only if a tenant is ever scaled past one instance, per #8).

## Cross-cutting notes

- **Data fetching only in `.astro`** — components can't fetch. All server fetches (currently in
  pages/layouts + `getStatic*` + metadata builders) live in `.astro` frontmatter; results thread
  down as fragment-ref props. Already the shape after relay→urql, so little hoisting needed.
- **Astro inverts the layout/page data flow — this deletes `SetCommunityContext`.** In Next the
  layout renders the page (`children` is opaque), so the item page — which fetches the item and thus
  discovers its community — must push that community *back up* to the already-rendered global header
  via a `"use client"` context setter (`SetCommunityContext` + `useState`). In Astro the **page
  renders the layout**: `item.astro` fetches the item first, then `<BaseLayout community={item.community}>`
  passes it *in* as a prop → header island. No setter, no cross-island state. `SetCommunityContext`
  and `CommunityContext` both delete; the layout takes an optional `community` prop (item/collection
  pages derive it from the entity, community pages from the slug, home/search pass none). With View
  Transitions, let the header island re-render per navigation (not `transition:persist`) so the new
  community takes effect.
- **`useFragment` works in islands** — it's a pure runtime identity function; a hydrated island
  receiving a serialized fragment ref unmasks it exactly as on the server.
- **Env/config** — the browser stops needing the API URL (proxy), so per-tenant runtime config is a
  server-only concern; drop the `NEXT_PUBLIC_*` client inlining entirely.
- **i18n must render on the server, not just the client.** Keep `react-i18next`, but it is **not**
  client-only: 57 of 79 `t()`-using files become server-rendered React (they work in Next only
  because they sit under `"use client"` boundaries), so untranslated SSR HTML would ship and never
  hydrate. Because Meru is single-locale (`en.json`, `DEFAULT_LNG = "en-US"`, synchronous bundled
  resources), the fix is small: make the shared i18next init **SSR-safe** — drop/guard the browser
  `LanguageDetector` (`i18n.ts` `.use(LanguageDetector)` touches `window` and throws on the server)
  and force `lng: "en-US"`. Then `t()` resolves identically in server render and islands. No
  `Astro.locals.t` / per-request locale needed until multi-locale (deferred).

## Settled decisions

1. **Repo structure — in-place, move-over (Next is NOT kept runnable).** Astro is built in-place in
   `meru-client` (`src/` + `astro.config`), and we **migrate rather than coexist**: Next is not kept
   green during the port. This drops the coexistence tax:
   - **Routing shim rewritten in place, no aliasing.** `lib/routing/hooks.ts` (etc.) are edited
     directly to Astro impls (`usePathname` = `window.location`, `useRouter` = History, …). No
     `astro.config` alias is needed (that was only to keep `next/navigation` working simultaneously).
     The prep-step-1 shim still pays off — one file to change instead of 49.
   - **Natural query names.** Codegen no longer scans a live Next tree, so no `*AstroQuery`
     suffixing; narrow the `documents` glob (drop `app/**` as pages port; keep `components/`,
     `contexts/`, `helpers/`, `src/`, …) and reuse plain operation names.
   - **Delete-as-we-go.** `next.config.js`, `middleware.ts`, `app/` pages, and the `[frontend]`/
     `/dynamic` scaffolding are removed as their Astro equivalents land — not a big Phase 6 sweep.
   - Trade-off: we lose easy A/B regression diffing of Next vs Astro output; verify Astro directly.
2. **Default island granularity — fine-grained** (server-render by default, hoist interactive
   leaves), accepting a coarser island only where hoisting is disproportionately costly; revisit in
   the deferred optimization pass.
