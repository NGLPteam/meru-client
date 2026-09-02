import { graphql } from "@/lib/api/gql";

export const searchFiltersFragment = graphql(`
  fragment SearchFiltersFragment on SearchScope {
    coreProperties {
      ... on SearchableProperty {
        searchPath
      }
      ...SearchFilterFragment
    }
    ...SearchSchemaFilterFragment
    schemas: availableSchemaVersions {
      searchableProperties {
        ... on SearchableProperty {
          searchPath
          label
        }
        ...SearchFilterFragment
      }
    }
  }
`);
