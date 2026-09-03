import { graphql } from "@/lib/api/gql";

export const metadataTemplateFragment = graphql(`
  fragment MetadataTemplateFragment on MetadataTemplateInstance {
    definition {
      background
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
      itemsA {
        ...sharedBlockSlotFragment
      }
      itemsB {
        ...sharedBlockSlotFragment
      }
      itemsC {
        ...sharedBlockSlotFragment
      }
      itemsD {
        ...sharedBlockSlotFragment
      }
    }
  }
`);
