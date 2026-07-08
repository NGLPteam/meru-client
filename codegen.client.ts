import type { CodegenConfig } from "@graphql-codegen/cli";

// graphql-codegen client-preset — generates the typed `graphql()` tag,
// TypedDocumentNode map, and fragment-masking helpers into lib/api/gql.
// This is the urql replacement for the Relay compiler (`__generated__/`).
// The existing schema-only codegen still runs via `.graphqlrc.yml`.
const config: CodegenConfig = {
  ignoreNoDocuments: true,
  schema: "./schema.graphql",
  documents: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "contexts/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "helpers/**/*.{ts,tsx}",
    "routes/**/*.{ts,tsx}",
    "_sitemaps/**/*.{ts,tsx}",
  ],
  generates: {
    "./lib/api/gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
        // Use fragment/type names verbatim. The default pascal-case transform
        // mangles acronyms (AssetPDFPreviewFragment -> ...Pdf...) and
        // lowercase-first fragment names inconsistently, producing dangling
        // generated type references.
        namingConvention: "keep",
        dedupeFragments: true,
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
