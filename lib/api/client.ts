import makeUrqlClient from "./makeUrqlClient";
import type { RequestPolicy } from "@urql/core";

export function getAPIURL(): string {
  // Astro/Vite exposes env on import.meta.env (all vars, server-side); Next on
  // process.env. Support both so this shared client works under either build.
  const viteEnv = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env;
  const url = viteEnv?.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (url) return url;

  throw new Error(
    "Missing NEXT_PUBLIC_API_URL (import.meta.env / process.env).",
  );
}

// Anonymous singleton used for the vast majority of (public) server fetches,
// built lazily. Constructing it at module load would (a) do network-client
// setup just from importing this file and (b) throw if the API URL isn't
// resolvable yet — which breaks any bundle that only reaches this module
// transitively (e.g. an Astro SSR / island graph).
// In production, route-level caching (revalidate) handles reuse, so stay
// network-only (avoids stale/unbounded caching in the long-lived server
// process). In dev there's no route cache, so use cache-first with a TTL to
// dedupe repeated public/global queries (theme, global config, etc.) across
// renders/navigations. Authed & preview fetches always stay network-only.
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
