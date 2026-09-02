import { graphql } from "@/lib/api/gql";

export const breadcrumbsFragment = graphql(`
  fragment BreadcrumbsFragment on Entity {
    __typename
    title
    breadcrumbs {
      depth
      ...BreadcrumbLinkFragment
    }

    ... on Sluggable {
      slug
    }
  }
`);
