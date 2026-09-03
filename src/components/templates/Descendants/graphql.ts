import { graphql } from "@/lib/api/gql";

export const descendantsTemplateFragment = graphql(`
  fragment DescendantsTemplateFragment on AnyMainTemplateInstance {
    ... on DescendantListTemplateInstance {
      entity {
        __typename
        ... on Sluggable {
          slug
        }
      }
      descendantsDefinition: definition {
        variant
      }
    }
    ...sharedListTemplateFragment
  }
`);
