import { graphql } from "@/lib/api/gql";

// Fetched by the OrderingList server island rather than the browse routes: the
// ordering selection is by far the slowest on browse pages, so the shell
// renders immediately and the list streams in behind a loading fallback.
export const collectionOrderingQuery = graphql(`
  query collectionOrderingQuery(
    $slug: Slug!
    $identifier: String!
    $page: Int
  ) {
    collection(slug: $slug) {
      ordering(identifier: $identifier) {
        disabled
        ...EntityOrderingLayoutFragment
      }
    }
  }
`);

export const communityOrderingQuery = graphql(`
  query communityOrderingQuery($slug: Slug!, $identifier: String!, $page: Int) {
    community(slug: $slug) {
      ordering(identifier: $identifier) {
        disabled
        ...EntityOrderingLayoutFragment
      }
    }
  }
`);

export const entityOrderingLayoutFragment = graphql(`
  fragment EntityOrderingLayoutFragment on Ordering {
    id
    name
    header
    render {
      mode
    }
    entity {
      __typename
      ... on Sluggable {
        slug
      }
      ...BackButtonFragment
    }
    children(page: $page) {
      edges {
        node {
          id
          entry {
            ... on Sluggable {
              slug
            }
            ...EntitySummaryFragment
          }
        }
      }
      pageInfo {
        ...BrowseListLayoutFragment
      }
      ...BrowseTreeLayoutFragment
    }
  }
`);
