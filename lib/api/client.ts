import makeUrqlClient from "./makeUrqlClient";
import type { RequestPolicy } from "@urql/core";

export function getAPIURL(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  throw new Error("Missing process.env.NEXT_PUBLIC_API_URL.");
}

// Anonymous singleton used for the vast majority of (public) server fetches.
// In production, route-level caching (revalidate) handles reuse, so stay
// network-only (avoids stale/unbounded caching in the long-lived server
// process). In dev there's no route cache, so use cache-first with a TTL to
// dedupe repeated public/global queries (theme, global config, etc.) across
// renders/navigations. Authed & preview fetches always stay network-only.
export const anonymousClient = makeUrqlClient(
  getAPIURL(),
  process.env.NODE_ENV === "production" ? "network-only" : "cache-first",
);

// Token-scoped client, built on demand for draft-mode / authenticated fetches.
export function makeAuthorizedClient(
  token: string,
  requestPolicy: RequestPolicy = "network-only",
) {
  return makeUrqlClient(getAPIURL(), requestPolicy, {
    headers: { authorization: `Bearer ${token}` },
  });
}
