import { graphql } from "@/lib/api/gql";

export const searchSchemaFilterFragment = graphql(`
  fragment SearchSchemaFilterFragment on SearchScope {
    schemas: availableSchemaVersions {
      name
      namespace
      schemaDefinition {
        slug
      }
    }
  }
`);
