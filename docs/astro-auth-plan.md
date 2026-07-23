# Auth re-platforming (#7): Keycloak OIDC on Astro SSR

Design doc for migrating Meru's authentication off `next-auth` v5 onto the Astro SSR stack.
Companion to `docs/astro-migration-prep.md` (step 7). **Decisions below are settled.**

## Decision summary

- **Drop `next-auth` / `@auth/core` entirely.** Port the hand-rolled Keycloak OIDC pattern from
  the Astro reference app `../hcc-client` (which uses the _same_ Keycloak backend, no Auth.js —
  only `jwt-decode`).
- **The access token never reaches the browser.** It lives only in an httpOnly cookie and, per
  request, in `Astro.locals`. This replaces today's model, where `/api/viewer` ships the raw
  `accessToken` to client JS for the `UrqlProvider` Bearer.
- **Client-query split (the combo):**
  - **Server-side (SSR on navigation):** search, entity ordering, contributor pagination — all
    already URL-param driven.
  - **Client-side (kept):** analytics (`ArticleAnalyticsBlock`) and `ViewCounter` — they must run
    in the browser because a server fetch would either mis-count views/downloads (`ViewCounter`,
    and analytics is explicitly client-only for the same reason) or lose interactive refetch
    (analytics date-range/precision/region controls).
- **The two client queries talk to a same-origin `/api/graphql` proxy** (Astro endpoint) that
  injects the Bearer from the httpOnly session cookie server-side when present, and passes through
  anonymously otherwise. This (a) keeps the token out of the browser, (b) makes preview-mode
  analytics work, and (c) removes the client's need for the runtime API URL and the cross-origin
  CORS surface. The entire client-token path is deleted.

## Why this shape (verified facts)

- **Both kept-client queries are anonymous in normal browsing.** `ViewCounter` is a public
  view-recording query, rendered ungated in the item/collection layouts. The analytics metrics
  page (`app/[frontend]/(pages)/items/[slug]/metrics/page.tsx`) is not auth-gated and its server
  prefetch calls `queryApi` with no `authAware` flag. So neither needs a token for public content —
  the token can leave the browser.
- **The one exception is preview mode.** `queryApi` attaches a token whenever draft mode is on
  (`needsToken = isPreview || authAware`), so a _draft_ item's metrics get an authed prefetch. An
  editor changing the analytics date range in preview triggers a client refetch that needs the
  token — which the browser won't have. The `/api/graphql` proxy resolves this by injecting the
  cookie token server-side.

## Reference: hcc-client's Astro Keycloak model

Six pieces (`../hcc-client`):

1. **Login** — a `.astro` button (`src/components/auth/Login/Login.astro`) builds the Keycloak
   `/auth?response_type=code&scope=openid&redirect_uri=$SITE/api/login` URL and sets a short-lived
   `redirectUri` cookie. Plain link, no JS/SDK.
2. **Callback** — `src/pages/api/login/index.ts` receives `?code`, runs the `authorization_code`
   grant server-side (client secret), and sets two httpOnly/secure/sameSite cookies: `jwt`
   (the `id_token`) and `refreshToken`. Redirects to the stored `redirectUri`.
3. **Session attach** — middleware `src/lib/middleware/attachUserAndSession.ts` reads the jwt cookie
   (auto-refreshing via the refresh action when expired), `jwtDecode`s user claims, and populates
   `Astro.locals.{isAuthenticated, session:{jwt, refreshToken}, user}`.
4. **Refresh / logout** — Astro actions (`src/actions/refresh`, `src/actions/logout`): the
   `refresh_token` grant re-sets both cookies; logout does Keycloak back-channel logout and deletes
   the cookies. Any failure clears all auth cookies.
5. **Protected routes** — middleware `authorizeIfProtectedRoute.ts` globs the path and
   `redirectToLogin` if unauthenticated.
6. **Token → GraphQL** — `src/lib/api/craft/queryCraft.ts` reads `Astro.locals.session.jwt`
   server-side and builds `makeAuthorizedClient(jwt)`. The browser never sees the token.

## Current Meru auth → reuse vs. drop

| Current (Next)                                                                                           | Fate                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/auth/keycloak.ts` — issuer/token/logout URLs, `refreshAccessToken`, refresh-body builder            | **Reuse** (near line-for-line what hcc-client's refresh/logout actions do; adapt to set cookies instead of returning a JWT)                              |
| `lib/auth/initAuth.ts` — `NextAuth(config)`, `jwt`/`session`/`redirect` callbacks, encrypted-JWT session | **Delete** — replaced by cookie set/read + `attachUserAndSession` middleware                                                                             |
| `app/api/auth/[...nextauth]/route.ts` — next-auth handlers                                               | **Delete** — replaced by `/api/login` callback route                                                                                                     |
| `auth()` server session reads (`queryApi`, `app/api/viewer/route.ts`, `AccountDropdown/actions.ts`)      | **Repoint** to `Astro.locals.session` (queryApi already has the `token` option seam from prep step 5)                                                    |
| `app/api/viewer/route.ts` — returns viewer data **plus** raw `accessToken`                               | **Change** — resolve the viewer from `locals` (server); return viewer data **without** the token (or drop the endpoint and pass viewer via props/locals) |
| `contexts/ViewerContext` + `lib/api/clientToken.ts` + `UrqlProvider` Bearer                              | **Delete the client-token path** — `UrqlProvider` points at `/api/graphql`; viewer state comes from server-provided data                                 |
| `AccountDropdown/actions.ts` `signIn`/`signOut` (server actions)                                         | **Reimplement** as Astro: sign-in = redirect to Keycloak `/auth`; sign-out = logout action (Keycloak back-channel + cookie delete)                       |
| `next-auth`, `@auth/core` deps                                                                           | **Remove** (add `jwt-decode`)                                                                                                                            |

## Client-query migration

- **Server-side (drop client urql):** `SearchLayout`, `EntityOrderingLayout`, `ContributorDetail`
  — currently `useQuery` with variables in `useState` + `router.push`. Convert to: the `.astro`
  page reads the params (query/filters/page/order) from the URL, fetches server-side via the urql
  server client (token from `locals` when preview/authed), and renders. Param changes become full
  navigations; smooth with Astro **View Transitions** to retain the app-like feel.
- **Client-side (keep):** `ArticleAnalyticsBlock`, `ViewCounter` — keep the client urql
  `Provider`/`useQuery`, but point the client at the relative `/api/graphql` proxy. No token in the
  client; the proxy injects it from the cookie when the session is present (covers preview).

## Concrete build steps

New/ported modules (mirroring hcc-client):

1. `lib/auth/constants.ts` — cookie names (`jwt`, `refreshToken`, `redirectUri`), cookie options
   (httpOnly/secure/sameSite=lax), Keycloak OIDC URLs (reuse the issuer/token/logout builders
   already in `lib/auth/keycloak.ts`).
2. `lib/auth/functions.ts` — `getJWT(Astro)` (read jwt cookie; lazy-refresh via the refresh action
   when only the refresh cookie is fresh) and `redirectToLogin(Astro)`.
3. `pages/api/login.ts` — `authorization_code` grant → set `jwt` + `refreshToken` cookies →
   redirect to stored `redirectUri`.
4. `actions/refresh` + `actions/logout` — port from hcc-client, reusing `keycloak.ts` grant bodies.
5. `middleware` — `attachUserAndSession` (populate `locals.session/user/isAuthenticated`) and, if
   we adopt route protection, `authorizeIfProtectedRoute`. (Folds into the middleware re-home, #9.)
6. `pages/api/graphql.ts` — same-origin proxy: read the session cookie, inject
   `Authorization: Bearer <jwt>` when present, forward the GraphQL request to `API_URL`, stream the
   response back. Anonymous pass-through otherwise.
7. Server data path — `queryApi` reads the token from `locals` (via the existing `token` option);
   `makeAuthorizedClient` unchanged.

Deletions: `lib/auth/initAuth.ts`, `app/api/auth/[...nextauth]/`, `lib/api/clientToken.ts`, the
client-token branch of `ViewerContext`, `UrqlProvider`'s Bearer/`getClientToken` wiring, and the
`accessToken` field from the viewer response. Remove `next-auth` + `@auth/core`.

## Verification

- Sign in via Keycloak → `/api/login` sets httpOnly `jwt` + `refreshToken`; `locals` populates;
  viewer UI (name/avatar, `canAccessAdmin`, `allowedActions`) renders.
- **No access token anywhere in browser** — not in JS, not in a non-httpOnly cookie, not in a
  network response body. (Grep the client bundle + inspect `/api/viewer` / page payloads.)
- Access-token expiry mid-session → transparent refresh via the refresh action; refresh-token
  expiry → cookies cleared, treated as logged out.
- Sign out → Keycloak back-channel logout + all auth cookies deleted.
- Draft/preview: enter preview → draft content renders server-side; **client analytics refetch in
  preview returns draft data** (proxy injected the cookie token); exit preview clears it.
- Anonymous browsing: public pages render; `ViewCounter` records a view and analytics loads via
  `/api/graphql` with no token; caching for anonymous views intact.
- Search / ordering / contributor pagination work via URL params + SSR (View Transitions smooth
  the navigations).
