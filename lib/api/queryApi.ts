import { getAnonymousClient, makeAuthorizedClient } from "./client";
import measureQuery from "./measureQuery";
import type { AnyVariables, DocumentInput, OperationResult } from "@urql/core";

type Options = {
  // Force an authenticated fetch even outside draft mode (replaces the old
  // fetchQuery `includeToken` flag).
  authAware?: boolean;
  // Explicit access token. When provided, it is used directly and the draft
  // mode / auth() resolution below is skipped — the seam the Astro SSR migration
  // uses to feed a token from Astro.locals instead of next/headers.
  token?: string;
};

// Main server-side data path — the queryCraft analogue. Resolves the access
// token the same way the old lib/relay/fetchQuery did (draft mode OR an
// explicit authAware flag), picks an authorized client when a token exists,
// and routes through measureQuery. Returns urql's OperationResult directly —
// no `records` / `sessionToken` to thread through the tree.
//
// The RESULT is fully typed from the document (`Query`), but the variables
// argument is intentionally loose (`AnyVariables`): the old Relay fetchQuery
// took `Record<string, any>`, and route params here are typed
// `string | undefined` / `unknown` (see BasePageParams), so strict variable
// inference would surface pre-existing looseness across every page. Runtime
// behaviour is unchanged.
export default async function queryApi<Query>(
  query: DocumentInput<Query, AnyVariables>,
  variables: AnyVariables,
  options?: Options,
): Promise<OperationResult<Query, AnyVariables>> {
  let token = options?.token;

  if (token === undefined) {
    const { isDraftModeEnabled } = await import("@/lib/request/draftMode");
    const isPreview = await isDraftModeEnabled();
    const needsToken = isPreview || options?.authAware;

    token = needsToken
      ? (await (await import("@/lib/auth/initAuth")).auth())?.accessToken
      : undefined;
  }

  const client = token ? makeAuthorizedClient(token) : getAnonymousClient();

  return measureQuery(client, query, variables);
}
