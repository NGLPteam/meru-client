import {
  DEFAULT_CACHE_CONFIG,
  GLOBAL_TAG,
  entityTag,
  type EntityType,
} from "./constants";
import type { CacheOptions } from "astro";

type CacheHolder = {
  cache: { enabled: boolean; set(input: CacheOptions | false): void };
};

// Cache a page that only depends on installation-wide data
export function cacheGlobal(
  astro: CacheHolder,
  extraTags: string[] = [],
): void {
  if (!astro.cache.enabled) return;
  astro.cache.set({
    ...DEFAULT_CACHE_CONFIG,
    tags: [GLOBAL_TAG, ...extraTags],
  });
}

// Cache an entity page (landing or subpage). Subpages pass the SAME (parent)
// type+slug as the landing page, so one entity invalidation clears the whole
// family. Every entity page also carries GLOBAL_TAG for instance-wide purges.
export function cacheEntity(
  astro: CacheHolder,
  type: EntityType,
  slug: string,
): void {
  cacheGlobal(astro, [entityTag(type, slug)]);
}
