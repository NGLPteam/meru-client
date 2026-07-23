# Header/footer server islands — per-viewer chrome out of the response cache (#8)

Final step of the caching migration (companion to `astro-caching-plan.md` and
`astro-execution-plan.md`). **As-built.** Reference impl: `../hcc-client`
(`UserNav.astro`).

## Problem

The response cache (`src/lib/caching/`) uses Astro's `memoryCache`: **URL-keyed,
`Cookie` stripped from `Vary`**. `cacheGlobal`/`cacheEntity` gate only on
`astro.cache.enabled`, not on auth; `draftAwareProvider` bypasses only the draft
cookie. Every cacheable page resolved `getViewer(Astro)` and threaded it into
`client:load` islands (header, footer, and each entity content island), so Astro
serialized the viewer into the `<astro-island>` hydration payload embedded in the
cached HTML. The first authenticated requester's identity (`name`, `avatarUrl`,
`canAccessAdmin`, `allowedActions`) was baked into the cache and re-served to
everyone. Caching could not be safely enabled for authenticated traffic.

## Fix

No viewer data may live in cached HTML. Per-viewer UI renders from a `server:defer`
island that resolves the viewer itself and opts its deferred response out of the
cache; non-identity uses of the viewer are reduced to narrow booleans.

### The `server:defer` mechanism

`AccountNav.astro` / `FooterNav.astro` resolve `getViewer(Astro)` (memoized on
`Astro.locals`; the middleware runs on the server-island request too), read
`isDraftModeEnabled(Astro)`, and call **`if (Astro.cache.enabled) Astro.cache.set(false)`**
— required, because the deferred response flows through the same URL-keyed cache
and would otherwise be cross-served. The cached page HTML carries only the
placeholder + an anonymous `slot="fallback"`.

### Header — composition moved to Astro

`AppHeader.astro` replaces the monolithic `AppHeader.tsx` client island. Route-based
visibility (`isCommunityRoot`, `hideSearch`) is computed from `Astro.url` and
re-evaluated per navigation, so the header no longer needs a client `usePathname()`
for gating. Interactive leaves stay React islands wrapped in the new **viewer-free**
`ChromeLeafProviders` (`HeaderBrandIsland`, `HeaderNavIsland`); their `<astro-island>`
wrappers are `display:contents` (Astro default), so the flex layout is unaffected.
The account slot is:

```astro
<AccountNav
  server:defer
  transition:persist="account-nav"
  condensed={!isCommunityRoot}
>
  <AccountDropdownIsland slot="fallback" condensed={!isCommunityRoot} />
</AccountNav>
```

- **Fallback** = `AccountDropdownIsland` with no `viewer` → `ViewerContext` defaults to
  `isAuthenticated:false` → the anonymous sign-in branch (no separate component).
- **`transition:persist="account-nav"`** on the account island only, so authed users
  don't see the sign-in fallback re-flash on every soft navigation (identity is
  session-stable; sign-in/out hard-navigate). The rest of the header re-renders per
  nav for gating — following `astro-execution-plan.md` line 167 ("not
  `transition:persist`" on the header as a whole).

### Header mobile — native `<dialog>`

The mobile account UI was inside the shared reakit `BaseDrawer` (client-only via
`useIsMounted`), which cannot host an Astro island. `HeaderMobileMenu.astro` gives the
header its own native `<dialog>` (opened via `showModal()` by the framework-free
`MobileMenuManager` custom element — toggle wiring, Escape, backdrop-click, close via
`<form method="dialog">`). The shared `BaseDrawer` is untouched (still used by
`SearchLayout`). The mobile leaves are `client:visible` islands (`HeaderMobileParts`);
the mobile account nav is `<AccountNav server:defer mobile>`.

### Footer — same treatment

The footer's only viewer-dependent part is the "Explore" nav (admin link + sign-in
item). `AppFooter.astro` composes a viewer-free `FooterBodyIsland` plus
`<FooterNav server:defer>` (→ `FooterNavIsland` → `FooterNavContent`), with an
anonymous fallback. Grid placement is by named areas, so body and nav are independent
siblings.

### Content islands — drop the viewer blob

`ChromeProviders` (the page-content provider stack, via `AppProviders` /
`InstanceContent`) no longer takes `viewer`; it seeds `ViewerContext` with **only
`isPreview`** (from the existing `draftModeEnabled` prop). The `viewer` prop was
removed from all page-content islands and from the ~20 entity pages (which also stop
calling `getViewer`). Consequences:

- `ItemShell` / `CollectionShell` / `CommunityShell` and `ViewCounter` read
  `isPreview` — unchanged behavior (draft gate; `isPreview` is always false in cached
  responses anyway).
- MDX `BlockSlotWrapper` / `InlineSlotWrapper` derive `isAdmin` from
  `allowedActions`, which is now empty → **admin-only MDX error copy is disabled**
  (generic "content unavailable" for everyone). Error-path only; accepted.

## Key files

- Header: `src/components/global/AppHeader/{AppHeader.astro, HeaderBrandIsland.tsx,
HeaderNavIsland.tsx, HeaderMobileMenu.astro, HeaderMobileParts.tsx, HeaderPrintName.tsx,
graphql.ts}`
- Footer: `src/components/global/AppFooter/{AppFooter.astro, FooterBodyIsland.tsx,
FooterNav.astro, FooterNavIsland.tsx, FooterNavContent.tsx, graphql.ts}`
- Account island: `src/components/chrome/AccountNav/{AccountNav.astro,
AccountDropdownIsland.tsx, AccountProviders.tsx}`
- Providers: `src/components/chrome/ChromeLeafProviders.tsx` (new, viewer-free),
  `src/components/chrome/ChromeProviders.tsx` (now isPreview-only),
  `src/components/chrome/MobileMenuManager.astro`
- `src/layouts/BaseLayout.astro` (composes AppHeader/AppFooter; no longer fetches
  viewer), ~20 pages under `src/pages/`, ~19 content islands under
  `src/components/pages/`.
- Deleted: `AppHeader.tsx`, `AppFooter.tsx`, `AppHeaderIsland.tsx`, `AppFooterIsland.tsx`,
  the two `AppHeader`/`AppFooter` barrels.

## Verification

1. Authed request must not poison cache: clear cache, request a cacheable page
   authenticated, re-request anonymously within `maxAge` — served HTML shows the
   anonymous sign-in fallback; **no `name`/`avatarUrl`/`allowedActions` in any
   `<astro-island>` props**; `/_server-islands/AccountNav` is not stored.
2. Anonymous cache HIT; account island + footer nav both anonymous.
3. Per-viewer correctness: authed load shows name/avatar/admin/preview/sign-out via the
   deferred swap; sign-in → authed; sign-out → hard reload → anonymous.
4. Desktop dropdown interactive; mobile native dialog opens/closes (toggle, Escape,
   backdrop, close button); shared `BaseDrawer`/`SearchLayout` still work.
5. Footer admin link only when `canAccessAdmin`, sign-in only when anonymous.
6. Content islands: entity-page cached HTML has no viewer in island props; preview gate
   - `ViewCounter` pause still behave via `draftModeEnabled`.
7. View transitions: header persists the account island (no flash), rest re-renders;
   community context updates per nav.
8. Draft mode still bypasses the cache; account island reflects `isPreview`.

Cache is active only in `output:"server"` prod builds (`astro build`); dev has
`Astro.cache.enabled === false`.
