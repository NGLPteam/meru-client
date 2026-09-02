import { graphql } from "@/lib/api/gql";

export const communityPickerNameFragment = graphql(`
  fragment CommunityPickerCommunityNameFragment on Community {
    title
  }
`);

export const communityPickerFragment = graphql(`
  fragment CommunityPickerFragment on Query {
    pickerCommunities: communities(order: POSITION_ASCENDING) {
      edges {
        node {
          slug
          title
        }
      }
    }
  }
`);
