import { graphql } from "@/lib/api/gql";

export const heroTemplateFragment = graphql(`
  fragment HeroTemplateFragment on HeroLayoutInstance {
    entity {
      ... on Community {
        __typename
      }
    }
    ...CommunityHeroHeaderFragment
    ...EntityHeroHeaderFragment
  }
`);
