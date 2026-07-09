# On-demand revalidation & caching (#8): Astro `cache` API

Design doc for migrating Meru's caching + revalidation off Next ISR/Redis onto the Astro SSR
stack. Companion to `docs/astro-migration-prep.md` (step 8). **Decisions below are settled.**
Reference implementation: `../hcc-client` (Astro 7 `cache` API + a signed revalidate webhook).

## Decision summary

- **Adopt Astro 7's built-in response `cache` API** (the `Astro.cache` / `context.cache` surface),
  configured with the **`memoryCache` provider** — hcc-client's exact, proven setup. No custom
  provider, and tag-based invalidation is supported out of the box (hcc uses it).
- **Per-route opt-in caching:** each cacheable page calls `Astro.cache.set({ maxAge, swr, tags })`,
  replacing Next's `export const revalidate = 3600`. Tags drive invalidation.
- **One signed `/api/revalidate` endpoint** replaces both `/api/revalidate/entity` and
  `/api/revalidate/instance`, using `context.cache.invalidate({ path, tags })`.
- **Keep the current posture:** server-side response cache only; `no-store` at the CDN/browser;
  preview/authed requests bypass the cache (they don't `cache.set`). Not moving caching to the CDN.
- **GraphQL client policy mirrors today's dev trick:** `network-only` when the route cache is
  enabled (the route cache does the work), `cache-first` otherwise.

## Accepted constraint of `memoryCache` (important)

`memoryCache` is **per-instance and in-memory** — it is **lost on restart/redeploy**, and an
invalidation webhook only purges the instance it hits. We are accepting this, which assumes:

- **Each tenant runs a single, long-lived instance.** If a tenant is ever scaled horizontally
  (multiple replicas), a webhook would purge only one replica's cache; the others would serve stale
  content until their `maxAge`/`swr` window lapses. Revisit the provider choice (a Redis-backed
  provider) if/when horizontal scaling is introduced.
- **A redeploy cold-starts an empty cache.** First requests after a deploy repopulate it. This is a
  change from today (shared Redis survives restarts) and is considered acceptable.

This trades the shared/persistent Redis cache (`@trieb.work/nextjs-turbo-redis-cache`) for
simplicity — no custom provider, no Redis dependency for caching. The Redis cache handler and its
`REDIS_URL`/`REDIS_DB`/`REDIS_CACHE` wiring are removed with Next.

## Meru today → Astro target

| Current (Next) | Astro target |
| --- | --- |
| Next route/data cache in Redis (`customized-cache-handler.cjs`, `@trieb.work/nextjs-turbo-redis-cache`, `defaultStaleAge 3600`) | `cache: { provider: memoryCache(...) }` in `astro.config.ts` |
| `export const revalidate = 3600` on root layouts | per-route `Astro.cache.set({ maxAge, swr, tags })` |
| `/api/revalidate/entity` — maps entity → routes+subroutes via `baseRoutes`, `revalidatePath` across `/dynamic`, `/dynamic/(pages)`, `/[frontend]/(pages)` variants | `/api/revalidate` — `cache.invalidate({ path, tags })`; **the path-variant hack disappears** (no middleware rewrite in Astro) |
| `/api/revalidate/instance` — `revalidatePath("/", "layout")` (purge all) | same endpoint, `cache.invalidate({ tags: ["global"] })` |
| `no-store` CDN/browser headers | unchanged (keep server-side-only caching) |
| draft/preview bypass (dynamic) | don't `cache.set` when authed/preview (`Astro.cache.enabled` guard) |
| urql `requestPolicyExchange` dev cache-first optimization | `Astro.cache.enabled ? networkOnly : cacheFirst` (already in `lib/api/makeUrqlClient.ts`) |

## Tagging scheme

Every cacheable page carries:

- a **`global`** tag — invalidated when installation-wide data changes (theme/`globalConfiguration`,
  nav/`AppBody`, site metadata — the data fetched in the root layouts that affects every page).
  This is the target of the old `/api/revalidate/instance` "purge all".
- one or more **entity tags** — `item:<slug>`, `collection:<slug>`, `community:<slug>` — for the
  entity the page renders (and, for entity subpages like metadata/files/contributors, the parent
  entity's tag so one entity change purges all its subpages at once).

`DEFAULT_CACHE_CONFIG` (mirroring hcc-client's `lib/caching/constants.ts`):

```ts
export const REVALIDATE = import.meta.env.REVALIDATE
  ? parseInt(import.meta.env.REVALIDATE)
  : 3600; // keep Meru's current 1h stale age; env-overridable
export const DEFAULT_CACHE_CONFIG: CacheOptions = { maxAge: REVALIDATE, swr: 60 };
```

## The `/api/revalidate` endpoint

Signature-gated on `REVALIDATE_SECRET` (unchanged env). Payload keeps the current
`{ slug, type }` shape (plus an optional flag for the instance-wide case):

```ts
export async function POST(context: APIContext) {
  if (!context.cache.enabled) return json({ message: "Astro cache not enabled." }, 500);
  if (!REVALIDATE_SECRET)   return json({ message: "Missing REVALIDATE_SECRET." }, 500);
  // verify Bearer/secret (same check as today) ...

  const { slug, type, scope } = await context.request.json();

  // instance-wide change → purge everything tagged global
  if (scope === "instance") {
    await context.cache.invalidate({ tags: ["global"] });
    return Response.json({ revalidated: true });
  }

  // entity change → invalidate the entity path + its tag (covers subpages)
  const path = entityPathFor(type, slug);          // /items/<slug>, /collections/<slug>, ...
  const tags = [`${type}:${slug}`];
  await context.cache.invalidate({ path, tags });
  return Response.json({ revalidated: true, path, tags });
}
```

Notes:
- `entityPathFor` replaces the `baseRoutes` route+subroute enumeration; because subpages share the
  parent's `${type}:${slug}` tag, one `invalidate` call clears the entity landing page and all its
  subpages. Search/browse routes were already excluded from entity revalidation today and stay
  uncached (or short-`maxAge`) here.
- The backend webhook keeps calling the same URL with the same secret; only the internal mechanism
  changes. The old two-endpoint split collapses to one endpoint with a `scope` discriminator (or
  keep two paths if the backend integration is easier left unchanged — cheap either way).

## GraphQL client policy

Mirror `queryCraft`: in the server data path, choose `networkOnly` when `Astro.cache.enabled`
(route cache handles reuse) and `cacheFirst` otherwise (dev). Meru's `makeUrqlClient` already
implements the `requestPolicyExchange` cache-first TTL, so this is a wiring change, not new code.
Preview/authed fetches stay `network-only` and uncached.

## What gets deleted with Next

- `customized-cache-handler.cjs`, the `cacheHandler`/`cacheMaxMemorySize` config in
  `next.config.js`, and the `@trieb.work/nextjs-turbo-redis-cache` + `redis` deps.
- `REDIS_URL` / `REDIS_DB` / `REDIS_CACHE` env wiring (unless Redis is used elsewhere — it is not
  today).
- `app/api/revalidate/entity` + `app/api/revalidate/instance` → one Astro `/api/revalidate`.
- `export const revalidate = 3600` (replaced by per-route `cache.set`).

## Verification

- Cacheable public page: first request MISS → renders; second within `maxAge` → HIT (served from
  cache, no GraphQL fetch); after `maxAge`, `swr` serves stale while revalidating.
- Entity webhook: `POST /api/revalidate {type:"item", slug}` with valid secret → that item's page
  and its subpages re-render on next request; unrelated pages stay cached. Bad/missing secret → 401.
- Instance webhook: `POST /api/revalidate {scope:"instance"}` → all `global`-tagged pages purge
  (theme/nav change reflected everywhere).
- Preview/authed request is never cached (no `Astro.cache.set`); anonymous public views are.
- `no-store` still present at the edge/browser; caching remains entirely server-side.
- Redeploy → cold cache repopulates on first hits (accepted). Single instance per tenant confirmed.
