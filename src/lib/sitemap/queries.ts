import { graphql } from "@/lib/api/gql";

// Sitemap enumeration. Meru's Query root exposes only `communities` as a list;
// collections and items are reached per-community via `descendants`, each
// paginated at perPage 200 (the API cap).

// Drives both the index (nested descendant pageCounts tell it how many child
// sitemaps to emit per community) and the communities child sitemap
// (slug/updatedAt per page).
export const sitemapCommunitiesQuery = graphql(`
  query sitemapCommunitiesQuery($page: Int) {
    communities(page: $page, perPage: 200) {
      pageInfo {
        pageCount
      }
      nodes {
        slug
        updatedAt
        collections: descendants(scope: COLLECTION, perPage: 200) {
          pageInfo {
            pageCount
          }
        }
        items: descendants(scope: ITEM, perPage: 200) {
          pageInfo {
            pageCount
          }
        }
      }
    }
  }
`);

export const sitemapCollectionsQuery = graphql(`
  query sitemapCollectionsQuery($slug: Slug!, $page: Int) {
    community(slug: $slug) {
      descendants(scope: COLLECTION, page: $page, perPage: 200) {
        nodes {
          descendant {
            ... on Collection {
              slug
              updatedAt
            }
          }
        }
      }
    }
  }
`);

// NOTE (API data issue): EntityDescendant.descendant is non-nullable, but the
// API can return null for it on a dangling item edge (seen in sandbox). One bad
// node nulls the whole page via non-null propagation, so that 200-item page is
// dropped from the sitemap (the endpoint degrades to an empty <urlset> rather
// than erroring). Revisit if/when the API stops returning null descendants.
export const sitemapItemsQuery = graphql(`
  query sitemapItemsQuery($slug: Slug!, $page: Int) {
    community(slug: $slug) {
      descendants(scope: ITEM, page: $page, perPage: 200) {
        nodes {
          descendant {
            ... on Item {
              slug
              updatedAt
            }
          }
        }
      }
    }
  }
`);
