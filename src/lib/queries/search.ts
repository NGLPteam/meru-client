import { graphql } from "@/lib/api/gql";

export const globalSearchQuery = graphql(`
  query globalSearchQuery(
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    ...SearchLayoutFragment
  }
`);
