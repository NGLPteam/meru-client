import type { CacheOptions } from "astro";

// Server-side response caching (Astro 7 `cache` API + memoryCache provider).
// Mirrors hcc-client's lib/caching/constants.ts. See docs/astro-caching-plan.md.

// Stale age in seconds. Keeps Meru's historical 1h Next `revalidate = 3600`,
// overridable via the REVALIDATE env var. Read from import.meta.env so it's
// inlined at build time (this is a build-time constant, not a per-request read).
export const REVALIDATE = import.meta.env.REVALIDATE
  ? parseInt(import.meta.env.REVALIDATE, 10)
  : 3600;

// Default per-route cache config: serve fresh for `maxAge`, then serve stale for
// up to `swr` more seconds while revalidating in the background.
export const DEFAULT_CACHE_CONFIG: CacheOptions = {
  maxAge: REVALIDATE,
  swr: 60,
};

// Every cacheable page carries this tag; the /api/revalidate/instance webhook
// invalidates it to purge installation-wide (theme / nav / site metadata) changes.
export const GLOBAL_TAG = "global";

// The four entity `type` values the revalidate webhook sends (unchanged from the
// Next `baseRoutes` names). Note the irregular plural: community → communities.
export type EntityType = "item" | "collection" | "community" | "contributor";

const ENTITY_BASE: Record<EntityType, string> = {
  item: "/items",
  collection: "/collections",
  community: "/communities",
  contributor: "/contributors",
};

export function isEntityType(value: unknown): value is EntityType {
  return typeof value === "string" && value in ENTITY_BASE;
}

// The public landing path for an entity, e.g. ("item", "abc") → "/items/abc".
export function entityPathFor(type: EntityType, slug: string): string {
  return `${ENTITY_BASE[type]}/${slug}`;
}

// The invalidation tag for an entity, e.g. ("item", "abc") → "item:abc".
// Entity subpages (metadata/files/contributors/…) carry their PARENT's tag, so
// one invalidate call clears the landing page and every subpage at once.
export function entityTag(type: EntityType, slug: string): string {
  return `${type}:${slug}`;
}
