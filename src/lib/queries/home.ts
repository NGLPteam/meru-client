import { graphql } from "@/lib/api/gql";

// Home / instance page content: the instance hero (installation name + copy +
// search) and the list of communities. Spreads InstanceHeroFragment (on Query)
// and InstanceCommunitiesFragment (on the communities connection); the page also
// reads communities.pageInfo/edges directly for the single-community redirect.
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
