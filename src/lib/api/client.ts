import makeUrqlClient from "./makeUrqlClient";
import type { RequestPolicy } from "@urql/core";

export function getAPIURL(): string {
  // Shared by the browser bundle (import.meta.env, gated by envPrefix) and the
  // server (import.meta.env carries all vars; process.env wins at runtime).
  // NEXT_PUBLIC_API_URL is the legacy deploy name — drop the fallbacks once the
  // deploy config is renamed.
  const viteEnv = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env;
  const url =
    viteEnv?.PUBLIC_API_URL ??
    viteEnv?.NEXT_PUBLIC_API_URL ??
    process.env.PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;
  if (url) return url;

  throw new Error("Missing PUBLIC_API_URL (import.meta.env / process.env).");
}

// Anonymous singleton used for the vast majority of (public) server fetches,
// built lazily. Constructing it at module load would (a) do network-client
// setup just from importing this file and (b) throw if the API URL isn't
// resolvable yet — which breaks any bundle that only reaches this module
// transitively (e.g. an Astro SSR / island graph).
// In production, the Astro response cache (astro.config `cache` + per-route
// Astro.cache.set — see lib/caching/) handles reuse, so stay network-only
// (avoids stale/unbounded caching in the long-lived server process). NODE_ENV
// === production tracks Astro.cache.enabled exactly: the provider is active only
// in prod SSR (dev gets a NoopAstroCache). In dev there's no route cache, so use
// cache-first with a TTL to dedupe repeated public/global queries (theme, global
// config, etc.) across renders/navigations. Authed & preview fetches always stay
// network-only.
let cachedAnonymousClient: ReturnType<typeof makeUrqlClient> | undefined;

export function getAnonymousClient() {
  if (!cachedAnonymousClient) {
    cachedAnonymousClient = makeUrqlClient(
      getAPIURL(),
      process.env.NODE_ENV === "production" ? "network-only" : "cache-first",
    );
  }
  return cachedAnonymousClient;
}

// Token-scoped client, built on demand for draft-mode / authenticated fetches.
export function makeAuthorizedClient(
  token: string,
  requestPolicy: RequestPolicy = "network-only",
) {
  return makeUrqlClient(getAPIURL(), requestPolicy, {
    headers: { authorization: `Bearer ${token}` },
  });
}
