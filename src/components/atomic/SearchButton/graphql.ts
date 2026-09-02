import { graphql } from "@/lib/api/gql";

export const searchModalFragment = graphql(`
  fragment SearchModalFragment on Entity {
    __typename
    ... on Sluggable {
      slug
    }
    ... on Entity {
      title
    }
    breadcrumbs {
      crumb {
        __typename
        ... on Sluggable {
          slug
        }
        ... on Entity {
          title
        }
      }
    }
  }
`);

export const searchButtonFragment = graphql(`
  fragment SearchButtonFragment on Entity {
    ...SearchModalFragment
  }
`);
