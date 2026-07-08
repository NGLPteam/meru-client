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
  const { draftMode } = await import("next/headers");
  const isPreview = (await draftMode()).isEnabled;
  const needsToken = isPreview || options?.authAware;

  const token = needsToken
    ? (await (await import("@/lib/auth/initAuth")).auth())?.accessToken
    : undefined;

  const client = token ? makeAuthorizedClient(token) : anonymousClient;

  return measureQuery(client, query, variables);
}
