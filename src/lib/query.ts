import { getAnonymousClient, makeAuthorizedClient } from "@/lib/api/client";
import measureQuery from "@/lib/api/measureQuery";
import type { AnyVariables, DocumentInput, OperationResult } from "@urql/core";

// Astro server query helper. Anonymous by default (public SSR — the shared
// network-only-in-prod / cache-first-in-dev singleton); pass a token to force a
// Bearer-authorized, network-only fetch for authed/preview requests. Pages feed
// `Astro.locals.session?.accessToken` (populated by the auth middleware) here.
// Both paths funnel through measureQuery; env + request-policy resolution live
// once in lib/api/client (getAPIURL supports import.meta.env and process.env).
export default function query<Query, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Query, Variables>,
  variables: Variables,
  token?: string,
): Promise<OperationResult<Query, Variables>> {
  const client = token ? makeAuthorizedClient(token) : getAnonymousClient();
  return measureQuery(client, document, variables);
}
