import { graphql } from "@/lib/api/gql";

export const fullDetailFragment = graphql(`
  fragment FullDetailFragment on DetailTemplateInstance {
    entity {
      ... on Item {
        __typename
        heroImage {
          storage
          ...ContentImageFragment
        }
      }
      ... on Collection {
        __typename
        heroImage {
          storage
          ...ContentImageFragment
        }
      }
    }
    detailDefinition: definition {
      showBody
      showHeroImage
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
      subheader {
        ...sharedInlineSlotFragment
      }
      body {
        ...sharedBlockSlotFragment
      }
    }
  }
`);
