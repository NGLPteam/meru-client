import makeUrqlClient from "./makeUrqlClient";
import type { RequestPolicy } from "@urql/core";

export function getAPIURL(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  throw new Error("Missing process.env.NEXT_PUBLIC_API_URL.");
}

// Anonymous singleton used for the vast majority of (cached) server fetches.
export const anonymousClient = makeUrqlClient(getAPIURL(), "network-only");

// Token-scoped client, built on demand for draft-mode / authenticated fetches.
export function makeAuthorizedClient(
  token: string,
  requestPolicy: RequestPolicy = "network-only",
) {
  return makeUrqlClient(getAPIURL(), requestPolicy, {
    headers: { authorization: `Bearer ${token}` },
  });
}
