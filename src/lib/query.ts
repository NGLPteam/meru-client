import makeUrqlClient from "@/lib/api/makeUrqlClient";
import measureQuery from "@/lib/api/measureQuery";
import type { AnyVariables, DocumentInput, OperationResult } from "@urql/core";

// Phase 0 Astro server query helper. Reuses the existing urql client factory +
// measureQuery choke point; the only Astro-specific change is reading the API
// URL from import.meta.env (Vite) instead of process.env (Next). The full server
// data path (token from Astro.locals, preview, per #7) is built in a later phase.
const API_URL = import.meta.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL (import.meta.env).");

const anonymousClient = makeUrqlClient(API_URL, "network-only");

export default function query<Query, Variables extends AnyVariables = AnyVariables>(
  document: DocumentInput<Query, Variables>,
  variables: Variables,
): Promise<OperationResult<Query, Variables>> {
  return measureQuery(anonymousClient, document, variables);
}
