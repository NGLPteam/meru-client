import { graphql } from "@/lib/api/gql";

export const blurbTemplateFragment = graphql(`
  fragment BlurbTemplateFragment on BlurbTemplateInstance {
    __typename
    hidden
    blurbDefinition: definition {
      background
      width
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
