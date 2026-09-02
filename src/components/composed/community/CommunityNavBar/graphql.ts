import { graphql } from "@/lib/api/gql";

export const communityNavBarFragment = graphql(`
  fragment CommunityNavBarFragment on Community {
    ...CommunityNameFragment
    ...CommunityNavListFragment
  }
`);

export const communityNavBarEntityFragment = graphql(`
  fragment CommunityNavBarEntityFragment on Entity {
    ...SearchButtonFragment
  }
`);
