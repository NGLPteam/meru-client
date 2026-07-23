# Auth + `/api/graphql` proxy — implementation spec (#7)

Build-ready spec for the Keycloak-OIDC-on-Astro phase. Companion to and supersedes the
"Concrete build steps" of `docs/astro-auth-plan.md` (the settled design); reconciles that plan
with the code as it actually stands after the route migration. Intersects with
`docs/astro-middleware-plan.md` (#9) and `docs/astro-caching-plan.md` (#8).

Reference implementation: `../hcc-client` (same Keycloak backend, hand-rolled OIDC, no Auth.js).
Verified against both codebases 2026-07-14.

## Locked decisions

- **Drop `next-auth`/`@auth/core`.** Hand-rolled Authorization-Code flow calling Keycloak directly
  (`fetch` + `URLSearchParams`), `jwt-decode` for claims. Port hcc-client's six-piece model.
- **Token never reaches the browser.** Access + refresh tokens live only in httpOnly cookies and,
  per request, in `Astro.locals`. Delete the entire client-token path.
- **Client-query split = SSR-on-navigation** (decided 2026-07-14). Search, browse-ordering, and
  contributor-pagination become server-rendered on navigation (URL-param driven, View Transitions
  smooth it). **Only `ArticleAnalyticsBlock` + `ViewCounter` stay client-side**, and both are
  **anonymous** — no proxy (decided 2026-07-15): `ViewCounter` pauses in preview, `ArticleAnalyticsBlock`
  shows public counts, so neither needs the token. They query `NEXT_PUBLIC_API_URL` directly.

## Meru-specific deltas from the hcc reference (important)

hcc is the shape, but Meru differs in three ways — don't copy hcc blindly:

1. **Bearer, not JWT scheme; access_token, not id_token.** hcc sends `Authorization: JWT <id_token>`
   (Craft convention) and stores the id_token as its session "jwt". Meru's API authorizes with
   `Authorization: Bearer <access_token>` (`lib/api/client.ts` `makeAuthorizedClient`). So Meru's
   session cookie holds the **access_token**; the refresh cookie holds the **refresh_token**.
2. **Viewer identity is a GraphQL object, not JWT claims.** hcc `jwtDecode`s name/email from the
   id_token. Meru resolves a rich viewer (`allowedActions`, `primaryRole`, `canAccessAdmin`,
   `uploadAccess`, `uploadToken`, `avatarUrl`) via a `viewer` GraphQL query
   (`contexts/ViewerContext/fetchViewer.ts` — `fetchViewer`/`resolveViewer`, reusable as-is). So
   Meru resolves the viewer **server-side** and seeds it into `ViewerContext` via props (like
   theme/community/route are already threaded) — no client `/api/viewer` fetch.
3. **Generic proxy, not per-query endpoints.** hcc has no generic `/api/graphql`; it uses
   purpose-built JSON endpoints. Meru only has two kept client queries, so a single generic
   passthrough proxy is simpler and sufficient.

## Reuse vs. delete vs. convert (current code)

**Reuse (as a reference, not by import):**

- `lib/auth/keycloak.ts` — the root Next file stays live for the coexisting Next app (only
  `initAuth.ts`, itself Next-only, imports it) and is deleted in step 8. Build a **fresh**
  `src/lib/auth/keycloak.ts` instead — port only the clean core (the issuer + token-URL join logic)
  and **add** `AUTH_URL` + `LOGOUT_URL` builders (neither exists today). The Next `refreshAccessToken`/
  `refreshTokenBodyFor` are typed on `@auth/core`'s `JWT` and return next-auth-shaped token objects —
  do NOT reuse; write cookie-model grants (`exchangeCode`, `refreshTokens`) returning the raw Keycloak
  token response. Server-only auth code reads env `process.env[k] ?? import.meta.env[k]`
  (verified 2026-07-14): prod (standalone node) injects every var incl. the unprefixed secret into
  `process.env` at runtime (authoritative); dev (`astro dev`) exposes them ONLY on server-side
  `import.meta.env`, never `process.env`. (The `robots.txt.ts` "process.env is safe" comment is wrong
  for dev — its `NO_BOTS` just silently defaulted to false, so the gap went unnoticed.)
  **No `jwt-decode` needed** — identity comes from the GraphQL viewer, and access-token expiry is
  encoded as the access cookie's own `maxAge` (see step 1).
- `lib/api/queryApi.ts` — already has the `options.token` seam (feed from `Astro.locals`).
- `lib/api/client.ts` `makeAuthorizedClient` (Bearer) — unchanged.
- `contexts/ViewerContext/fetchViewer.ts` — `fetchViewer`/`resolveViewer` reused server-side.

**Delete:**

- `lib/auth/initAuth.ts`, `app/api/auth/[...nextauth]/route.ts` (next-auth handlers/config).
- `lib/api/clientToken.ts` and `UrqlProvider`'s Bearer/`getClientToken` closure (token→browser path).
- `app/api/viewer/route.ts` client fetch + the `accessToken` it ships; `ViewerContext`'s
  `fetch("/api/viewer")` + `setClientToken`.
- `next-auth`, `@auth/core` deps (step 8). No new deps — `jwt-decode` is NOT needed (viewer identity
  is a GraphQL query; token expiry rides the access cookie's `maxAge`).

**Convert (diverged from plan — I built these as client islands):**

- `SearchLayout`, `EntityOrderingLayout` (browse), `ContributorDetail` → SSR-on-navigation. Their
  `.astro` pages already SSR the initial state; move interaction (page/order/filter changes) from
  client `useQuery` + `router.push` to URL-param navigations that re-render server-side. Drop their
  `AppProviders`→`UrqlProvider` usage.

## Build sequence

Ordered so each step is independently testable. Cookie **options** mirror hcc
(httpOnly/secure/sameSite=lax; **unsigned** — decided 2026-07-14, rely on httpOnly/secure/sameSite),
but cookie **names** are Meru-idiomatic, not hcc's cryptic `_gql-token-*` (decided 2026-07-14):
`meru-access-token` (the access_token), `meru-refresh-token`, `meru-redirect-uri`. (Meru had no
hand-rolled token cookies to inherit — next-auth managed its own; draft mode used Next's
`__prerender_bypass`.) Keycloak URLs come from the `KEYCLOAK_*` env builders in `lib/auth/keycloak.ts`.

### 1. Keycloak OIDC cookie auth (foundation)

- `src/lib/auth/constants.ts` — cookie names (`meru-access-token`/`meru-refresh-token`/
  `meru-redirect-uri`) + `COOKIE_OPTIONS` (httpOnly/secure/sameSite=lax, unsigned); Keycloak
  `AUTH_URL`/`TOKEN_URL`/`LOGOUT_URL` from `KEYCLOAK_*` env (reuse `lib/auth/keycloak.ts` builders).
  Meru stores the **access_token** in `meru-access-token`.
- `src/lib/auth/session.ts` — cookie read/write helpers + `getSession(context)` and
  `redirectToLogin(context)`. **Expiry model (decided 2026-07-14):** the access cookie's `maxAge` =
  `expires_in` minus a small skew buffer, so the browser drops it at (just before) token expiry — no
  `exp` decode needed. `getSession`: access cookie present → session; absent but refresh cookie live →
  refresh (set both cookies) → session; neither → anonymous. `redirectToLogin` sets the `redirectUri`
  cookie and 302s to `AUTH_URL&redirect_uri=${SITE_URL}/api/login`.
- `src/pages/api/login.ts` — `GET`: `authorization_code` grant at `TOKEN_URL` → set access +
  refresh cookies (`maxAge` from `expires_in`/`refresh_expires_in`) → redirect to stored `redirectUri`.
- `src/actions/index.ts` (`logout`, `refresh`) — `defineAction`s: `refresh` re-runs the
  `refresh_token` grant + re-sets both cookies (deletes all on failure); `logout` does the Keycloak
  backchannel `/logout` + deletes cookies. The grant/cookie logic lives in `src/lib/auth/` so
  `getSession` calls it **directly** (server-side) rather than round-tripping through `callAction`;
  the actions are the client-invocable wrappers (e.g. `AccountDropdown` → `logout`).
- **`src/middleware.ts` + `src/lib/middleware/attachUserAndSession.ts` — built MINIMALLY here**
  (decided 2026-07-14): `sequence(attachUserAndSession)` populating
  `locals.{isAuthenticated, session:{accessToken, refreshToken}}` only. #9 later re-homes/expands it
  (route protection, draft mode). Auth can't be built or tested without it, so it bootstraps here.
- `src/env.d.ts` — declare `App.Locals` (`isAuthenticated`, `session`).

### 2. Server token wiring — DONE (2026-07-15)

- `src/lib/query.ts` — accepts an optional `token` third arg; delegates to `lib/api/client`'s
  `makeAuthorizedClient(token)` (Bearer) when present, else the shared `getAnonymousClient()`
  singleton (network-only in prod, cache-first in dev). `.astro` pages pass
  `Astro.locals.session?.accessToken` when preview/authed (else anonymous, unchanged).

### 3. Viewer via server props (delete client-token path) — DONE (2026-07-15)

- `src/lib/auth/viewer.ts` — request-scoped `getViewer(context)` memoized on a `WeakMap<App.Locals>`
  (no new Locals field). Anonymous short-circuits to `{isAuthenticated:false, allowedActions:[]}`
  with NO GraphQL call; authed calls `resolveViewer(locals.session.accessToken)`.
- `viewer` threaded into `ViewerContextProvider` via `ChromeProviders` (`AppProviders` auto-forwards
  it). `BaseLayout` resolves its own `getViewer(Astro)` for the chrome (2 islands); each of the 20
  content pages resolves `getViewer(Astro)` and passes it to its island → `AppProviders`. The memo
  collapses chrome + content to ≤1 viewer query/request.
- `ViewerContextProvider` is now purely prop-seeded (dropped the `/api/viewer` self-fetch +
  `setClientToken`); `app/api/viewer/route.ts` deleted. **No Next backward-compat shim** — Next is
  deleted entirely before this branch merges (decided 2026-07-15), so shared files take the clean
  end-state. `lib/api/clientToken.ts` itself is retained until step 6/8 removes its remaining
  `UrqlProvider`/`AccountDropdown` callers (keeps the Astro build green meanwhile).

### 4. Sign-in / out / preview UI (un-stub) — signIn/signOut DONE (2026-07-15)

- `components/composed/AccountDropdown/actions.ts` — now Astro-native:
  `signIn` → `window.location.assign("/api/signin?returnTo=<current URL>")` (→ `redirectToLogin`);
  `signOut` → `actions.logout()` (Keycloak backchannel + httpOnly cookie clear) then hard-nav to `/`.
  `enterPreviewMode` is still inert — deferred to step 5 (needs the draft cookie + `/preview` flow).
  The dropdown's `isAuthenticated`/`canAccessAdmin` now come from the step-3 server-seeded viewer.

### 5. Preview / draft mode — DONE (2026-07-15)

- `src/lib/request/draftMode.ts` — Astro-native, context-taking (`isDraftModeEnabled`/
  `enableDraftMode`/`disableDraftMode`) over an **unsigned** httpOnly cookie `meru-draft-mode`
  (decided 2026-07-15: not load-bearing — the API's per-entity `canPreview`/`canUpdate`, checked
  with the viewer's token, is what actually gates content). Fresh module (root `lib/request/
draftMode.ts` is Next-only, dies in cleanup). `src/lib/request/previewToken.ts` returns the
  locals token only when draft mode is on, else undefined (queries stay anonymous/cacheable).
- `src/pages/preview/[entity]/[slug].ts` — deep-link endpoint: `!isAuthenticated` →
  `/unauthorized?reason=unauthenticated`; `fetchPreviewAccess` (`src/lib/preview/`, token from
  locals, reuses the registered `fetchPreviewAccessQuery`) → `?reason=forbidden`; else enable draft
  - redirect to `LANDING`. Hardens the Next route, which had no gate.
- Global toggle: `enterPreview`/`exitPreview` Astro actions set/clear the cookie; `AccountDropdown`
  `enterPreviewMode` → `actions.enterPreview()`; `DraftModeBannerIsland` (BaseLayout renders it
  whenever the cookie is set — self-read, so the banner shows on every page) → `actions.exitPreview()`.
- `canPreview` enforcement: **inline** (decided 2026-07-15) — Item/Collection/Community shells read
  `useViewerContext().isPreview` + the layout fragment's `canPreview` and render
  `UnauthorizedMessage` in place when preview + `!canPreview`. `draftModeEnabled` is threaded
  page → island → `AppProviders` (mirrors the viewer prop) across all 17 entity pages so `isPreview`
  reaches the shells; each entity page fetches its primary query with `previewToken(Astro)`.

### 6. Client analytics stay anonymous — NO proxy (revised + DONE 2026-07-15)

- **Decision reversed (2026-07-15):** the `/api/graphql` proxy was only ever justified by token
  injection. But neither remaining client query needs the token: `ViewCounter` must NOT fire in
  preview at all (an editor previewing shouldn't record a view), and `ArticleAnalyticsBlock` always
  shows public counts (even in preview). So there is no client-side auth, and **no proxy is built** —
  the two widgets query `NEXT_PUBLIC_API_URL` directly (anonymous), as they already did.
- `ViewCounter` — `pause: isPreview` (from `useViewerContext`), so it neither records a view nor
  queries in draft mode.
- `ArticleAnalyticsBlock` — unchanged; anonymous public counts.
- `UrqlProvider` — dropped the dead `getClientToken`/Bearer closure; the client is now plainly
  anonymous against `NEXT_PUBLIC_API_URL`. Deleted `lib/api/clientToken.ts` and its last caller
  (`AccountDropdown`'s `setClientToken(undefined)`). Verified: the client bundle contains no cookie
  names, no `getClientToken`, and no `Bearer`/`authorization` header path.

### 7. Convert search / browse / contributor to SSR-on-navigation — DONE (2026-07-16)

- The pivot was one helper: `lib/routing/hooks.ts` `push`/`replace` had a same-pathname special case
  (pushState + custom event, no server render) so islands could re-query client-side. Removed — every
  push is now Astro `navigate()` (view-transition swap, server re-render). The `notifyLocationChange`
  event machinery in `RouteContext` went with it; the persisted-island re-seed now keys on
  pathname **+ search** (query-only navigations re-render chrome islands with a same-pathname route prop).
- `SearchLayout`, `EntityOrderingLayout`, `ContributorDetail`: deleted their `useQuery`/local-state
  refetch machinery entirely — the hosting `.astro` pages already parsed the URL params into the
  server queries (with `previewToken`), so the components now render purely from SSR fragment props.
  Draft/preview data survives pagination and filtering — the anonymous client path never could.
  Deleted documents: `SearchLayoutQuery`, `SearchLayoutEntityQuery`, `EntityOrderingLayoutRefetchQuery`,
  `ContributorDetailRefetchQuery` (codegen regenerated). `Pagination`'s default URL push drives paging.
- `UrqlProvider` moved out of `AppProviders` — `ViewCounter` and `ArticleAnalyticsBlock` (the only
  remaining client GraphQL, both anonymous) now each provide their own client.
- `FullTextCheckRedirect` was a latent 500: it called Next's `redirect()` (throws `NEXT_REDIRECT`)
  mid-render, uncaught under Astro. Replaced with a real 302: `shouldRenderMainLayout(layouts)`
  exported from `FullTextCheck`, evaluated in `items/[slug].astro` → `Astro.redirect(/items/…/metadata)`.
- **`next` dependency removed** (the last Next remnant). Also deleted: `lib/routing/navigation.ts`
  (`notFound` had no importers), `types/auth.d.ts` (dead next-auth augmentation),
  `lib/metadata/toNextMetadata.ts` + `lib/request/headers.ts` (dead, 0 importers), stale `.next/`.
- Verified: tsc green, `astro build` green; client bundle contains the two analytics queries and none
  of the deleted ones; no `next/navigation`/`NEXT_REDIRECT` anywhere in dist; `node_modules/next` gone.

### 8. Cleanup — mostly DONE (2026-07-15); `next` dep deferred to #7

Done in two commits:

- **Remove the Next application** — deleted `app/**` (layouts, loading, preview route, `api/auth`,
  `api/revalidate`), root `middleware.ts`/`next.config.js`/`next-env.d.ts`, `components/global/AppBody`,
  the Next `DraftModeBanner` (`.tsx`/`actions`/`index`; kept `.module.css`), and `lib/actions/*`.
  Repointed `package.json` scripts to `astro dev/build/preview`; fixed `tsconfig` include.
- **Sever `next-auth`** — the shared `GlobalStaticContext` fetchers blocked it (the barrel re-exported
  `getStaticGlobalContextData`, imported by ~23 Astro files; `getStaticGoogleScholarData`/
  `getStaticEntityData` export fragments Astro uses — all statically pulled `queryApi → initAuth →
next-auth`). Decoupled: dropped the barrel's fetcher re-export and stripped the Next-only fetch
  functions (kept the fragment exports byte-identical for codegen). Then deleted the chain
  (`lib/api/queryApi.ts`, `lib/auth/{initAuth,keycloak,types}.ts`, root `lib/request/draftMode.ts`,
  `getStaticCommunityData`, `getStaticGlobalContextData`) and removed deps `next-auth`, `@auth/core`,
  `@next/mdx`, `@next/eslint-plugin-next`, `@trieb.work/nextjs-turbo-redis-cache`. `clientToken.ts`
  was already deleted in step 6. **No `jwt-decode`** (identity is the GraphQL viewer; expiry rides the
  access cookie's maxAge). Verified: client bundle carries no token; tsc + build green.

**Deferred to #7 (since done there, 2026-07-16):** the `next` package itself stayed until
`lib/routing/navigation.ts` was ported — see #7. Env: `AUTH_SECRET` no longer used (no next-auth);
`lib/env/clientConfig.ts` stays the client-env swap point.

## Env vars

Reuse: `NEXT_PUBLIC_KEYCLOAK_URL`, `NEXT_PUBLIC_KEYCLOAK_REALM`, `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`,
`NEXT_KEYCLOAK_CLIENT_SECRET` (server-only), `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FE_URL` (→ `SITE_URL`
for `redirect_uri`). Drop: `AUTH_SECRET` (no next-auth). No cookie-signing secret (hcc relies on
httpOnly/secure/sameSite; add one if we want signed draft/session cookies).

## Verification

- Sign in → `/api/login` sets httpOnly access + refresh cookies; `locals` populates; viewer UI
  (name/avatar, `canAccessAdmin`, `allowedActions`) renders from server-seeded props.
- **No token anywhere in the browser** — grep client bundle, inspect page payloads + all cookies
  (httpOnly only), confirm no `/api/viewer` token.
- Access-token expiry mid-session → transparent refresh; refresh-token expiry → cookies cleared →
  logged out. Sign out → Keycloak backchannel logout + cookies deleted.
- Preview: `/preview/items/<slug>` signed out → `?reason=unauthenticated`; no ACL → `?reason=forbidden`;
  with ACL → draft cookie set, draft content renders; **client analytics refetch in preview returns
  draft data** (proxy injected the token); exit clears it.
- Anonymous: public pages render; `ViewCounter` records + analytics loads via `/api/graphql` with no
  token; caching intact (#8).
- Search / browse / contributor pagination work via URL params + SSR; deep pages present in SSR HTML.

## Settled sub-decisions

- **Where to resolve the viewer — request-scoped memo `getViewer(context)`** (decided 2026-07-14).
  Memoize on `locals` so chrome (`BaseLayout`) and the page's content island each call it and collapse
  to ≤1 `viewer` query/request; anonymous returns `{isAuthenticated:false}` with no GraphQL call.
  Chosen over middleware `locals.viewer` because each island is its own React root (so viewer is
  prop-seeded into both stacks either way, and the memo auto-collapses the double-fetch), and — the
  deciding point — the high-frequency `/api/graphql` proxy path (every `ViewCounter`/analytics call)
  must NOT trigger a viewer fetch, which eager middleware would do on every authed request. The memo
  also overlaps with the page's existing `Promise.all` of queries instead of serializing on TTFB, and
  keeps viewer decoupled from the #9 middleware re-home.
- **Drop `/api/viewer` outright** (decided 2026-07-14). Viewer is fully prop-seeded via `getViewer`,
  so no client refresh path remains — delete `app/api/viewer/route.ts` rather than token-stripping it.
- **Cookies unsigned; Meru-idiomatic names** (decided 2026-07-14). `meru-access-token`/
  `meru-refresh-token`/`meru-redirect-uri`, httpOnly/secure/sameSite=lax, no signing secret — not
  hcc's `_gql-token-*`. Add a signing secret later only if we want tamper-evident draft/session cookies.

## Open sub-decisions (call during build)

- **Revalidate + caching (#8)** proceeds in parallel; the proxy and authed/preview requests must
  bypass the route cache (`Astro.cache` guard).
