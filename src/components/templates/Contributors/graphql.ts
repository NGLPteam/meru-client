import { graphql } from "@/lib/api/gql";

export const contributorsTemplateFragment = graphql(`
  fragment ContributorsTemplateFragment on ContributorListTemplateInstance {
    __typename
    entity {
      ... on Item {
        __typename
        slug
        attributions {
          ...ContributorFragment
        }
      }
      ... on Collection {
        __typename
        slug
        attributions {
          ...ContributorFragment
        }
      }
    }
    contributorsDefinition: definition {
      background
      limit
      width
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
    }
  }
`);
