import { graphql } from "@/lib/api/gql";

export const breadcrumbsBarFragment = graphql(`
  fragment BreadcrumbsBarFragment on Entity {
    __typename
    title
    ... on Sluggable {
      slug
    }
    ... on Permalinkable {
      permalinks {
        canonical
        uri
      }
    }
    schemaVersion {
      name
      identifier
    }
    submissionTarget {
      state
    }
    ...BreadcrumbsFragment
  }
`);
