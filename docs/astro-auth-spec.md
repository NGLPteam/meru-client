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
  smooth it). **Only `ArticleAnalyticsBlock` + `ViewCounter` stay client-side**, talking to a
  same-origin `/api/graphql` proxy that injects the cookie token server-side.

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

**Reuse:**
- `lib/auth/keycloak.ts` — issuer/token URL builders, `refreshTokenBodyFor`, `refreshAccessToken`
  (returns a fresh access_token). Strip the `next-auth`/`@auth/core` imports (`makeKeycloakProvider`,
  `JWT` type) — keep the URL + refresh-body logic.
- `lib/api/queryApi.ts` — already has the `options.token` seam (feed from `Astro.locals`).
- `lib/api/client.ts` `makeAuthorizedClient` (Bearer) — unchanged.
- `contexts/ViewerContext/fetchViewer.ts` — `fetchViewer`/`resolveViewer` reused server-side.

**Delete:**
- `lib/auth/initAuth.ts`, `app/api/auth/[...nextauth]/route.ts` (next-auth handlers/config).
- `lib/api/clientToken.ts` and `UrqlProvider`'s Bearer/`getClientToken` closure (token→browser path).
- `app/api/viewer/route.ts` client fetch + the `accessToken` it ships; `ViewerContext`'s
  `fetch("/api/viewer")` + `setClientToken`.
- `next-auth`, `@auth/core` deps. Add `jwt-decode`.

**Convert (diverged from plan — I built these as client islands):**
- `SearchLayout`, `EntityOrderingLayout` (browse), `ContributorDetail` → SSR-on-navigation. Their
  `.astro` pages already SSR the initial state; move interaction (page/order/filter changes) from
  client `useQuery` + `router.push` to URL-param navigations that re-render server-side. Drop their
  `AppProviders`→`UrqlProvider` usage.

## Build sequence

Ordered so each step is independently testable. Cookie names/options and Keycloak URLs mirror hcc
(`_gql-token-1`/`_gql-token-2`/`_gql-redirectUri`; httpOnly/secure/sameSite=lax; no signing secret).

### 1. Keycloak OIDC cookie auth (foundation)
- `src/lib/auth/constants.ts` — cookie names + `COOKIE_OPTIONS`; Keycloak `AUTH_URL`/`TOKEN_URL`/
  `LOGOUT_URL` from `KEYCLOAK_*` env (reuse `lib/auth/keycloak.ts` builders). Meru stores
  **access_token** in the jwt cookie.
- `src/lib/auth/functions.ts` — `getSession(context)` (read access cookie; if expired but refresh
  cookie live, `callAction(refresh)`), `redirectToLogin(context)` (set `redirectUri` cookie, 302 to
  `AUTH_URL&redirect_uri=${SITE_URL}/api/login`).
- `src/pages/api/login.ts` — `GET`: `authorization_code` grant at `TOKEN_URL` → set access +
  refresh cookies (expiries from `expires_in`/`refresh_expires_in`) → redirect to stored
  `redirectUri`.
- `src/actions/{refresh,logout}.ts` — `refresh_token` grant re-sets both cookies (deletes all on
  failure); logout does Keycloak backchannel `/logout` + deletes cookies.
- `src/middleware.ts` + `src/lib/middleware/attachUserAndSession.ts` — `sequence(attachUserAndSession)`;
  populate `locals.{isAuthenticated, session:{accessToken, refreshToken}}`. (Folds into #9.)

### 2. Server token wiring
- `src/lib/query.ts` — accept an optional token; `.astro` pages pass
  `Astro.locals.session?.accessToken` when preview/authed (else anonymous, unchanged). Or route the
  Astro server path through `queryApi`'s `token` seam. `makeAuthorizedClient` (Bearer) already fits.

### 3. Viewer via server props (delete client-token path)
- Add a request-scoped `getViewer(context)` (memoized) that calls `resolveViewer(session.accessToken)`
  — resolves once per request, anonymous returns `{isAuthenticated:false}` with no GraphQL call.
- Thread `viewer` into `ViewerContextProvider` through `BaseLayout` (chrome) and each page's
  `AppProviders` (content) — same plumbing as `theme`/`community`/`route`. Page resolves once,
  passes to both `<BaseLayout viewer>` and its island, to avoid a double fetch.
- Delete `clientToken.ts`, `ViewerContext`'s `/api/viewer` fetch + `setClientToken`, and
  `app/api/viewer/route.ts` (or repoint it to return viewer *without* the token if still needed).

### 4. Sign-in / out / preview UI (un-stub)
- `components/composed/AccountDropdown/actions.ts` — replace stubs: `signIn` → redirect to Keycloak
  `AUTH_URL` (via `redirectToLogin`); `signOut` → `callAction(logout)` (backchannel + cookie delete)
  + exit preview; `enterPreviewMode` → the `/preview` flow / enable-draft cookie.

### 5. Preview / draft mode (folds into #9)
- `lib/request/draftMode.ts` → Astro signed cookie via `Astro.cookies` (`enableDraftMode`/
  `disableDraftMode`/`isDraftModeEnabled`).
- `src/pages/preview/[entity]/[slug].ts` — one endpoint: gate on `locals.isAuthenticated`
  (→ `/unauthorized?reason=unauthenticated`), `fetchPreviewAccess` (→ `?reason=forbidden`), else
  enable draft cookie + redirect to the entity landing (`LANDING` map). Replaces the Next route +
  middleware gate.
- Enforce the deferred `canPreview` checks in the community/collection/item routes (the fragments
  already select `canPreview`); render `UnauthorizedMessage` when draft + `!canPreview`.

### 6. `/api/graphql` proxy + point the two kept client queries at it
- `src/pages/api/graphql.ts` — `POST`: read session cookie via `locals`, inject
  `Authorization: Bearer <accessToken>` when present (anonymous pass-through otherwise), forward the
  GraphQL body to `NEXT_PUBLIC_API_URL`, stream the response back.
- Point `ArticleAnalyticsBlock` + `ViewCounter`'s client urql at the relative `/api/graphql` (no
  token, no runtime API URL, no cross-origin CORS). Keeps preview analytics working (proxy injects
  the token). This is the *only* remaining client urql after step 7.

### 7. Convert search / browse / contributor to SSR-on-navigation
- `SearchLayout`, `EntityOrderingLayout`, `ContributorDetail`: interactions (query/filter/page/order)
  → `navigate()` with updated URL params; the `.astro` re-fetches server-side (token from locals when
  preview/authed) and View Transitions swap content. Remove their client `useQuery`/`UrqlProvider`.
- Result: deep/paginated states land in SSR HTML (crawlable, cacheable — consistent with the sitemap).

### 8. Cleanup
- Remove `next-auth`, `@auth/core`; add `jwt-decode`. Delete `initAuth.ts`, `/api/auth/*`,
  `clientToken.ts`. Retire the `NEXT_PUBLIC_`/`AUTH_SECRET` env names in favor of the new set (see
  below); `lib/env/clientConfig.ts` stays the single client-env swap point.

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

## Open sub-decisions (call during build)

- **Where to resolve the viewer** — request-scoped memo (recommended, fetches ≤1×/request) vs. in
  middleware `locals.viewer` (simpler reads, but a GraphQL call on every authed request incl. assets).
- **Keep or drop `/api/viewer`** — dropped if viewer is fully prop-seeded; keep (token-stripped) only
  if something still needs a client refresh of viewer state.
- **Revalidate + caching (#8)** proceeds in parallel; the proxy and authed/preview requests must
  bypass the route cache (`Astro.cache` guard).
