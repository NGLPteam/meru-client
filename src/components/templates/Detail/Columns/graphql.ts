import { graphql } from "@/lib/api/gql";

export const columnsDetailFragment = graphql(`
  fragment ColumnsDetailFragment on DetailTemplateInstance {
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
