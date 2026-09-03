import { graphql } from "@/lib/api/gql";

export const contributionsBlockFragment = graphql(`
  fragment ContributionsBlockFragment on Item {
    attributions {
      slug
      roles {
        label
      }
      contributor {
        image {
          storage
        }
      }
      ...ContributorFragment
    }
  }
`);
