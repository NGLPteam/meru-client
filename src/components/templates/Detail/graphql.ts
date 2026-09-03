import { graphql } from "@/lib/api/gql";

export const detailTemplateFragment = graphql(`
  fragment DetailTemplateFragment on DetailTemplateInstance {
    __typename
    hidden
    detailDefinition: definition {
      background
      variant
    }
    ...SummaryDetailFragment
    ...FullDetailFragment
    ...ColumnsDetailFragment
  }
`);
