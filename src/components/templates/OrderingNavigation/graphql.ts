import { graphql } from "@/lib/api/gql";

export const orderingNavigationTemplateFragment = graphql(`
  fragment OrderingNavigationTemplateFragment on OrderingTemplateInstance {
    hidden
    orderingDefinition: definition {
      background
      width
    }
    orderingPair {
      exists
    }
    ...NavButtonsFragment
  }
`);
