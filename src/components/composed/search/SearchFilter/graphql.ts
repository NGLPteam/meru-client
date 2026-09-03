import { graphql } from "@/lib/api/gql";

export const searchFilterFragment = graphql(`
  fragment SearchFilterFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators

    ... on ScalarProperty {
      type
    }

    ... on SelectProperty {
      options {
        label
        value
      }
    }
  }
`);
