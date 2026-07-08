import type { CodegenConfig } from "@graphql-codegen/cli";

// graphql-codegen client-preset — generates the typed `graphql()` tag,
// TypedDocumentNode map, and fragment-masking helpers into lib/api/gql.
// This is the urql replacement for the Relay compiler (`__generated__/`).
// The existing schema-only codegen still runs via `.graphqlrc.yml`.
const config: CodegenConfig = {
  ignoreNoDocuments: true,
  schema: "./schema.graphql",
  // This glob GROWS as the Relay -> urql migration progresses (see
  // docs/relay-to-urql-migration.md). Only files already migrated to the
  // codegen `graphql()` tag may be listed here: codegen cannot parse the
  // Relay-only constructs still present in unmigrated files (@inline,
  // @arguments, @argumentDefinitions, @refetchable, readInlineData) and would
  // emit broken types for them. Add a feature's paths here as you convert it.
  documents: ["lib/api/**/*.{ts,tsx}"],
  generates: {
    "./lib/api/gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
        scalars: {
          JSON: "any",
          Slug: "string",
          UploadID: "string",
          ISO8601Date: "string",
          ISO8601DateTime: "string",
        },
      },
    },
  },
};

export default config;
