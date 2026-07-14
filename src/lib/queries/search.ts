import { graphql } from "@/lib/api/gql";

// Global (unscoped) search — SearchLayoutFragment on Query. SearchLayout drives
// results client-side off the URL params; this seeds the initial render.
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
