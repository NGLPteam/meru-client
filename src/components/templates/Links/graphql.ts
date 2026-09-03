import { graphql } from "@/lib/api/gql";

export const linksTemplateFragment = graphql(`
  fragment LinksTemplateFragment on AnyMainTemplateInstance {
    ... on LinkListTemplateInstance {
      __typename
      linksDefinition: definition {
        variant
      }
    }
    ...sharedListTemplateFragment
  }
`);
