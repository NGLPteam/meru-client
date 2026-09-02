# Server-rendered MDX + island granularity for entity pages

> **Status (2026-09-02): All phases (1–6) shipped.** Remaining follow-ups live
> in "Out of scope" — chiefly the header/footer island props slimming
> (~50KB globalData duplication per page).
> Inline `> Update` notes and ~~struck items~~ record where execution diverged
> from or extended the original plan. Beyond this plan, two adjacent fixes
> shipped alongside: browse/search results became `server:defer` islands with
> LoadingBlock fallbacks (slow API selections no longer block the page swap),
> and the Google Charts head loader gained `data-astro-transition-persist`
> (ClientRouter does not keep head scripts across swaps).

## Context

The Astro migration ported entity pages (items/collections/communities/home) as single
`client:load` React islands (`src/pages/*/_components/*Landing.tsx` etc. wrapped in
`AppProviders`). Astro SSRs these islands, so page _structure_ is server-rendered — but
measurement against the built server (community landing page) showed:

- **CMS-authored text is absent from server HTML.** All editorial content flows through
  API "template slots" rendered by `BlockSlotWrapper`/`InlineSlotWrapper`
  (`src/components/templates/mdx/`), which compile MDX **in the browser** via
  `next-mdx-remote` `serialize()` inside `useEffect`. 25 components use these wrappers
  (every list-block header, hero detail/sidebar/title blocks, Detail templates). Server
  HTML contains empty headings and zero body paragraphs; text pops in post-hydration.
  SEO + CLS impact; the MDX compiler ships in the client bundle.
- **97% of the page payload is serialized island props.** The measured page was 2.07 MB,
  of which 2.0 MB was `astro-island` props JSON (881 slug fields): the page island
  carries the entire query result (including raw markdown), and each header/footer
  island re-carries `globalData`.

Both problems share a root cause — one giant island receives the whole query result and
does too much client-side — so this project fixes them together: split entity page
bodies into server-rendered content with small hydrated islands, and compile MDX
server-side so slot text lands in server HTML and drops out of props.

`next-mdx-remote` (maintenance-mode, Next-branded) is removed as a side effect.

Constraints (invariants from the migration):

- Cache safety: no viewer identity in URL-keyed cached HTML; per-viewer UI stays in
  `server:defer` islands with cache opt-out (pattern: `AccountNav`).
- SSR-on-navigation: search/browse/pagination are URL pushes re-rendered server-side.
- ClientRouter view transitions: no runtime-injected scripts; islands must survive swaps.
- hcc-client is the model project — copy its patterns where they exist.

## Exploration findings

**hcc-client (model project) is zero-React**: 231 `.astro` files, no `client:*` directives at
all. Patterns: content-block factory (`__typename` → `.astro` component map,
`if (!Block) return`); CMS rich text via `set:html` (Craft delivers HTML — meru's API
delivers true MDX, so meru needs a server compile step hcc doesn't); interactivity via
native custom elements that wrap server-rendered markup through `<slot/>` (slot contract
via `data-*` attrs, one AbortController aborted in `disconnectedCallback`,
`customElements.get()` guard — required because ClientRouter tears down/recreates);
search/filters = URL state + server render + `DynamicForm` auto-submit enhancement;
`server:defer` islands take scalar props only and `Astro.cache.set(false)` themselves;
i18n via middleware → `Astro.locals.t`.

**meru MDX system**: slots are true MDX (API emits `<PDFViewer>`, `<SidebarItem>`,
`<MetadataLabel>` component tags + markdown). 23 call-site files via
`shared.slots.graphql.ts`. Block wrapper: remark-gfm + 13-component map (+`assetAsButton`
variant); inline wrapper: no gfm, 4 components, `p→span`. Only `CopyLink` (clipboard) and
`PDFViewer` (react-pdf, `clientOnly`) are interactive MDX components; link-ish ones render
plain `<a>`s that ClientRouter intercepts (no context needed). `@mdx-js/mdx` 3.1.1 is
already a direct dep with `evaluateSync` → wrappers can become synchronous and SSR-render.
Error handling to preserve: ErrorBoundary → `NoContent` + `messages.content`/
`messages.admin_content` (isAdmin currently always false in content islands by design).
Compile errors are currently swallowed (console.debug → null) — unify. Two latent bugs:
`Contributors.tsx` imports the block wrapper under the inline name;
`HeaderTitleBlock.tsx:77` passes `""` instead of `headerSubtitle.content`. Separate
`react-markdown` path (atomic/Markdown, mount-gated) used by page/announcement/bio
renderers — gates must be removed for static rendering.

**meru interactivity inventory** — genuinely stateful in page bodies (MUST hydrate or
become custom elements): MDX wrappers (fixed by phase 1), TOC (DOM heading scan),
BackToTopBlock, CopyLink, PDFViewer/AssetInlinePDF, ViewCounter (own urql client,
slug+isPreview props), ArticleAnalyticsBlock family (metrics route only, needs Theme),
EntityNavBar (search form + reakit dropdowns), BreadcrumbsBar/Breadcrumbs (reakit),
SearchButton+SearchModal, SearchHero, Pagination, ContributorsList (useWindowSize→could
be CSS), CommunityNavListContent (reakit), SearchLayout family (final phase). Everything
else in `src/components/templates/**` is presentational.

**Context threading is cheap**: preview gate = server-known boolean (move to `.astro`
frontmatter like the existing `shouldRenderMainLayout` 302); RouteContext consumers need
only `slug`/`pathname` props (13 files); CommunityContext consumers already receive an
ignored `data` prop; GlobalStaticContext in bodies = one string (installationName);
ThemeProvider = charts only; react-i18next is SSR-safe (needs `import "@/i18n"` in the
static render entry). Islands cannot nest inside statically-rendered React trees — mixing
points (shells, hero composition) become `.astro` files.

## Decisions (user-confirmed)

1. **Static parts stay React**, rendered with no client directive from new `.astro`
   composition points (shells, template factory). No mass `.astro` conversion.
2. **Mixed interactivity**: custom elements for DOM-only behaviors (TOC, BackToTop,
   CopyLink — required anyway inside static MDX output); React islands with scalar/small
   props for forms/dropdowns/analytics; reakit stays.
3. **Search/browse routes in scope as the final phase** (SearchLayout split into static
   results + hydrated filter bar; state already in URL).

## Key mechanisms (verified against installed packages)

**A. Synchronous MDX wrappers.** `@mdx-js/mdx` 3.1.1 (already a direct dep) exports
`evaluateSync(content, {...runtime, remarkPlugins?})` → `{default: MDXContent}`;
`MDXContent` takes a `components` prop directly. `import * as runtime from
"react/jsx-runtime"` supplies Fragment/jsx/jsxs (dev and prod). This makes both wrappers
synchronous — no `useState`/`useEffect` — so they render real content during React SSR,
both inside today's islands and in tomorrow's static trees. Compile errors are caught in
a try/catch and unified onto the `NoContent` + `messages.content`/`messages.admin_content`
path (today they're silently swallowed). On the server, trial-render via
`renderToStaticMarkup` inside the try/catch so component render errors also degrade to
`NoContent` instead of a 500 (parity with today's null-render). Hydration-safe: same
string + same compiler on both sides → identical trees. `evaluateSync` uses `new
Function` — server-side is unaffected; check no restrictive CSP during the Phase 1 window
where the compiler still ships to the client.

**B. `.astro` → static-React composition.** A React component rendered from `.astro` with
no client directive is server-rendered only: zero hydration, zero props serialization.
The ~100 presentational template components stay React and are invoked this way. Islands
must be mounted from `.astro` — never nested inside a static React tree — so every
static/interactive mixing point becomes an `.astro` file (the three shells, hero
composition, Detail/Full, browse list + Pagination). Verified in
`@astrojs/react/dist/server.js`: `.astro` slot children arrive in React as pre-rendered
`StaticHtml` — so keep React subtrees contiguous below each `.astro` point, do
conditional logic (preview gate, processing/full-text checks) in frontmatter on data,
and keep `MainLayout`'s bg-alternation receiving data props (it can't inspect children).
Custom-element _tags_ are the exception: static React renders `<table-of-contents>` etc.
as plain elements. Contexts are replaced by props threaded from frontmatter (`slug`,
`pathname`, `installationName`, community fragment, `isPreview`). i18n needs only
`import "@/i18n"` in the static entry modules (put it in the new `.astro` shells and the
two wrappers; idempotent).

**C. Custom elements** (hcc pattern; meru precedent: `src/components/client/LoadingBar.astro`):
class + AbortController wired in `connectedCallback` with `{signal}`, aborted in
`disconnectedCallback`, `customElements.get()` guard before `define` (survives
ClientRouter re-execution). Since the tags are emitted by React/MDX, definitions live in
one `src/components/client/ContentElements.astro` included from `BaseLayout.astro`, not
beside each tag. Add JSX intrinsic declarations under `src/types/` for `tsc --strict`.

## Phases (each ships independently; `yarn check` + `yarn build` green at every step)

### Phase 1 — Sync MDX wrappers + error unification (immediate SEO payoff app-wide)

- Rewrite `src/components/templates/mdx/BlockSlotWrapper.tsx` (gfm, 13-component map,
  `assetAsButton` swap) and `InlineSlotWrapper.tsx` (no gfm, 4 components, `p→span`)
  per mechanism A. Preserve the gfm asymmetry exactly.
- `isAdmin` stays via `useViewerContext` for now (always false); switch to an
  `isAdmin?: boolean` prop when wrappers go static (Phase 3).
- Fix two latent bugs: `Contributors.tsx:5` (block wrapper imported under inline name —
  check the slot's kind to pick the intended wrapper) and `HeaderTitleBlock.tsx:77`
  (`content={""}` → `headerSubtitle.content`).
- Remove `next-mdx-remote` from package.json.
- Verify: built server → slot text greppable in raw HTML of item/community pages; no
  hydration warnings; CopyLink/PDFViewer still work. Note: MDX compiler ships in client
  bundle only until Phases 3–5 remove hydration.

### Phase 2 — Custom elements for DOM-only behaviors

- Create `src/components/client/ContentElements.astro`: `<table-of-contents>` (port
  `Detail/Full/TOC/TOC.tsx` heading scan + id injection), `<back-to-top>` (port
  `layout/BackToTopBlock`), `<copy-link>` (port clipboard from `mdx/components/CopyLink.tsx`;
  `renderToString(children)` becomes reading `textContent` from already-rendered DOM).
- Include from `BaseLayout.astro`; JSX intrinsics in `src/types/`.
- `TOC.tsx`/`BackToTopBlock.tsx`/`CopyLink.tsx` become thin static React emitting the
  tags (existing CSS modules stay).
- Gotcha: while these still sit inside hydrating islands (until Phase 3), TOC's
  id-injection mutates DOM React reconciled — land Phase 2 with/just before Phase 3
  per route, or defer element definition to `astro:page-load`.
- Verify: all three behaviors on hard load AND after a soft navigation.

### Phase 3 — De-island the landings (items → collections → communities → home)

- New `src/pages/items/_components/ItemShell.astro` (then collection/community
  equivalents; home renders InstanceHero/InstanceCommunities static): frontmatter does
  preview gate (`draftModeEnabled && !shell.canPreview?.value` → static
  `UnauthorizedMessage`), processing/full-text checks (`shouldRenderMainLayout` already
  server-side); body mounts static React (`HeroTemplate`, `NavigationTemplate` with a
  full-text boolean prop replacing the FullTextCheck context, `MainLayout data={...}`)
  as siblings of small islands: `ViewCounter client:load` (slug, isPreview),
  `EntityNavBar client:load` (nav fragment slice + slug/pathname), `BreadcrumbsBar
client:load` (installationName prop), `SearchHero`/`SearchButton`+`SearchModal` islands
  where heroes need them.
- Props threading: the 13 RouteContext consumers get `slug`/`pathname` props;
  `CommunityName`/`CommunityNavList` use their existing (currently ignored) `data` prop
  instead of CommunityContext; delete `useIsMounted` gates on react-markdown components
  that no longer hydrate; convert `ContributorsList`'s `useWindowSize` limit to CSS
  (removes an island).
- Cut over the four route files; delete `ItemLanding.tsx`/`ItemShell.tsx` + equivalents.
- Verify per route: props bytes measured before/after (target: community page 2.0MB →
  <50KB), slot text in HTML, interactive QA (search, dropdowns, view counter fires once
  and pauses in preview, preview gate both ways, soft nav).

### Phase 4 — Sub-routes

- Same treatment: metadata, files (+ file detail), contributors, page, announcement,
  browse/ordering (static list + `Pagination client:load` with scalar props — the list
  block containing Pagination becomes an `.astro` composition point), ContributorPage.
- `Detail/Full` is the densest spot → `Full.astro` composition: frontmatter detects
  `body.content.startsWith("<PDFViewer")` and mounts the PDF island there; otherwise
  static prose + `<table-of-contents>`/`<back-to-top>` elements.
- `ItemMetrics` stays an island but slims: mount `ArticleAnalyticsBlock` with `theme`
  scalar prop (only ThemeProvider consumer) + its own urql client (already).

### Phase 5 — Search/browse routes

> Update 2026-09-01: browse routes got a further treatment — the ordering list
> is now a `server:defer` island (`OrderingList.astro`) with a LoadingBlock
> fallback, because the ordering query is multi-second on large orderings; the
> shell renders immediately. The Phase 5 search split should consider the same
> pattern for slow search queries.

- Split `SearchLayout` at `.astro` composition in the three search pages + GlobalSearch:
  static results list (state already in URL, fetched server-side) + hydrated filter-bar
  island (props: current values parsed from URL + facet options) + Pagination island.
- Form defaults must come from the URL so server/client agree; submits produce
  navigations (already the SSR-on-navigation architecture).
- Verify: filter → URL → server re-render; back/forward restores state.

### Phase 6 — Cleanup

> Update 2026-09-02: Phase 6 shipped, and went further than planned — the
> routing shim was deleted ENTIRELY (no header-island residue): once every
> state-hook consumer took props, `RouteContext`/`RouteProvider` and all four
> hooks had zero consumers. As executed:
>
> - `CommunityContext` deleted. Its bundle fragment lives on as
>   `ActiveCommunityFragment` (`src/components/global/graphql.ts`); header/
>   footer islands unmask it and pass the pieces down as plain props
>   (CommunityPicker's active title now uses its existing `activeData` prop).
> - `useIsMounted` gate removed from `BaseMarkdown` (+ the `skipMountCheck`
>   prop) — it was hiding announcement bodies in static trees. The gates in
>   `BaseDropdown` (reakit ids), `AssetPDFPreview` and `ChartBlock`
>   (browser-only libs) are load-bearing inside hydrating islands and stay;
>   the hook's comment now documents the static-tree hazard.
> - `lib/routing/Link` moved to `src/components/atomic/links/BaseLink`
>   (components don't live in lib); all `NextLink` naming removed.
> - `useRouter` inlined: `navigate()` from `astro:transitions/client` at push
>   sites; soft-refresh callers share `src/lib/routing/refresh.ts`.
> - `Pagination` reads `window.location` at click time (handler-only, never at
>   render) — no route props needed, which let the Pagination/Ordering/
>   Contributor island wrappers drop `RouteProvider` without new threading.
> - `SearchFilters`/`SearchOrderBy` take `pathname`/`search` props (needed at
>   render for defaultValues); `SearchHero` requires `pathname`.
> - MainLayout threads `slug` through `TemplateFactory` to list blocks
>   (`SummaryListBlock` self-link suppression). `Detail/Summary` passes its
>   entity's own slug to `Announcements`; `Pages/List` selects the entity slug
>   in its fragment (also fixed a stray `}` in its href template).
> - The community nav's active-page highlight is an explicit `pageSlug`
>   thread: BaseLayout (`routeParams.page`) → AppHeader → nav islands, and
>   page routes → CommunityShell → CommunityNavBar.
> - Deleted: `src/lib/vendor/`, `lib/routing/hooks.ts`, `RouteContext.tsx`,
>   `Link.tsx`, `useRouteSlug`, `useRoutePageSlug`, `routeQueryArrayToString`,
>   `useFullTextCheck` + its context. `BaseLayout.routeParams` survives only
>   to feed `pageSlug`.

- ~~Delete `AppProviders.tsx` and the `Landing`/`Shell` `.tsx` files~~ — all done
  during Phases 3–5 (AppProviders hit zero consumers when the search routes
  converted; knip flagged it). ~~Still to do: delete `CommunityContext`, remaining
  dead `useIsMounted` gates (`shouldRenderMainLayout`/`hasPDFFullText` stay).~~
- **Routing-shim wind-down** (decided 2026-09-01; do NOT remove wholesale before
  Phase 5 — its biggest consumers are the search/pagination components Phase 5
  rewrites anyway):
  1. Collapse the link chain: delete `src/lib/vendor/react-transition-progress/`
     and point `NamedLink` (and other importers) straight at `src/lib/routing/Link`.
     The vendored layer's interception duplicates ClientRouter's own anchor handling
     (LoadingBar runs off astro events, not the interception) and is already bypassed
     for `scroll={false}` links. Low-risk, can even land before Phase 5.
  2. After Phase 5, convert the residual hook consumers (whatever still reads
     `usePathname`/`useParams` as fallback rather than props) to props, shrink
     `useRouter` to a thin `navigate()` wrapper or inline it at call sites, and
     delete `RouteContext`/`RouteProvider` + the hook fallbacks added during
     Phases 3–4.
  3. Scope boundary: the header/footer islands read RouteProvider via
     `GlobalIslandProviders` — that dependency is part of the header/footer island
     slimming follow-up, NOT this project. `RouteContext` can only be fully deleted
     when that lands; until then shrink the shim to `Link` + `RouteContext` used by
     header islands only.
  4. Keep `data-keep-scroll`/`KeepScroll.astro` — it's ClientRouter-native, not part
     of the shim; `Link`'s `scroll={false}` → marker mapping survives whatever else
     is removed (or callers write the data attribute directly if `Link` goes too).

> Update 2026-09-02: done. As executed, two component-consumed groups moved to
> component-scoped homes instead of route dirs: the two ordering queries →
> `EntityOrderingLayout/graphql.ts` (their only consumer is the OrderingList
> server island), and `search.ts` → `src/components/composed/search/graphql.ts`
> (shared by three route dirs + SearchResults.astro). `home.ts` →
> `src/pages/_components/graphql.ts`; `preview.ts` → `src/lib/preview/graphql.ts`.
> Meta fragments moved WITH their entity files (lib/metadata imports the
> `_components/graphql` modules); `shared.slots.graphql.ts` and
> `lib/sitemap/queries.ts` stayed put. `src/lib/queries/` is gone.

- **Colocate queries hcc-style** (decided 2026-09-01): move `lib/queries/*` to
  route-scoped `graphql.ts` files — `item.ts` → `src/pages/items/_components/graphql.ts`
  (serves all item routes), same for collection/community/contributor/home/search;
  `layout.ts` → `src/layouts/graphql.ts` beside BaseLayout. Constraint: bare `.ts`
  directly under `src/pages/` is an API endpoint, so query files must sit inside
  `_`-prefixed dirs. Keep shared: meta fragments (consumed by `lib/metadata`
  builders), `templates/shared/shared.slots.graphql.ts`, `lib/sitemap/queries.ts`.
  Pure file-move + import updates — no GraphQL name changes, no codegen churn.
- Audit `react-error-boundary` usage; reakit stays.
  > Update 2026-09-02: audited — stays. The MDX wrappers use it deliberately
  > for client hydration errors (SSR safety comes from the trial-render
  > try/catch); BaseMarkdown's boundary is inert in static trees, useful in
  > the footer island.
- `yarn check` (knip will surface the dead code) + final measurements.
  > Update 2026-09-02: `yarn check` + `yarn build` green. Built-server
  > measurements: community landing 121.5KB total / 51.7KB props (down from
  > 124KB / 56KB — route/context prop duplication removed); search shell
  > 143KB / 87.6KB; browse shell 95KB / 51.5KB; item 110.6KB / 55.4KB.
  > Headless (prod build, system Chrome): 11/11 islands hydrate; filter
  > submit → `?q=…&page=1&schema=…`, order-by → `?order=…`, pagination →
  > `?page=2`; zero console errors.

## Verification

1. `yarn check && yarn build` at the end of every phase.
2. Built-server measurements per phase 3–5: `node dist/server/entry.mjs`, then per route:
   total bytes (`curl | wc -c`), props bytes (`grep -o 'props="[^"]*"' | awk length-sum`
   — baseline: community landing 2.07MB total / 2.0MB props), slot-text grep for a known
   sentence.
3. Manual QA: preview gate (both outcomes), TOC/back-to-top/copy-link on hard + soft nav,
   PDF item, search filter/paginate/back-button, nav dropdowns, breadcrumbs overflow +
   share, view counter behavior, metrics charts + theme, no hydration warnings on all 18
   routes, no-JS smoke (content fully readable with JS disabled).

## Out of scope

- Tailwind 4; `.astro` conversion of presentational React components; `Astro.locals.t`
  i18n port; viewer-aware admin error copy (prop plumbing left in place); header/footer
  `server:defer` island props slimming (natural follow-up project); MDX compile LRU
  (only if profiling demands).
