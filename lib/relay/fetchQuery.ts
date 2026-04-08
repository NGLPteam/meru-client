import {
  OperationType,
  GraphQLTaggedNode,
  fetchQuery as relayFetch,
} from "relay-runtime";
import { getCurrentEnvironment } from "./environment";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function fetchQuery<Q extends OperationType>(
  query: GraphQLTaggedNode,
  vars: Record<string, any>,
  includeToken?: boolean,
) {
  const { draftMode } = await import("next/headers");
  const { auth } = await import("@/lib/auth/initAuth");
  const isPreview = (await draftMode()).isEnabled;
  const session = await auth();
  const sessionToken =
    isPreview || includeToken ? session?.accessToken : undefined;
  const env = getCurrentEnvironment({ sessionToken });

  const data = await relayFetch<Q>(env, query, vars, {
    networkCacheConfig: { force: false },
  })
    .toPromise()
    .then((result) => {
      return result;
    });

  const records = env.getStore().getSource().toJSON();

  return { data, records, sessionToken };
}
