import type {
  AnyVariables,
  Client,
  DocumentInput,
  OperationResult,
} from "@urql/core";

// Single choke point every query flows through: times the request, logs
// GraphQL errors, and rejects on network errors (mirrors the old
// lib/relay/network.ts behaviour of throwing when the response failed).
export default async function measureQuery<
  Query,
  Variables extends AnyVariables = AnyVariables,
>(
  client: Client,
  query: DocumentInput<Query, Variables>,
  vars: Variables,
): Promise<OperationResult<Query, Variables>> {
  const start = performance.now();
  const result = await client.query(query, vars).toPromise();
  const duration = performance.now() - start;

  const prefix = `[urql][q:${extractQueryName(query)}]`;
  console.warn(`${prefix} took ${duration.toFixed(3)} ms`);

  if (result.error) {
    console.warn(prefix, result.error.message);

    for (const gqlError of result.error.graphQLErrors) {
      console.warn(prefix, "GraphQLError", gqlError);
    }

    const { networkError } = result.error;
    if (networkError) {
      console.warn(prefix, "NetworkError", networkError);
      return Promise.reject(
        new Error(`Network Error halted: ${networkError.message}`),
      );
    }
  }

  return result;
}

function extractQueryName(query: DocumentInput): string | null {
  if (typeof query !== "string") {
    const defn = query.definitions[0];
    if (defn?.kind === "OperationDefinition" && defn.name) {
      return defn.name.value;
    }
  }
  return null;
}
