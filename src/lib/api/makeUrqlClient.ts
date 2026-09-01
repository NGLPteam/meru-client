import {
  createClient,
  fetchExchange,
  cacheExchange,
  type Exchange,
  type ClientOptions,
} from "@urql/core";
import { requestPolicyExchange } from "@urql/exchange-request-policy";

// How long a cache-first result is reused before requestPolicyExchange upgrades
// it to cache-and-network (revalidate). Only affects cache-first clients.
const CACHE_TTL_MS = 30_000;

// Factory for a plain @urql/core client. Server-side callers (queryApi) use
// this directly; the client-side React Provider builds its own client with a
// token-aware fetchOptions closure. Kept intentionally small — no normalized
// cache, no ssrExchange. See docs/relay-to-urql-migration.md.
export default function makeUrqlClient(
  url: ClientOptions["url"],
  requestPolicy: ClientOptions["requestPolicy"] = "network-only",
  fetchOptions?: ClientOptions["fetchOptions"],
) {
  const exchanges: Exchange[] = [
    // For cache-first clients, reuse cached results for CACHE_TTL_MS then
    // revalidate — dedupes repeated public/global queries across renders.
    ...(requestPolicy === "cache-first"
      ? [
          requestPolicyExchange({
            ttl: CACHE_TTL_MS,
            shouldUpgrade: (operation) =>
              operation.context.requestPolicy === "cache-first",
          }),
        ]
      : []),
    cacheExchange,
    fetchExchange,
  ];

  return createClient({
    url,
    exchanges,
    requestPolicy,
    fetchOptions,
    // The Meru API only accepts POST; urql defaults queries to GET, so force
    // POST for every operation (matches the old Relay network layer).
    preferGetMethod: false,
  });
}
