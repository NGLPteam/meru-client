import { graphql } from "@/lib/api/gql";

// Search page selections. The filter config is what the page shell needs
// up-front; the results themselves are fetched by the SearchResults server
// island (see SearchResults.astro) so a slow search never blocks the page —
// the shell renders immediately with a loading fallback in the results cell.
export const searchLayoutFragment = graphql(`
  fragment SearchLayoutFragment on Query {
    searchFilters: search {
      ...SearchFiltersFragment
    }
  }
`);

export const searchLayoutEntityFragment = graphql(`
  fragment SearchLayoutEntityFragment on Entity {
    id
    searchFilters: search {
      ...SearchFiltersFragment
    }
  }
`);

export const globalSearchQuery = graphql(`
  query globalSearchQuery {
    ...SearchLayoutFragment
  }
`);

export const globalSearchResultsQuery = graphql(`
  query globalSearchResultsQuery(
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    search {
      results(
        query: $query
        page: $page
        perPage: 20
        predicates: $predicates
        order: $order
        schema: $schema
      ) {
        ...SearchResultsFragment
      }
    }
  }
`);

export const collectionSearchResultsQuery = graphql(`
  query collectionSearchResultsQuery(
    $slug: Slug!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    collection(slug: $slug) {
      search {
        results(
          query: $query
          page: $page
          perPage: 20
          predicates: $predicates
          order: $order
          schema: $schema
        ) {
          ...SearchResultsFragment
        }
      }
    }
  }
`);

export const communitySearchResultsQuery = graphql(`
  query communitySearchResultsQuery(
    $slug: Slug!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    community(slug: $slug) {
      search {
        results(
          query: $query
          page: $page
          perPage: 20
          predicates: $predicates
          order: $order
          schema: $schema
        ) {
          ...SearchResultsFragment
        }
      }
    }
  }
`);
