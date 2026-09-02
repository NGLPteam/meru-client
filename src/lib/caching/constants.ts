import type { CacheOptions } from "astro";

const REVALIDATE = import.meta.env.REVALIDATE
  ? parseInt(import.meta.env.REVALIDATE, 10)
  : 3600;

export const DEFAULT_CACHE_CONFIG: CacheOptions = {
  maxAge: REVALIDATE,
  swr: 60,
};

// Every cacheable page carries this tag; the /api/revalidate/instance webhook
// invalidates it to purge installation-wide (theme / nav / site metadata) changes.
export const GLOBAL_TAG = "global";

// The four entity `type` values the revalidate webhook sends (unchanged from the
// Next `baseRoutes` names).
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

export function entityPathFor(type: EntityType, slug: string): string {
  return `${ENTITY_BASE[type]}/${slug}`;
}

// Entity subpages (metadata/files/contributors/…) carry their PARENT's tag, so
// one invalidate call clears the landing page and every subpage at once.
export function entityTag(type: EntityType, slug: string): string {
  return `${type}:${slug}`;
}
