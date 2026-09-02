import { graphql } from "@/lib/api/gql";

export const communityNavListContentFragment = graphql(`
  fragment CommunityNavListContentFragment on Community {
    slug
    orderings(availability: ENABLED) {
      nodes {
        name
        slug
        identifier
        count
      }
    }
    pages {
      nodes {
        slug
        title
      }
    }
  }
`);

export const communityNavListFragment = graphql(`
  fragment CommunityNavListFragment on Community {
    ...CommunityNavListContentFragment
  }
`);
