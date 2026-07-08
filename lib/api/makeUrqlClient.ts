import {
  createClient,
  fetchExchange,
  cacheExchange,
  type ClientOptions,
} from "@urql/core";

// Factory for a plain @urql/core client. Server-side callers (queryApi) use
// this directly; the client-side React Provider builds its own client with a
// token-aware fetchOptions closure. Kept intentionally small — no normalized
// cache, no ssrExchange. See docs/relay-to-urql-migration.md.
export default function makeUrqlClient(
  url: ClientOptions["url"],
  requestPolicy: ClientOptions["requestPolicy"] = "network-only",
  fetchOptions?: ClientOptions["fetchOptions"],
) {
  return createClient({
    url,
    exchanges: [cacheExchange, fetchExchange],
    requestPolicy,
    fetchOptions,
    // The Meru API only accepts POST; urql defaults queries to GET, so force
    // POST for every operation (matches the old Relay network layer).
    preferGetMethod: false,
  });
}
