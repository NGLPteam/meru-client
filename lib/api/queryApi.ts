import { anonymousClient, makeAuthorizedClient } from "./client";
import measureQuery from "./measureQuery";
import type { AnyVariables, DocumentInput, OperationResult } from "@urql/core";

type Options = {
  // Force an authenticated fetch even outside draft mode (replaces the old
  // fetchQuery `includeToken` flag).
  authAware?: boolean;
};

// Main server-side data path — the queryCraft analogue. Resolves the access
// token the same way the old lib/relay/fetchQuery did (draft mode OR an
// explicit authAware flag), picks an authorized client when a token exists,
// and routes through measureQuery. Returns urql's OperationResult directly —
// no `records` / `sessionToken` to thread through the tree.
export default async function queryApi<
  Query,
  Variables extends AnyVariables = AnyVariables,
>(
  query: DocumentInput<Query, Variables>,
  variables: Variables,
  options?: Options,
): Promise<OperationResult<Query, Variables>> {
  const { draftMode } = await import("next/headers");
  const isPreview = (await draftMode()).isEnabled;
  const needsToken = isPreview || options?.authAware;

  const token = needsToken
    ? (await (await import("@/lib/auth/initAuth")).auth())?.accessToken
    : undefined;

  const client = token ? makeAuthorizedClient(token) : anonymousClient;

  return measureQuery(client, query, variables);
}
