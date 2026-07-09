# Middleware re-home (#9): collapse the `/dynamic` catch-all

Design doc for migrating Meru's `middleware.ts` onto the Astro SSR stack. Companion to
`docs/astro-migration-prep.md` (step 9). **Decisions below are settled.** Reference:
`../hcc-client/src/middleware.ts` (a `sequence(...)` of small single-purpose middlewares).

## Decision summary

- **The `/dynamic` catch-all rewrite is deleted entirely.** It exists only to force Next to render
  every route dynamically (runtime env, no build-time generation); Astro SSR renders at request
  time by default, so the reason is gone. This is what made `middleware.ts` a match-everything
  catch-all.
- **Middleware collapses to essentially one entry: `attachUserAndSession`** (the Keycloak session →
  `Astro.locals` from #7, `docs/astro-auth-plan.md`).
- **`/preview/*` gating and `/permalink/*` resolution become routes, not middleware** — matching
  hcc-client's "resolve in routes" pattern.
- **HTTPS redirect is dropped from the app** — enforced at the CDN/load balancer (Cloudflare).
- **i18n stays `react-i18next`** (no `attachTFunction`/server-`t` in `locals`), but it is **not
  client-only**: most `t()` users become server-rendered React, so the shared i18next instance must
  render on the server too. Single-locale makes this a small SSR-safe-init change (drop/guard the
  browser `LanguageDetector`, force `lng: "en-US"`) — see `docs/astro-execution-plan.md` i18n note.
  Per-request/multi-locale (`Astro.currentLocale`) is deferred.

## What Meru's middleware does today → fate

`middleware.ts` currently does four things behind `matcher:
["/((?!api|_next/static|_next/image|favicon.ico|fonts).*)"]`:

| Today | Astro |
| --- | --- |
| `/dynamic` catch-all rewrite (prepends `/dynamic` to every request) | **Deleted** — no build-time generation to defeat. |
| `next/server` + `next/headers` imports + `matcher` config | Gone — Astro middleware is `onRequest(context, next)`; branch on `context.url.pathname`, no matcher. |
| HTTPS redirect (prod, `x-forwarded-proto !== https`) | **Dropped** — handled at the CDN/LB. |
| `/preview/*` gating (`auth()` + `fetchPreviewAccess` ACL) | **Folds into the `/preview/[entity]/[slug]` route.** |
| `/permalink/*` rewrite (`fetchPermalink` → entity path) | **Becomes the `/permalink/[permalink]` route.** |

hcc-client middlewares Meru intentionally omits: `matchAllowlist` (Meru's routes are explicit,
known shapes — Astro file routing 404s unknown paths natively, unlike Craft's arbitrary CMS URIs),
`maybeStripLocalePrefix` (no locale-prefixed routing), `attachTFunction` (i18n stays client-side).

## Target middleware

`src/middleware.ts`:

```ts
import { sequence } from "astro:middleware";
import { attachUserAndSession } from "./lib/middleware";

export const onRequest = sequence(attachUserAndSession);
```

`attachUserAndSession` is defined in the #7 auth work (reads the session cookie, lazy-refreshes,
populates `locals.{isAuthenticated, session, user}`). It runs on all requests so `locals` is
always populated; it's cheap when there's no session cookie. If more chain steps appear later
(server i18n, route protection), they slot into the `sequence(...)`.

## `/preview/[entity]/[slug]` route (gate + enable draft + redirect)

Replaces both the middleware `/preview/*` gate **and** the current `app/[frontend]/preview/
[entity]/[slug]/route.ts` (which only enabled draft + redirected). One Astro endpoint does it all:

```ts
const LANDING: Record<string, (slug: string) => string> = {
  items: (slug) => `/items/${slug}/metadata`,
  collections: (slug) => `/collections/${slug}`,
  communities: (slug) => `/communities/${slug}`,
};

export async function GET(context) {
  const { entity, slug } = context.params;
  const landing = LANDING[entity];
  if (!landing) return new Response(null, { status: 404 });

  // 1. must be signed in
  if (!context.locals.isAuthenticated)
    return context.rewrite("/unauthorized?reason=unauthenticated");

  // 2. must have preview access (GraphQL canUpdate, authed via locals token)
  const canUpdate = await fetchPreviewAccess(entity, slug, context);
  if (!canUpdate)
    return context.rewrite("/unauthorized?reason=forbidden");

  // 3. enable preview/draft (the draft cookie from #7) and land on the entity
  enableDraftMode(context);
  return context.redirect(landing(slug), 302);
}
```

Notes:
- Preserves the current `LANDING` map and the unauthenticated/forbidden reasons that the existing
  `unauthorized` page reads.
- `enableDraftMode` is the Astro draft cookie set (the #7 replacement for `next/headers` draftMode);
  downstream server fetches read the token from `locals` and switch to the authorized client, so
  draft content renders.

## `/permalink/[permalink]` route (resolve + rewrite)

Replaces the middleware `/permalink/*` branch:

```ts
export async function GET(context) {
  const { permalink } = context.params;
  const { kind, permalinkableSlug } = await fetchPermalink(permalink, context);
  const route = getRouteByEntityKind(kind);            // helpers/routes.ts, unchanged
  if (!route || !permalinkableSlug)
    return new Response(null, { status: 404 });
  return context.rewrite(`/${route}/${permalinkableSlug}${context.url.search}`);
}
```

`getRouteByEntityKind` (`helpers/routes.ts`) carries over unchanged (COMMUNITY→communities, etc.).
The `/dynamic` prefix in the current rewrite target disappears.

## `fetchPermalink` / `fetchPreviewAccess`

Both are currently `"use server"` + `queryApi` + React `cache()`. Port to plain async helpers (or
Astro actions) that take the Astro context and use the server urql client with the token from
`locals`:
- `fetchPreviewAccess` keeps `authAware` semantics — it needs the token to evaluate `canUpdate`.
- React `cache()` (per-request memoization) → a request-scoped memo, or simply call once per
  request (each is called at most once in these routes anyway).
- Their GraphQL documents (`fetchPermalinkQuery`, `fetchPreviewAccessQuery`) are unchanged.

## What gets deleted

- `middleware.ts`'s `/dynamic` rewrite, HTTPS redirect, `matcher`, and `next/server` + `next/headers`
  imports (the file becomes the `sequence(attachUserAndSession)` above).
- `app/[frontend]/preview/[entity]/[slug]/route.ts` (folded into the Astro `/preview` route).
- The `/dynamic` and `/[frontend]` path prefixes everywhere they appear (also removes the last
  reason for the `[frontend]` route segment).

## Verification

- Unknown path → Astro's file router returns 404 (no `matchAllowlist` needed).
- `http://` request in prod → CDN/LB upgrades to `https` (no app involvement).
- `/preview/items/<slug>` while signed out → `/unauthorized?reason=unauthenticated`; signed in
  without ACL → `?reason=forbidden`; with ACL → draft cookie set, redirect to
  `/items/<slug>/metadata`, draft content renders.
- `/preview/<bad-entity>/<slug>` → 404.
- `/permalink/<permalink>` → rewrites to the resolved entity path (query string preserved);
  unresolvable → 404.
- No route is prefixed with `/dynamic`; `locals.session/user/isAuthenticated` populated on every
  request.
