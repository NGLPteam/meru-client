import { graphql } from "@/lib/api/gql";

export const contributorFragment = graphql(`
  fragment ContributorFragment on Attribution {
    roles {
      identifier
      label
    }
    contributor {
      title
      affiliation
      slug
      image {
        ...ContributorAvatarFragment
      }
      ...ContributorNameFragment
    }
  }
`);
