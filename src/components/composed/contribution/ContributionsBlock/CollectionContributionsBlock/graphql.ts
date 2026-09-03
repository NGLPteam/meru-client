import { graphql } from "@/lib/api/gql";

export const collectionContributionsBlockFragment = graphql(`
  fragment CollectionContributionsBlockFragment on Collection {
    ...BackButtonFragment

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
