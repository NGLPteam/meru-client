import { graphql } from "@/lib/api/gql";

// Alongside the fragments, the page reads communities.pageInfo/edges directly
// for the single-community redirect.
export const instanceContentQuery = graphql(`
  query instanceContentQuery {
    communities(order: POSITION_ASCENDING) {
      edges {
        node {
          slug
        }
      }
      pageInfo {
        totalCount
      }
      ...InstanceCommunitiesFragment
    }
    ...InstanceHeroFragment
  }
`);
